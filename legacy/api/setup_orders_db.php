<?php
require_once 'config/database.php';

try {
    $db = getDB();
    
    // 1. Update orders table structure
    // We need to check if columns exist before adding them to avoid errors on re-run
    // Or simpler: We can just use ADD COLUMN IF NOT EXISTS logic if MySQL version supports it (8.0+ does)
    // For wider compatibility, we'll try to add and catch errors or just alter.
    
    $alterQueries = [
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(50) AFTER id",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id INT NOT NULL AFTER buyer_id",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER seller_id",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'XAF' AFTER total_amount",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'card'",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending'",
        "ALTER TABLE orders MODIFY COLUMN product_id INT NULL", // Legacy support, make nullable
        "ALTER TABLE orders DROP COLUMN IF EXISTS total", // Replaced by total_amount
    ];

    echo "Updating orders table...<br>";
    
    foreach ($alterQueries as $q) {
        try {
            $db->exec($q);
            echo "Executed: $q <br>";
        } catch(PDOException $e) {
            echo "Skipped/Error (might already exist): $q - " . $e->getMessage() . "<br>";
        }
    }
    
    // 2. Create order_items table
    $createOrderItems = "
    CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        product_snapshot JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $db->exec($createOrderItems);
    echo "Created order_items table.<br>";
    
    echo "<h3>Migration Completed Successfully!</h3>";
    
} catch(PDOException $e) {
    echo "<h3>Fatal Error: " . $e->getMessage() . "</h3>";
}
