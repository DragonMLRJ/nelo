<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $action = $_GET['action'] ?? 'create';
        if ($action === 'create') {
            createOrder();
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
    $data = getJsonInput();
    
    // Validation
    if (empty($data['buyerId']) || empty($data['items']) || empty($data['shippingAddress'])) {
        sendResponse(['error' => 'Missing required fields'], 400);
    }
    
    try {
        $db = getDB();
        $db->beginTransaction();
        
        // Group items by seller (marketplace model often splits orders by seller)
        $itemsBySeller = [];
        foreach ($data['items'] as $item) {
            $stmt = $db->prepare("SELECT seller_id, title, price, image, currency FROM products WHERE id = ?");
            $stmt->execute([$item['productId']]);
            $product = $stmt->fetch();
            
            if (!$product) {
                throw new Exception("Product ID {$item['productId']} not found");
            }
            
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
            $totalAmount = 0;
            $currency = 'XAF'; // Default, ideally take from first product
            
            foreach ($items as $item) {
                $totalAmount += $item['product']['price'] * $item['quantity'];
                $currency = $item['product']['currency'];
            }
            
            // Generate Order Number
            $orderNumber = 'ORD-' . strtoupper(uniqid());
            
            // Insert Order
            $stmt = $db->prepare("
                INSERT INTO orders (
                    order_number, buyer_id, seller_id, total_amount, currency, 
                    status, shipping_address, payment_method, payment_status
                ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, 'completed')
            ");
            
            $stmt->execute([
                $orderNumber,
                $data['buyerId'],
                $sellerId,
                $totalAmount,
                $currency,
                $data['shippingAddress'],
                $data['paymentMethod'] ?? 'card'
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
    $userId = $_GET['userId'] ?? null;
    $role = $_GET['role'] ?? 'buyer'; // 'buyer' or 'seller'
    
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
    $data = getJsonInput();
    
    if (empty($data['orderId']) || empty($data['status'])) {
        sendResponse(['error' => 'Order ID and Status are required'], 400);
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

