<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'get') {
            getCart();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    case 'POST':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'add') {
            addToCart();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    case 'PUT':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'update') {
            updateCartItem();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    case 'DELETE':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'remove') {
            removeFromCart();
        } elseif ($action === 'clear') {
            clearCart();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

/**
 * Get user's cart with product details
 */
function getCart() {
    // SECURITY CHECK: Verify Token
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) {
        sendResponse(['error' => 'Unauthorized Access'], 401);
    }

    $userId = $authUserId; // Force use of authenticated ID
    
    if (!$userId) {
        sendResponse(['error' => 'User ID is required'], 400);
    }
    
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            SELECT 
                c.id,
                c.product_id,
                c.quantity,
                c.created_at,
                p.title,
                p.price,
                p.image,
                p.user_id as seller_id,
                u.name as seller_name,
                (p.price * c.quantity) as subtotal
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        ");
        
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();
        
        // Calculate totals
        $total = 0;
        $itemCount = 0;
        
        foreach ($items as &$item) {
            $total += $item['subtotal'];
            $itemCount += $item['quantity'];
            
            // Format for frontend
            $item['id'] = (string)$item['id'];
            $item['product_id'] = (string)$item['product_id'];
            $item['quantity'] = (int)$item['quantity'];
            $item['price'] = (float)$item['price'];
            $item['subtotal'] = (float)$item['subtotal'];
            $item['seller_id'] = (string)$item['seller_id'];
        }
        
        sendResponse([
            'success' => true,
            'items' => $items,
            'total' => (float)$total,
            'itemCount' => $itemCount
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Add item to cart
 */
function addToCart() {
    // SECURITY CHECK: Verify Token
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) {
        sendResponse(['error' => 'Unauthorized Access'], 401);
    }

    $data = getJsonInput();
    $userId = $authUserId;
    $productId = $data['productId'] ?? null;
    $quantity = $data['quantity'] ?? 1;
    
    if (!$userId || !$productId) {
        sendResponse(['error' => 'User ID and Product ID are required'], 400);
    }
    
    if ($quantity < 1) {
        sendResponse(['error' => 'Quantity must be at least 1'], 400);
    }
    
    try {
        $db = getDB();
        
        // Check if product exists
        $stmt = $db->prepare("SELECT id, title, price FROM products WHERE id = ?");
        $stmt->execute([$productId]);
        $product = $stmt->fetch();
        
        if (!$product) {
            sendResponse(['error' => 'Product not found'], 404);
        }
        
        // Check if item already in cart
        $stmt = $db->prepare("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, $productId]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Update quantity
            $newQuantity = $existing['quantity'] + $quantity;
            $stmt = $db->prepare("UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$newQuantity, $existing['id']]);
            
            sendResponse([
                'success' => true,
                'message' => 'Cart updated',
                'cartItemId' => (string)$existing['id'],
                'quantity' => $newQuantity
            ]);
        } else {
            // Insert new item
            $stmt = $db->prepare("
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$userId, $productId, $quantity]);
            $cartItemId = $db->lastInsertId();
            
            sendResponse([
                'success' => true,
                'message' => 'Item added to cart',
                'cartItemId' => (string)$cartItemId,
                'quantity' => $quantity
            ], 201);
        }
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Update cart item quantity
 */
function updateCartItem() {
    // SECURITY CHECK: Verify Token
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) {
        sendResponse(['error' => 'Unauthorized Access'], 401);
    }

    $data = getJsonInput();
    $cartItemId = $data['cartItemId'] ?? null;
    $quantity = $data['quantity'] ?? null;
    $userId = $authUserId; // FORCE AUTH ID
    
    if (!$cartItemId || !$quantity) {
        sendResponse(['error' => 'Cart Item ID and quantity are required'], 400);
    }
    
    if ($quantity < 1) {
        sendResponse(['error' => 'Quantity must be at least 1'], 400);
    }
    
    try {
        $db = getDB();
        
        // Verify ownership
        $stmt = $db->prepare("SELECT id FROM cart_items WHERE id = ? AND user_id = ?");
        $stmt->execute([$cartItemId, $userId]);
        
        if (!$stmt->fetch()) {
            sendResponse(['error' => 'Cart item not found'], 404);
        }
        
        // Update quantity
        $stmt = $db->prepare("UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$quantity, $cartItemId]);
        
        sendResponse([
            'success' => true,
            'message' => 'Cart item updated',
            'quantity' => $quantity
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Remove item from cart
 */
function removeFromCart() {
    // SECURITY CHECK: Verify Token
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) {
        sendResponse(['error' => 'Unauthorized Access'], 401);
    }

    $cartItemId = $_GET['cartItemId'] ?? null;
    $userId = $authUserId; // FORCE AUTH ID
    
    if (!$cartItemId) {
        sendResponse(['error' => 'Cart Item ID is required'], 400);
    }
    
    try {
        $db = getDB();
        
        // Verify ownership and delete
        $stmt = $db->prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?");
        $stmt->execute([$cartItemId, $userId]);
        
        if ($stmt->rowCount() === 0) {
            sendResponse(['error' => 'Cart item not found'], 404);
        }
        
        sendResponse([
            'success' => true,
            'message' => 'Item removed from cart'
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Clear entire cart
 */
function clearCart() {
    // SECURITY CHECK: Verify Token
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) {
        sendResponse(['error' => 'Unauthorized Access'], 401);
    }

    $userId = $authUserId; // FORCE AUTH ID
    
    try {
        $db = getDB();
        
        $stmt = $db->prepare("DELETE FROM cart_items WHERE user_id = ?");
        $stmt->execute([$userId]);
        
        sendResponse([
            'success' => true,
            'message' => 'Cart cleared',
            'deletedCount' => $stmt->rowCount()
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Helper function to get JSON input
 */
