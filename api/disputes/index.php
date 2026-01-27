<?php
require_once '../config/database.php';
require_once '../classes/AuthMiddleware.php';
require_once '../classes/Validator.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();
$userId = AuthMiddleware::authenticate(); // Enforce Login

switch ($method) {
    case 'POST':
        $action = $_GET['action'] ?? '';
        if ($action === 'create') {
            createDispute($db, $userId);
        } elseif ($action === 'message') {
            addMessage($db, $userId);
        } elseif ($action === 'resolve') {
            resolveDispute($db, $userId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
        break;

    case 'GET':
        $action = $_GET['action'] ?? '';
        if ($action === 'detail') {
            getDisputeDetail($db, $userId);
        } else {
            listDisputes($db, $userId);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function createDispute($db, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validation
    if (empty($data['order_id']) || empty($data['reason'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Order ID and Reason are required']);
        exit;
    }

    // Verify ownership of order
    $stmt = $db->prepare("SELECT seller_id, buyer_id FROM orders WHERE id = ?");
    $stmt->execute([$data['order_id']]);
    $order = $stmt->fetch();

    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
        exit;
    }

    if ($order['buyer_id'] !== $userId) {
        http_response_code(403);
        echo json_encode(['error' => 'Only the buyer can open a dispute']);
        exit;
    }

    // Check if dispute already exists
    $stmt = $db->prepare("SELECT id FROM disputes WHERE order_id = ?");
    $stmt->execute([$data['order_id']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'A dispute already exists for this order']);
        exit;
    }

    try {
        $stmt = $db->prepare("
            INSERT INTO disputes (order_id, created_by, seller_id, reason, description, status)
            VALUES (?, ?, ?, ?, ?, 'open')
        ");
        $stmt->execute([
            $data['order_id'],
            $userId,
            $order['seller_id'],
            $data['reason'],
            $data['description'] ?? ''
        ]);

        echo json_encode(['success' => true, 'message' => 'Dispute created successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create dispute']);
    }
}

function listDisputes($db, $userId) {
    // Return disputes where user is buyer OR seller
    $stmt = $db->prepare("
        SELECT d.*, o.product_id, 
               (SELECT title FROM products WHERE id = o.product_id) as product_name
        FROM disputes d
        JOIN orders o ON d.order_id = o.id
        WHERE d.created_by = ? OR d.seller_id = ?
        ORDER BY d.created_at DESC
    ");
    $stmt->execute([$userId, $userId]);
    $disputes = $stmt->fetchAll();
    
    echo json_encode($disputes);
}

function getDisputeDetail($db, $userId) {
    $disputeId = $_GET['id'] ?? '';
    
    if (empty($disputeId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Dispute ID required']);
        exit;
    }

    // Get Dispute Info (Secure)
    $stmt = $db->prepare("SELECT * FROM disputes WHERE id = ? AND (created_by = ? OR seller_id = ?)");
    $stmt->execute([$disputeId, $userId, $userId]);
    $dispute = $stmt->fetch();

    if (!$dispute) {
        http_response_code(404);
        echo json_encode(['error' => 'Dispute not found or access denied']);
        exit;
    }

    // Get Messages
    $stmt = $db->prepare("
        SELECT dm.*, u.full_name as sender_name 
        FROM dispute_messages dm
        JOIN users u ON dm.sender_id = u.id
        WHERE dm.dispute_id = ?
        ORDER BY dm.created_at ASC
    ");
    $stmt->execute([$disputeId]);
    $messages = $stmt->fetchAll();

    echo json_encode(['dispute' => $dispute, 'messages' => $messages]);
}

function addMessage($db, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);
    $disputeId = $data['dispute_id'] ?? '';
    $message = $data['message'] ?? '';

    if (empty($disputeId) || empty($message)) {
        http_response_code(400);
        echo json_encode(['error' => 'Dispute ID and Message required']);
        exit;
    }

    // Verify Access
    $stmt = $db->prepare("SELECT id FROM disputes WHERE id = ? AND (created_by = ? OR seller_id = ?)");
    $stmt->execute([$disputeId, $userId, $userId]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    // Insert Message
    $stmt = $db->prepare("
        INSERT INTO dispute_messages (dispute_id, sender_id, message, attachment_url)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$disputeId, $userId, $message, $data['attachment_url'] ?? null]);

    // Update Dispute Status (e.g., if seller replies, set to 'seller_replied')
    // Logic: If sender is seller and status is 'open', change to 'seller_replied'
    // Simplified for now: just touch updated_at
    $db->prepare("UPDATE disputes SET updated_at = NOW() WHERE id = ?")->execute([$disputeId]);

    echo json_encode(['success' => true]);
}

function resolveDispute($db, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);
    $disputeId = $data['dispute_id'] ?? '';
    $resolution = $data['resolution'] ?? ''; // 'refund' or 'close'

    // Only Seller (or Admin) can resolve with Refund. Buyer can Close.
    $stmt = $db->prepare("SELECT * FROM disputes WHERE id = ?");
    $stmt->execute([$disputeId]);
    $dispute = $stmt->fetch();

    if (!$dispute) {
        http_response_code(404);
        echo json_encode(['error' => 'Dispute not found']);
        exit;
    }

    if ($resolution === 'refund') {
        if ($dispute['seller_id'] !== $userId) { // Admin check omitted for brevity
             http_response_code(403);
             echo json_encode(['error' => 'Only seller can issue refund']);
             exit;
        }
        $newStatus = 'resolved_refund';
        // TODO: Trigger Refund Logic here (Stripe/Wallet)
    } elseif ($resolution === 'close') {
        if ($dispute['created_by'] !== $userId) {
             http_response_code(403);
             echo json_encode(['error' => 'Only buyer can close the dispute without refund']);
             exit;
        }
        $newStatus = 'resolved_no_refund';
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid resolution type']);
        exit;
    }

    $stmt = $db->prepare("UPDATE disputes SET status = ? WHERE id = ?");
    $stmt->execute([$newStatus, $disputeId]);

    echo json_encode(['success' => true, 'status' => $newStatus]);
}
?>
