<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    echo "Connected to DB\n";

    // 1. Create categories table
    $sql = "CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    $db->exec($sql);
    echo "Categories table created/checked\n";

    // 2. Insert default categories
    $sql = "INSERT INTO categories (name, slug, icon) VALUES 
    ('Fashion', 'fashion', 'shirt'),
    ('Electronics', 'tech', 'smartphone'),
    ('Home', 'home', 'home'),
    ('Beauty', 'beauty', 'sparkles'),
    ('Sports', 'sports', 'dumbbell'),
    ('Toys', 'toys', 'gamepad'),
    ('Vehicles', 'vehicles', 'car'),
    ('Other', 'other', 'box')
    ON DUPLICATE KEY UPDATE name=name;";
    $db->exec($sql);
    echo "Categories inserted\n";

    // 3. Add category_id to products if not exists
    // Check if column exists
    $stmt = $db->prepare("SHOW COLUMNS FROM products LIKE 'category_id'");
    $stmt->execute();
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE products ADD COLUMN category_id INT AFTER category");
        $db->exec("ALTER TABLE products ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL");
        echo "Added category_id to products\n";
        
        // Backfill category_id based on category slug
        $db->exec("UPDATE products p JOIN categories c ON p.category = c.slug SET p.category_id = c.id WHERE p.category_id IS NULL");
        echo "Backfilled category_id\n";
    } else {
        echo "category_id already exists in products\n";
    }
    
    // 4. Create product_images table (since we saw it used in index.php)
    $sql = "CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    $db->exec($sql);
    echo "Product Images table created/checked\n";

} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage() . "\n");
}
