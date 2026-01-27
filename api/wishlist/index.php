<?php
// api/wishlist/index.php
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

// Auth Check (JWT)
$headers = getallheaders();
$authUserId = JWT::getUserIdFromHeader();

if (!$authUserId) {
    sendResponse(['error' => 'Unauthorized Access'], 401);
}

$userId = $authUserId;

switch($method) {
    case 'GET':
        // Action: IDs only or Full List
        $action = $_GET['action'] ?? 'ids';
        
        if ($action === 'ids') {
            $stmt = $db->prepare("SELECT product_id FROM wishlists WHERE user_id = ?");
            $stmt->execute([$userId]);
            $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
            sendResponse(['ids' => $ids]);
        } elseif ($action === 'list') {
            // Fetch full products
            $sql = "SELECT p.*, 
                           u.name as seller_name,
                           u.avatar as seller_avatar,
                           u.is_verified as seller_verified,
                           c.name as category_name
                    FROM wishlists w
                    JOIN products p ON w.product_id = p.id
                    JOIN users u ON p.seller_id = u.id
                    LEFT JOIN categories c ON p.category_id = c.id
                    WHERE w.user_id = ?";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([$userId]);
            $products = $stmt->fetchAll();
            
            // Format logic (reused from products/index.php - simplified)
            $formatted = array_map(function($p) {
                return [
                    'id' => (string)$p['id'],
                    'title' => $p['title'],
                    'price' => (float)$p['price'],
                    'currency' => $p['currency'],
                    'image' => $p['image'],
                    'category' => $p['category'],
                    'seller' => [
                        'id' => (string)$p['seller_id'],
                        'name' => $p['seller_name'],
                        'avatar' => $p['seller_avatar'],
                        'isVerified' => (bool)$p['seller_verified']
                    ],
                    'likes' => (int)$p['likes'],
                    'postedAt' => $p['posted_at'],
                    'location' => $p['location']
                ];
            }, $products);
            
            sendResponse(['products' => $formatted]);
        }
        break;

    case 'POST':
        // Toggle Wishlist
        $data = json_decode(file_get_contents('php://input'), true);
        $productId = $data['product_id'] ?? null;
        
        if (!$productId) sendResponse(['error' => 'Product ID required'], 400);
        
        // Check if exists
        $stmt = $db->prepare("SELECT 1 FROM wishlists WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, $productId]);
        
        if ($stmt->fetch()) {
            // Remove
            $stmt = $db->prepare("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$userId, $productId]);
            sendResponse(['status' => 'removed']);
        } else {
            // Add
            $stmt = $db->prepare("INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)");
            $stmt->execute([$userId, $productId]);
            sendResponse(['status' => 'added']);
        }
        break;
}
?>
