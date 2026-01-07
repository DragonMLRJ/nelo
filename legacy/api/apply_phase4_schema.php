<?php
// api/apply_phase4_schema.php
require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    echo "Applying Phase 4 Schema Changes...\n";

    // 1. Product Images Table
    $db->exec("
        CREATE TABLE IF NOT EXISTS product_images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            image_url VARCHAR(500) NOT NULL,
            display_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "✅ Created 'product_images' table.\n";

    // 2. Wishlists Table (Ensure it matches requirements)
    // Note: The original schema had a 'wishlists' table but check if it exists
    $db->exec("
        CREATE TABLE IF NOT EXISTS wishlists (
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, product_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "✅ Verified 'wishlists' table.\n";

    // 3. Notifications Table (Persistent)
    $db->exec("
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(50) NOT NULL, -- 'system', 'order', 'offer', 'review'
            title VARCHAR(255),
            message TEXT,
            link VARCHAR(255),
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "✅ Created 'notifications' table.\n";

    echo "🎉 Phase 4 Schema Applied Successfully.\n";

} catch (PDOException $e) {
    die("❌ Database Error: " . $e->getMessage() . "\n");
}
?>
