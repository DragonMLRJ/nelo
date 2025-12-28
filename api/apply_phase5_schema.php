<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    echo "Applying Phase 5 Schema Changes...\n";

    // 1. Create Rate Limits Table
    echo "Creating rate_limits table... ";
    $sql = "CREATE TABLE IF NOT EXISTS rate_limits (
        `key` VARCHAR(255) PRIMARY KEY,
        `attempts` INT DEFAULT 1,
        `reset_at` TIMESTAMP,
        INDEX idx_reset (`reset_at`)
    )";
    $db->exec($sql);
    echo "✅\n";

    // 2. Add Indexes to Products Table
    // Helper to check if index exists to avoid errors on re-run
    function addIndex($db, $table, $indexName, $columns) {
        // Check if index exists
        $check = $db->query("SHOW INDEX FROM $table WHERE Key_name = '$indexName'");
        if ($check->rowCount() == 0) {
            echo "Adding index $indexName to $table... ";
            $db->exec("CREATE INDEX $indexName ON $table ($columns)");
            echo "✅\n";
        } else {
            echo "Index $indexName already exists on $table.\n";
        }
    }

    addIndex($db, 'products', 'idx_products_category', 'category_id');
    addIndex($db, 'products', 'idx_products_price', 'price');
    // For title search, a standard B-Tree index helps with 'LIKE "term%"' but FULLTEXT is better for natural language.
    // Given the simple LIKE %...% usage, standard index might not help much for leading wildcards.
    // However, for implementation plan compliance, we add it. 
    // Ideally, we move to FULLTEXT later.
    addIndex($db, 'products', 'idx_products_title', 'title');
    addIndex($db, 'products', 'idx_products_location', 'location');

    // 3. Add Indexes to Notifications (for performance)
    addIndex($db, 'notifications', 'idx_notif_user', 'user_id, is_read');

    echo "Phase 5 Schema Applied Successfully.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
