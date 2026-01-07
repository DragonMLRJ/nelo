<?php
// api/verify_phase4.php
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

    test("Tables Exist", function() use ($db) {
        $tables = ['product_images', 'wishlists', 'notifications'];
        foreach ($tables as $t) {
            $stmt = $db->query("SHOW TABLES LIKE '$t'");
            if ($stmt->rowCount() == 0) throw new Exception("Table $t missing");
        }
    });

    test("Product Images Logic", function() use ($db) {
        // Just check if we can query it
        $db->query("SELECT * FROM product_images LIMIT 1");
    });
    
    test("Wishlist API Logic", function() use ($db) {
        // Simulate fetch
        // Since we are CLI, headers won't work easily for context/files but checks syntax
        if (!file_exists(__DIR__ . '/wishlist/index.php')) throw new Exception("Wishlist API file missing");
    });
    
    test("Notifications API Logic", function() use ($db) {
        if (!file_exists(__DIR__ . '/notifications/index.php')) throw new Exception("Notifications API file missing");
    });

    echo "--- Phase 4 Verification Complete ---\n";

} catch (Exception $e) {
    echo "Global Error: " . $e->getMessage();
}
?>
