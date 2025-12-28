<?php
// api/apply_phase3_schema.php
// Adjusted path for Docker environment where this file is at root /var/www/html/
require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    echo "Applying Phase 3 Schema Changes...\n";

    // 1. Create Categories Table
    $db->exec("
        CREATE TABLE IF NOT EXISTS categories (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(100) UNIQUE NOT NULL,
            icon VARCHAR(50),
            parent_id VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "✅ Created 'categories' table.\n";

    // 2. Add category_id to products if not exists
    $stmt = $db->query("SHOW COLUMNS FROM products LIKE 'category_id'");
    if ($stmt->rowCount() == 0) {
        $db->exec("
            ALTER TABLE products 
            ADD COLUMN category_id VARCHAR(50),
            ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
        ");
        echo "✅ Added 'category_id' column to 'products'.\n";
    } else {
        echo "ℹ️ 'category_id' column already exists.\n";
    }

    // 3. Seed Categories
    $categories = [
        ['id' => 'women', 'name' => 'Women', 'icon' => 'shirt'],
        ['id' => 'men', 'name' => 'Men', 'icon' => 'user'],
        ['id' => 'kids', 'name' => 'Kids', 'icon' => 'baby'],
        ['id' => 'home', 'name' => 'Home', 'icon' => 'home'],
        ['id' => 'tech', 'name' => 'Electronics', 'icon' => 'smartphone'],
        ['id' => 'ent', 'name' => 'Entertainment', 'icon' => 'gamepad-2'],
        ['id' => 'beauty', 'name' => 'Beauty', 'icon' => 'sparkles'],
    ];

    $stmt = $db->prepare("INSERT INTO categories (id, name, slug, icon) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=name");
    
    foreach ($categories as $cat) {
        $stmt->execute([$cat['id'], $cat['name'], $cat['id'], $cat['icon']]);
    }
    echo "✅ Seeded " . count($categories) . " categories.\n";

    // 4. Migrate existing products
    $db->exec("UPDATE products SET category_id = category WHERE category_id IS NULL AND category IS NOT NULL");
    echo "✅ Migrated existing products to use category_id.\n";

    echo "🎉 Phase 3 Schema Applied Successfully.\n";

} catch (PDOException $e) {
    die("❌ Database Error: " . $e->getMessage() . "\n");
}
?>
