<?php
// api/admin/index.php
// CENTRALIZED ADMIN COMMAND CENTER
// PROTECTED BY IRON DOME (AdminMiddleware)

require_once __DIR__ . '/../classes/AdminMiddleware.php';
require_once __DIR__ . '/../config/database.php';

// 1. STRICT AUTHENTICATION & AUDITING
$adminId = AdminMiddleware::authenticate();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$db = getDB();

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if ($action === 'ban_user') {
            banUser($db, $adminId, $data);
        } elseif ($action === 'delete_product') {
            forceDeleteProduct($db, $adminId, $data);
        } elseif ($action === 'refund_order') {
            processRefund($db, $adminId, $data);
        } else {
            throw new Exception("Invalid Action");
        }
    } elseif ($method === 'GET') {
        if ($action === 'audit_logs') {
            viewAuditLogs($db, $adminId);
        } elseif ($action === 'server_status') {
             echo json_encode(['status' => 'secure', 'timestamp' => time()]);
        }
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

// --- ADMIN ACTIONS ---

function banUser($db, $adminId, $data) {
    $targetId = $data['user_id'] ?? null;
    $reason = $data['reason'] ?? 'Violation of Terms';

    if (!$targetId) throw new Exception("Target User ID required");

    // Prevent Self-Ban
    if ($targetId == $adminId) throw new Exception("You cannot ban yourself.");

    // Update User
    $stmt = $db->prepare("UPDATE users SET is_verified = 0, name = CONCAT('[BANNED] ', name) WHERE id = ?");
    $stmt->execute([$targetId]);

    // Log it
    AdminMiddleware::logAction($adminId, 'BAN_USER', "User:$targetId", "Reason: $reason");

    echo json_encode(['success' => true, 'message' => "User $targetId has been banned."]);
}

function forceDeleteProduct($db, $adminId, $data) {
    $productId = $data['product_id'] ?? null;
    if (!$productId) throw new Exception("Product ID required");

    // Delete
    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$productId]);

    // Log it
    AdminMiddleware::logAction($adminId, 'DELETE_PRODUCT', "Product:$productId", "Force deletion by Admin");

    echo json_encode(['success' => true, 'message' => "Product $productId deleted."]);
}

function viewAuditLogs($db, $adminId) {
    // Read-Only Access to Logs
    $stmt = $db->query("SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 50");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Log that someone viewed the logs (Meta-Audit)
    AdminMiddleware::logAction($adminId, 'VIEW_LOGS', 'admin_audit_logs', 'Accessed recent logs');

    echo json_encode(['success' => true, 'logs' => $logs]);
}

function processRefund($db, $adminId, $data) {
    // Placeholder for complex refund logic
    $orderId = $data['order_id'] ?? null;
    if (!$orderId) throw new Exception("Order ID required");

    $stmt = $db->prepare("UPDATE orders SET status = 'cancelled', payment_status = 'refunded' WHERE id = ?");
    $stmt->execute([$orderId]);

    AdminMiddleware::logAction($adminId, 'REFUND_ORDER', "Order:$orderId", "Automatic Refund Triggered");

    echo json_encode(['success' => true, 'message' => "Order $orderId refunded."]);
}
?>
