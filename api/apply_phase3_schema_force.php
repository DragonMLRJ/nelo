<?php
// api/apply_phase3_schema_force.php
require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    echo "Applying Phase 3 Schema Changes (FORCE)...\n";

    // 0. Drop Foreign Key on products.category_id if exists/incompatible
    try {
        // Try to find the constraint name or just try standard names
        // Ideally we query information_schema but let's try dropping the column modification first which implies dropping FK
        // Try to drop likely FK names
        $db->exec("ALTER TABLE products DROP FOREIGN KEY fk_product_category"); 
    } catch (Exception $e) {}

    try {
         $db->exec("ALTER TABLE products DROP FOREIGN KEY fk_products_category"); 
    } catch (Exception $e) {}

    // 1. Drop existing categories table (incompatible INT id)
    $db->exec("DROP TABLE IF EXISTS categories");
    echo "✅ Dropped old 'categories' table.\n";

    // 2. Create Categories Table (VARCHAR id)
    $db->exec("
        CREATE TABLE categories (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(100) UNIQUE NOT NULL,
            icon VARCHAR(50),
            parent_id VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "✅ Created new 'categories' table.\n";

    // 3. Modify products.category_id to VARCHAR(50)
    $db->exec("ALTER TABLE products MODIFY category_id VARCHAR(50)");
    echo "✅ Modified products.category_id to VARCHAR(50).\n";

    // 3.5 Reset category_id to NULL to avoid FK violation with old data
    $db->exec("UPDATE products SET category_id = NULL");
    echo "✅ Reset products.category_id to NULL.\n";

    // 4. Add FK
    $db->exec("ALTER TABLE products ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL");
    echo "✅ Added Foreign Key to products.\n";

    // 5. Seed Categories
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

    // 6. Migrate existing products
    $db->exec("UPDATE products SET category_id = category WHERE category_id IS NULL AND category IS NOT NULL");
    echo "✅ Migrated existing products to use category_id.\n";

    echo "🎉 Schema Fixed Successfully.\n";

} catch (PDOException $e) {
    die("❌ Database Error: " . $e->getMessage() . "\n");
}
?>
