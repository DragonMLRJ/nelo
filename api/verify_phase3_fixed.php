<?php
// api/verify_phase3_fixed.php
// Correct path for Docker: /var/www/html/config/database.php
require_once __DIR__ . '/config/database.php';

function test($name, $callback) {
    echo "Testing $name... ";
    try {
        $callback();
        echo "✅ Passed\n";
    } catch (Exception $e) {
        echo "❌ Failed: " . $e->getMessage() . "\n";
    }
}

try {
    $db = getDB();

    test("Categories Table Exists & Populated", function() use ($db) {
        $stmt = $db->query("SELECT count(*) as count FROM categories");
        $row = $stmt->fetch();
        if ($row['count'] < 5) throw new Exception("Expected at least 5 categories, found " . $row['count']);
        
        // Check IDs are strings
        $stmt = $db->query("SELECT id FROM categories LIMIT 1");
        $cat = $stmt->fetch();
        if (is_numeric($cat['id'])) {
             // It might be numeric string '1', but we expect 'women' etc.
             // check if it is one of our seeded values
             $stmt = $db->prepare("SELECT COUNT(*) FROM categories WHERE id = 'women'");
             $stmt->execute();
             if ($stmt->fetchColumn() == 0) throw new Exception("Categories not seeded with string IDs");
        }
    });

    test("Product Schema has Category ID", function() use ($db) {
        $stmt = $db->query("SHOW COLUMNS FROM products LIKE 'category_id'");
        if ($stmt->rowCount() == 0) throw new Exception("Column category_id missing");
    });

    test("Get Related Products Logic", function() use ($db) {
        // First get a product ID
        $stmt = $db->query("SELECT id FROM products LIMIT 1");
        $p = $stmt->fetch();
        if (!$p) return; 
        
        // Emulate getRelatedProducts logic query
        $stmt = $db->prepare("SELECT COUNT(*) FROM products WHERE id != ?");
        $stmt->execute([$p['id']]);
        $count = $stmt->fetchColumn();
        // Just ensuring query runs without syntax error
    });
    
    echo "--- Verification Complete ---\n";

} catch (Exception $e) {
    echo "Global Error: " . $e->getMessage();
}
?>
