<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'conversations') {
            getConversations();
        } elseif ($action === 'messages') {
            getMessages();
        } elseif ($action === 'search') {
            searchMessages();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    case 'POST':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'send') {
            sendMessage();
        } elseif ($action === 'create_conversation') {
            createConversation();
        } elseif ($action === 'mark_read') {
            markAsRead();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

/**
 * Get all conversations for the current user
 */
function getConversations() {
    $data = getJsonInput();
    // SECURITY CHECK: Verify Token
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) {
        sendResponse(['error' => 'Unauthorized Access'], 401);
    }
    
    // Only allow accessing own conversations
    $userId = $authUserId; 
    
    if (!$userId) {
        sendResponse(['error' => 'User ID is required'], 400);
    }
    
    try {
        $db = getDB();
        
        // Get all unique conversations (sender-receiver pairs with optional product)
        $stmt = $db->prepare("
            SELECT 
                ANY_VALUE(m.sender_id) as sender_id,
                ANY_VALUE(m.receiver_id) as receiver_id,
                ANY_VALUE(m.product_id) as product_id,
                MAX(m.created_at) as last_message_at,
                COUNT(CASE WHEN m.is_read = 0 AND m.receiver_id = ? THEN 1 END) as unread_count
            FROM messages m
            WHERE m.sender_id = ? OR m.receiver_id = ?
            GROUP BY 
                LEAST(m.sender_id, m.receiver_id),
                GREATEST(m.sender_id, m.receiver_id),
                m.product_id
            ORDER BY last_message_at DESC
        ");
        
        $stmt->execute([$userId, $userId, $userId]);
        $conversations = $stmt->fetchAll();
        
        $result = [];
        
        foreach ($conversations as $conv) {
            // Determine the other participant
            $otherUserId = ($conv['sender_id'] == $userId) ? $conv['receiver_id'] : $conv['sender_id'];
            
            // Get other user details
            $userStmt = $db->prepare("SELECT id, name, avatar, is_verified FROM users WHERE id = ?");
            $userStmt->execute([$otherUserId]);
            $otherUser = $userStmt->fetch();
            
            if (!$otherUser) continue; // Skip if user not found
            
            // Get current user details
            $currentUserStmt = $db->prepare("SELECT id, name, avatar, is_verified FROM users WHERE id = ?");
            $currentUserStmt->execute([$userId]);
            $currentUser = $currentUserStmt->fetch();
            
            // Get last message
            $lastMsgStmt = $db->prepare("
                SELECT content 
                FROM messages 
                WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
                  AND (product_id = ? OR (product_id IS NULL AND ? IS NULL))
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $lastMsgStmt->execute([
                $conv['sender_id'], $conv['receiver_id'],
                $conv['receiver_id'], $conv['sender_id'],
                $conv['product_id'], $conv['product_id']
            ]);
            $lastMsg = $lastMsgStmt->fetch();
            
            // Get product details if exists
            $productName = null;
            $productImage = null;
            if ($conv['product_id']) {
                $prodStmt = $db->prepare("SELECT title, image FROM products WHERE id = ?");
                $prodStmt->execute([$conv['product_id']]);
                $product = $prodStmt->fetch();
                if ($product) {
                    $productName = $product['title'];
                    $productImage = $product['image'];
                }
            }
            
            // Create conversation ID
            $convId = min($userId, $otherUserId) . '_' . max($userId, $otherUserId);
            if ($conv['product_id']) {
                $convId .= '_' . $conv['product_id'];
            }
            
            $result[] = [
                'id' => $convId,
                'participants' => [
                    [
                        'id' => (string)$otherUser['id'],
                        'name' => $otherUser['name'],
                        'avatar' => $otherUser['avatar'],
                        'isVerified' => (bool)$otherUser['is_verified']
                    ],
                    [
                        'id' => (string)$currentUser['id'],
                        'name' => $currentUser['name'],
                        'avatar' => $currentUser['avatar'],
                        'isVerified' => (bool)$currentUser['is_verified']
                    ]
                ],
                'productId' => $conv['product_id'] ? (string)$conv['product_id'] : null,
                'productName' => $productName,
                'productImage' => $productImage,
                'lastMessageAt' => $conv['last_message_at'],
                'unreadCount' => (int)$conv['unread_count'],
                'lastMessage' => $lastMsg ? $lastMsg['content'] : 'Started a conversation',
                'messages' => [] // Will be loaded separately
            ];
        }
        
        sendResponse([
            'success' => true,
            'conversations' => $result
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Get messages for a specific conversation
 */
function getMessages() {
    $conversationId = $_GET['conversation_id'] ?? null;
    $userId = $_GET['userId'] ?? null;
    
    if (!$conversationId || !$userId) {
        sendResponse(['error' => 'Conversation ID and User ID are required'], 400);
    }
    
    try {
        // Parse conversation ID (format: user1_user2 or user1_user2_productId)
        $parts = explode('_', $conversationId);
        $user1 = $parts[0];
        $user2 = $parts[1];
        $productId = isset($parts[2]) ? $parts[2] : null;
        
        $db = getDB();
        
        // Get all messages between these two users for this product context
        if ($productId) {
            $stmt = $db->prepare("
                SELECT id, sender_id, receiver_id, content, attachment_url, attachment_type, is_read, created_at
                FROM messages
                WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
                  AND product_id = ?
                ORDER BY created_at ASC
            ");
            $stmt->execute([$user1, $user2, $user2, $user1, $productId]);
        } else {
            $stmt = $db->prepare("
                SELECT id, sender_id, receiver_id, content, attachment_url, attachment_type, is_read, created_at
                FROM messages
                WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
                  AND product_id IS NULL
                ORDER BY created_at ASC
            ");
            $stmt->execute([$user1, $user2, $user2, $user1]);
        }
        
        $messages = $stmt->fetchAll();
        
        $result = [];
        foreach ($messages as $msg) {
            $result[] = [
                'id' => (string)$msg['id'],
                'text' => $msg['content'],
                'attachmentUrl' => $msg['attachment_url'],
                'attachmentType' => $msg['attachment_type'],
                'senderId' => (string)$msg['sender_id'],
                'timestamp' => $msg['created_at'],
                'isRead' => (bool)$msg['is_read']
            ];
        }
        
        sendResponse([
            'success' => true,
            'messages' => $result
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Send a new message
 */
function sendMessage() {
    // SECURITY CHECK: Verify Token
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) {
        sendResponse(['error' => 'Unauthorized Access'], 401);
    }

    $data = getJsonInput();
    $senderId = $authUserId; // FORCE AUTH ID
    $receiverId = $data['receiverId'] ?? null;
    $content = $data['content'] ?? '';
    $productId = $data['productId'] ?? null;
    $attachmentUrl = $data['attachmentUrl'] ?? null;
    $attachmentType = $data['attachmentType'] ?? null;
    
    if (!$receiverId) {
        sendResponse(['error' => 'Receiver ID is required'], 400);
    }
    
    try {
        $db = getDB();
        
        $stmt = $db->prepare("
            INSERT INTO messages (sender_id, receiver_id, product_id, content, attachment_url, attachment_type, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, NOW())
        ");
        
        $stmt->execute([$senderId, $receiverId, $productId, $content, $attachmentUrl, $attachmentType]);
        $messageId = $db->lastInsertId();
        
        // Fetch the created message
        $stmt = $db->prepare("SELECT * FROM messages WHERE id = ?");
        $stmt->execute([$messageId]);
        $message = $stmt->fetch();
        
        sendResponse([
            'success' => true,
            'message' => [
                'id' => (string)$message['id'],
                'text' => $message['content'],
                'attachmentUrl' => $message['attachment_url'],
                'attachmentType' => $message['attachment_type'],
                'senderId' => (string)$message['sender_id'],
                'timestamp' => $message['created_at'],
                'isRead' => (bool)$message['is_read']
            ]
        ], 201);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Create a new conversation (or get existing one)
 */
function createConversation() {
    $data = getJsonInput();
    $userId = $data['userId'] ?? null;
    $otherUserId = $data['otherUserId'] ?? null;
    $productId = $data['productId'] ?? null;
    
    if (!$userId || !$otherUserId) {
        sendResponse(['error' => 'User ID and Other User ID are required'], 400);
    }
    
    // Create conversation ID
    $convId = min($userId, $otherUserId) . '_' . max($userId, $otherUserId);
    if ($productId) {
        $convId .= '_' . $productId;
    }
    
    sendResponse([
        'success' => true,
        'conversationId' => $convId
    ], 201);
}

/**
 * Mark messages as read
 */
function markAsRead() {
    $data = getJsonInput();
    $conversationId = $data['conversationId'] ?? null;
    $userId = $data['userId'] ?? null;
    
    if (!$conversationId || !$userId) {
        sendResponse(['error' => 'Conversation ID and User ID are required'], 400);
    }
    
    try {
        // Parse conversation ID
        $parts = explode('_', $conversationId);
        $user1 = $parts[0];
        $user2 = $parts[1];
        $productId = isset($parts[2]) ? $parts[2] : null;
        
        $db = getDB();
        
        // Mark all messages in this conversation as read where current user is receiver
        if ($productId) {
            $stmt = $db->prepare("
                UPDATE messages 
                SET is_read = 1 
                WHERE receiver_id = ? 
                  AND sender_id IN (?, ?)
                  AND product_id = ?
                  AND is_read = 0
            ");
            $stmt->execute([$userId, $user1, $user2, $productId]);
        } else {
            $stmt = $db->prepare("
                UPDATE messages 
                SET is_read = 1 
                WHERE receiver_id = ? 
                  AND sender_id IN (?, ?)
                  AND product_id IS NULL
                  AND is_read = 0
            ");
            $stmt->execute([$userId, $user1, $user2]);
        }
        
        sendResponse([
            'success' => true,
            'updated' => $stmt->rowCount()
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}
