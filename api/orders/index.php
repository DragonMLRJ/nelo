<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $action = $_GET['action'] ?? 'create';
        if ($action === 'create') {
            createOrder();
        } elseif ($action === 'verify_pickup') {
            verifyPickup();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    case 'GET':
        $action = $_GET['action'] ?? 'list';
        if ($action === 'list') {
            getUserOrders();
        } elseif ($action === 'details') {
            getOrderDetails();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    case 'PUT':
        updateOrderStatus();
        break;
        
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

/**
 * Create a new order (Checkout)
 */
function createOrder() {
    // SECURITY CHECK: Verify Token
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) {
        sendResponse(['error' => 'Unauthorized Access'], 401);
    }

    $data = getJsonInput();
    
    // Validation
    $deliveryMethod = $data['deliveryMethod'] ?? 'shipping'; // default shipping
    
    // Address validation only if shipping
    if ($deliveryMethod === 'shipping' && (empty($data['buyerId']) || empty($data['items']) || empty($data['shippingAddress']))) {
        sendResponse(['error' => 'Missing required fields (Address required for shipping)'], 400);
    }
    
    // Pickup Code Logic
    $pickupCode = null;
    if ($deliveryMethod === 'pickup') {
        $pickupCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $data['shippingAddress'] = 'Local Pickup'; // Placeholder
        $data['city'] = 'Local';
        $data['postalCode'] = '00000';
    }

    // CRITICAL: Prevent impersonation
    if ((string)$data['buyerId'] !== (string)$authUserId) {
        sendResponse(['error' => 'Forbidden: Cannot create order for another user'], 403);
    }
    
    try {
        $db = getDB();
        $db->beginTransaction();
        
        // Group items by seller (marketplace model often splits orders by seller)
        $itemsBySeller = [];
        foreach ($data['items'] as $item) {
            // VALIDATION: Quantity must be positive
            if ($item['quantity'] < 1) {
                sendResponse(['error' => 'Invalid quantity for Product ID ' . $item['productId']], 400);
            }

            // SECURITY: Select stock_quantity to check availability
            $stmt = $db->prepare("SELECT seller_id, title, price, image, currency, stock_quantity FROM products WHERE id = ? FOR UPDATE");
            $stmt->execute([$item['productId']]);
            $product = $stmt->fetch();
            
            if (!$product) {
                throw new Exception("Product ID {$item['productId']} not found");
            }

            if ($product['stock_quantity'] < $item['quantity']) {
                throw new Exception("Product '{$product['title']}' is out of stock (Requested: {$item['quantity']}, Available: {$product['stock_quantity']})");
            }
            
            // ATOMIC DECREMENT will happen in the loop below to minimize lock time/complexity ratio, 
            // but since we locked rows 'FOR UPDATE', we are effectively safe here until commit.
            // Actually, let's do the decrement logic when processing the order.
            
            $sellerId = $product['seller_id'];
            if (!isset($itemsBySeller[$sellerId])) {
                $itemsBySeller[$sellerId] = [];
            }
            
            $itemsBySeller[$sellerId][] = [
                'product' => $product,
                'quantity' => $item['quantity'],
                'productId' => $item['productId']
            ];
        }
        
        $createdOrderIds = [];
        
        // Store order details for notifications
        $notificationDetails = [];
        
        foreach ($itemsBySeller as $sellerId => $items) {
            // Calculate total
            // CHECK: Prevent Self-Dealing (Buying own product)
            if ((string)$sellerId === (string)$data['buyerId']) {
                 throw new Exception("You cannot buy your own products.");
            }

            foreach ($items as $item) {
                // LOGIC: Ensure all items in this sub-order have same currency
                if ($currency !== 'XAF' && $currency !== $item['product']['currency']) {
                    // Logic simplification: First item sets currency? 
                    // Or if we found different currencies in same seller group?
                    // The initialized $currency = 'XAF' is wrong if first item is USD.
                    // Let's fix loop logic.
                }
                
                // Better Logic:
                // Initialize currency from first item
                if ($totalAmount == 0) {
                     $currency = $item['product']['currency'];
                } elseif ($currency !== $item['product']['currency']) {
                     throw new Exception("Cannot mix currencies in a single order.");
                }

                $totalAmount += $item['product']['price'] * $item['quantity'];
            }
            
            // Generate Order Number
            $orderNumber = 'ORD-' . strtoupper(uniqid());
            
            // Determine payment status
            $paymentMethod = $data['paymentMethod'] ?? 'card';
            
            // SECURITY: Never automatically mark 'card' as 'completed' without a callback/webhook.
            // For this version, all payments must be 'pending' until verified by Payment Gateway Webhook.
            $paymentStatus = 'pending'; 

            // Insert Order
            $stmt = $db->prepare("
                INSERT INTO orders (
                    order_number, buyer_id, seller_id, total_amount, currency, 
                    status, shipping_address, payment_method, payment_status,
                    delivery_method, pickup_code
                ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $orderNumber,
                $data['buyerId'],
                $sellerId,
                $totalAmount,
                $currency,
                $data['shippingAddress'],
                $paymentMethod,
                $paymentStatus,
                $deliveryMethod,
                $pickupCode
            ]);
            
            $orderId = $db->lastInsertId();
            $createdOrderIds[] = $orderId;
            
            // Capture details for email
            $notificationDetails[] = [
                'orderNumber' => $orderNumber,
                'totalAmount' => $totalAmount,
                'currency' => $currency,
                'items' => $items,
                'shippingAddress' => $data['shippingAddress'],
                'paymentMethod' => $data['paymentMethod'] ?? 'card'
            ];
            
            // Insert Order Items
            $itemStmt = $db->prepare("
                INSERT INTO order_items (
                    order_id, product_id, quantity, unit_price, subtotal, product_snapshot
                ) VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            foreach ($items as $item) {
                $unitPrice = $item['product']['price'];
                $subtotal = $unitPrice * $item['quantity'];
                $snapshot = json_encode([
                    'title' => $item['product']['title'],
                    'image' => $item['product']['image']
                ]);
                
                $itemStmt->execute([
                    $orderId,
                    $item['productId'],
                    $item['quantity'],
                    $unitPrice,
                    $subtotal,
                    $snapshot
                ]);

                // ATOMIC DECREMENT STOCK
                $stockUpdate = $db->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?");
                $stockUpdate->execute([$item['quantity'], $item['productId']]);
            }
        }
        
        $db->commit();
        
        // Fetch buyer email for notification
        try {
            $buyerStmt = $db->prepare("SELECT email FROM users WHERE id = ?");
            $buyerStmt->execute([$data['buyerId']]);
            $buyerEmail = $buyerStmt->fetchColumn();
            
            if ($buyerEmail) {
                require_once __DIR__ . '/../services/EmailService.php';
                
                // Prepare aggregate order data for email (simplification: taking first order's meta, but listing all items if possible, 
                // but since we split orders by seller, we should technically send one email per seller-order or one aggregate. 
                // For simplicity, let's send one email per generated order ID).
                
                // Actually, the implementation logic above splits orders. Users typically expect one "Checkout" confirmation 
                // or individual seller confirmations. Let's send individual confirmations for now as it matches the backend structure.
                
                foreach ($notificationDetails as $detail) {
                     EmailService::sendOrderConfirmation($buyerEmail, $detail);
                }
            }
        } catch (Exception $e) {
            // detailed logging but don't fail the request
            error_log("Failed to send email: " . $e->getMessage());
        }

        // Clear cart for this user (if using db cart)
        $clearCart = $db->prepare("DELETE FROM cart_items WHERE user_id = ?");
        $clearCart->execute([$data['buyerId']]);
        
        sendResponse([
            'success' => true,
            'orderIds' => $createdOrderIds,
            'message' => 'Order(s) created successfully'
        ], 201);
        
    } catch(Exception $e) {
        $db->rollBack();
        sendResponse(['error' => 'Order creation failed: ' . $e->getMessage()], 500);
    }
}

/**
 * Get orders for a user (either as buyer or seller)
 */
function getUserOrders() {
    // SECURITY CHECK: Verify Token
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) {
        sendResponse(['error' => 'Unauthorized Access'], 401);
    }

    $userId = $_GET['userId'] ?? null;
    
    // Authorization: Users can only see their own orders unless Admin (simplified: just self check for now)
    if ((string)$userId !== (string)$authUserId) {
        sendResponse(['error' => 'Forbidden: Cannot access other users data'], 403);
    }
    
    if (!$userId) {
        sendResponse(['error' => 'User ID is required'], 400);
    }
    
    try {
        $db = getDB();
        
        $column = $role === 'seller' ? 'seller_id' : 'buyer_id';
        
        $sql = "SELECT 
                    o.*,
                    u.name as counterparty_name,
                    u.avatar as counterparty_avatar
                FROM orders o
                JOIN users u ON u.id = " . ($role === 'seller' ? 'o.buyer_id' : 'o.seller_id') . "
                WHERE o.$column = ?
                ORDER BY o.created_at DESC";
                
        $stmt = $db->prepare($sql);
        $stmt->execute([$userId]);
        $orders = $stmt->fetchAll();
        
        // Fetch items for each order to show preview
        foreach ($orders as &$order) {
            $itemStmt = $db->prepare("
                SELECT oi.*, p.title, p.image 
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            ");
            $itemStmt->execute([$order['id']]);
            $order['items'] = $itemStmt->fetchAll();
        }
        
        sendResponse([
            'success' => true,
            'orders' => $orders
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Get Single Order Details
 */
function getOrderDetails() {
    // SECURITY CHECK: Verify Token
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) {
        sendResponse(['error' => 'Unauthorized Access'], 401);
    }

    $orderId = $_GET['orderId'] ?? null;
    
    if (!$orderId) {
        sendResponse(['error' => 'Order ID is required'], 400);
    }
    
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            SELECT 
                o.*,
                buyer.name as buyer_name,
                buyer.email as buyer_email,
                seller.name as seller_name,
                seller.email as seller_email
            FROM orders o
            JOIN users buyer ON o.buyer_id = buyer.id
            JOIN users seller ON o.seller_id = seller.id
            WHERE o.id = ?
        ");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        
        if (!$order) {
            sendResponse(['error' => 'Order not found'], 404);
        }
        
        // Authorization: Check ownership
        if ((string)$authUserId !== (string)$order['buyer_id'] && (string)$authUserId !== (string)$order['seller_id']) {
            sendResponse(['error' => 'Forbidden: You do not have permission to view this order'], 403);
        }
        
        // Get items
        $itemStmt = $db->prepare("
            SELECT oi.*, p.title, p.image 
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ");
        $itemStmt->execute([$orderId]);
        $order['items'] = $itemStmt->fetchAll();
        
        sendResponse([
            'success' => true,
            'order' => $order
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Update Order Status (for sellers)
 */
function updateOrderStatus() {
    // SECURITY CHECK: Verify Token
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) {
        sendResponse(['error' => 'Unauthorized Access'], 401);
    }

    $data = getJsonInput();
    
    if (empty($data['orderId']) || empty($data['status'])) {
        sendResponse(['error' => 'Order ID and Status are required'], 400);
    }

    // SECURITY: Verify ownership (Seller only)
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT seller_id FROM orders WHERE id = ?");
        $stmt->execute([$data['orderId']]);
        $order = $stmt->fetch();

        if (!$order) {
            sendResponse(['error' => 'Order not found'], 404);
        }

        if ((string)$order['seller_id'] !== (string)$authUserId) {
            sendResponse(['error' => 'Forbidden: Only the seller can update status'], 403);
        }
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error'], 500);
    }
    
    $allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!in_array($data['status'], $allowedStatuses)) {
        sendResponse(['error' => 'Invalid status'], 400);
    }
    
    try {
        $db = getDB();
        
        $stmt = $db->prepare("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$data['status'], $data['orderId']]);
        
        sendResponse([
            'success' => true,
            'message' => 'Order status updated'
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Verify Pickup Code
 */
function verifyPickup() {
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) { sendResponse(['error' => 'Unauthorized'], 401); }

    $data = getJsonInput();
    if (empty($data['orderId']) || empty($data['code'])) { sendResponse(['error' => 'Missing fields'], 400); }

    $db = getDB();
    $stmt = $db->prepare("SELECT seller_id, delivery_method, pickup_code FROM orders WHERE id = ?");
    $stmt->execute([$data['orderId']]);
    $order = $stmt->fetch();

    if (!$order || (string)$order['seller_id'] !== (string)$authUserId) { sendResponse(['error' => 'Forbidden'], 403); }
    if ($order['delivery_method'] !== 'pickup') { sendResponse(['error' => 'Not pickup'], 400); }
    if ($order['pickup_code'] !== $data['code']) { sendResponse(['error' => 'Invalid Code'], 400); }

    $db->prepare("UPDATE orders SET status = 'completed', pickup_verified_at = NOW() WHERE id = ?")->execute([$data['orderId']]);
    sendResponse(['success' => true]);
}

