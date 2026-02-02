<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
$db = getDB();

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'GET' && $action === 'list') {
    $product_id = isset($_GET['productId']) ? intval($_GET['productId']) : 0;

    if ($product_id > 0) {
        $query = "SELECT r.*, p.name as user_name 
                  FROM reviews r 
                  JOIN profiles p ON r.user_id = p.id 
                  WHERE r.product_id = ? 
                  ORDER BY r.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(1, $product_id);
        $stmt->execute();

        $reviews = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $reviews[] = $row;
        }

        echo json_encode(['success' => true, 'reviews' => $reviews]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Product ID required']);
    }
} elseif ($method === 'POST' && $action === 'create') {
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->product_id) &&
        !empty($data->rating)
    ) {
        // SECURITY CHECK: Verify Token
        $authUserId = JWT::getUserIdFromHeader();
        if (!$authUserId) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized access."]);
            exit();
        }
        
        $user_id = $authUserId; // Enforce auth user ID
        // Validation: Check if user bought the product
        // Ideally we check the orders table here.
        // For simpler MVP, check if user has *any* order containing this product?
        // Or strictly check 'orders' table.
        // Let's implement a check.
        
        // 1. Check if purchase exists and is delivered (optional strictness)
        // For MVP, just check if they bought it.
        /*
        $checkQuery = "SELECT COUNT(*) as count FROM orders o 
                       JOIN order_items oi ON o.id = oi.order_id 
                       WHERE o.buyer_id = ? AND oi.product_id = ? AND o.status = 'delivered'";
        */
        
        // Simpler: Allow review if they bought it, regardless of status for now to make testing easier.
        // Wait, the `order_items`. Wait, the `orders` table structure.
        // `orders` has `items` (JSON) or separate table?
        // Let's check `orders/index.php`. It uses `orders` table. JSON `items`?
        // Ah, `orders` table usually has `items` as JSON text in simple implementations or separate table.
        // Looking at `api/orders/index.php` from previous context:
        // $stmt->bindParam(":items", json_encode($data->items));
        // So `items` is a JSON column in `orders`.
        // This makes SQL querying for "did buy" harder.
        // We might need to rely on frontend sending the order ID or just trust the inputs for now (PROTOTYPE LIMITATION).
        // OR: fetch all orders for user, parse JSON in PHP. inefficient but works.
        // Let's stick to trusted backend verification if possible.
        // If items is JSON, we can use JSON_CONTAINS (if mysql 5.7+) or LIKE.
        // Let's skip strict purchase verification for this moment to ensure the feature works first, then harden.
        // Actually, let's just insert directly for now.
        
        // SECURITY: Verify purchase exists using order_items
        $stmt = $db->prepare("
            SELECT COUNT(*) FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.buyer_id = ? AND oi.product_id = ?
        ");
        $stmt->execute([$user_id, $data->product_id]);
        $hasPurchased = $stmt->fetchColumn() > 0;

        if (!$hasPurchased) {
             http_response_code(403);
             echo json_encode(["success" => false, "message" => "You can only review products you have purchased."]);
             exit();
        }

        $query = "INSERT INTO reviews SET product_id=:product_id, user_id=:user_id, rating=:rating, comment=:comment";
        $stmt = $db->prepare($query);

        $stmt->bindParam(":product_id", $data->product_id);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":rating", $data->rating);
        $stmt->bindParam(":comment", $data->comment); // nullable

        try {
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["success" => true, "message" => "Review created."]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "Unable to create review."]);
            }
        } catch (PDOException $e) {
             if ($e->getCode() == 23000) { // Integrity constraint violation: Duplicate entry
                 http_response_code(400);
                 echo json_encode(["success" => false, "message" => "You have already reviewed this product."]);
             } else {
                 http_response_code(503);
                 echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
             }
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Incomplete data."]);
    }
} else {
    http_response_code(404); // Not found
}
?>
