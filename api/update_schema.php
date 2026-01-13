<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    echo "Connected to DB\n";

    // 1. Create categories table (Updated to match Phase 3 Schema - VARCHAR IDs)
    $sql = "CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50),
        parent_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    $db->exec($sql);
    echo "Categories table created/checked\n";

    // 2. Insert default categories
    $categories = [
        ['id' => 'women', 'name' => 'Fashion', 'slug' => 'fashion', 'icon' => 'shirt'],
        ['id' => 'tech', 'name' => 'Electronics', 'slug' => 'tech', 'icon' => 'smartphone'],
        ['id' => 'home', 'name' => 'Home', 'slug' => 'home', 'icon' => 'home'],
        ['id' => 'beauty', 'name' => 'Beauty', 'slug' => 'beauty', 'icon' => 'sparkles'],
        ['id' => 'sports', 'name' => 'Sports', 'slug' => 'sports', 'icon' => 'dumbbell'],
        ['id' => 'toys', 'name' => 'Toys', 'slug' => 'toys', 'icon' => 'gamepad'],
        ['id' => 'vehicles', 'name' => 'Vehicles', 'slug' => 'vehicles', 'icon' => 'car'],
        ['id' => 'other', 'name' => 'Other', 'slug' => 'other', 'icon' => 'box']
    ];

    $stmt = $db->prepare("INSERT INTO categories (id, name, slug, icon) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=name");
    
    foreach ($categories as $cat) {
        $stmt->execute([$cat['id'], $cat['name'], $cat['slug'], $cat['icon']]);
    }
    echo "Categories inserted\n";

    // 3. Add category_id to products if not exists
    // Check if column exists
    $stmt = $db->prepare("SHOW COLUMNS FROM products LIKE 'category_id'");
    $stmt->execute();
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE products ADD COLUMN category_id VARCHAR(50) AFTER category");
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
