<?php
// api/notifications/index.php
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();
$headers = getallheaders();
$userId = $headers['X-User-Id'] ?? null;

if (!$userId) sendResponse(['error' => 'Unauthorized'], 401);

switch($method) {
    case 'GET':
        // Fetch User Notifications
        $limit = $_GET['limit'] ?? 20;
        
        $sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$userId, $limit]);
        $notifications = $stmt->fetchAll();
        
        // Also fetch unread count
        $stmt = $db->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
        $stmt->execute([$userId]);
        $unread = $stmt->fetchColumn();
        
        // Count unread messages (from chats)
        $stmt = $db->prepare("SELECT COUNT(*) FROM messages m 
                              JOIN conversations c ON m.conversation_id = c.id
                              WHERE c.buyer_id = ? OR c.seller_id = ?
                              AND m.sender_id != ? AND m.is_read = 0");
        // Complex join, simplified for now: assume 'notifications' table handles System alerts.
        // Chat notifications handled via polling /api/chat/index.php normally.
        
        $formatted = array_map(function($row) {
             return [
                 'id' => (string)$row['id'],
                 'type' => $row['type'],
                 'title' => $row['title'],
                 'message' => $row['message'],
                 'isRead' => (bool)$row['is_read'],
                 'date' => $row['created_at'],
                 'link' => $row['link']
             ];
        }, $notifications);
        
        sendResponse([
            'notifications' => $formatted,
            'unreadCount' => $unread
        ]);
        break;

    case 'POST':
        // Mark as read
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['mark_read_all'])) {
            $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
            $stmt->execute([$userId]);
            sendResponse(['success' => true]);
        } elseif (isset($data['id'])) {
             $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
             $stmt->execute([$data['id'], $userId]);
             sendResponse(['success' => true]);
        }
        break;
}
?>
