<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    
    // 1. Find the latest order
    echo "--- Latest Order ---\n";
    $stmt = $db->query("SELECT o.id, o.order_number, o.status, o.total_amount, u.name as buyer_name 
                        FROM orders o 
                        JOIN users u ON o.buyer_id = u.id 
                        ORDER BY o.created_at DESC LIMIT 1");
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($order) {
        echo "Order Found: " . print_r($order, true);
        
        // 2. Update status to 'shipped'
        echo "\n--- Updating Status to 'shipped' ---\n";
        $updateStmt = $db->prepare("UPDATE orders SET status = 'shipped' WHERE id = ?");
        $updateStmt->execute([$order['id']]);
        
        // 3. Verify Update
        $stmt = $db->prepare("SELECT id, status FROM orders WHERE id = ?");
        $stmt->execute([$order['id']]);
        $updatedOrder = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "Updated Order Status: " . $updatedOrder['status'] . "\n";
        
        if ($updatedOrder['status'] === 'shipped') {
             echo "\nSUCCESS: Order status updated correctly.\n";
        } else {
             echo "\nFAILURE: Order status did not update.\n";
        }

    } else {
        echo "No orders found in the database.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
