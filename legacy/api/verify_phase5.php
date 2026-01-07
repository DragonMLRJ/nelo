<?php
// api/verify_phase5.php
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

    test("Rate Limits Table Exists", function() use ($db) {
        $stmt = $db->query("SHOW TABLES LIKE 'rate_limits'");
        if ($stmt->rowCount() == 0) throw new Exception("Table rate_limits missing");
    });

    test("Indexes Exist", function() use ($db) {
        $indices = ['idx_products_category', 'idx_products_price', 'idx_products_title'];
        foreach ($indices as $idx) {
             $stmt = $db->query("SHOW INDEX FROM products WHERE Key_name = '$idx'");
             if ($stmt->rowCount() == 0) throw new Exception("Index $idx missing");
        }
    });

    // Test Rate Limiter logic manually
    test("Rate Limiter Logic", function() use ($db) {
        require_once __DIR__ . '/classes/RateLimiter.php';
        $key = "test_verify_" . time();
        $limiter = new RateLimiter($db, $key, 2, 60); // Limit 2

        if (!$limiter->check()) throw new Exception("First check failed");
        if (!$limiter->check()) throw new Exception("Second check failed");
        if ($limiter->check()) throw new Exception("Third check should have failed (Limit 2)");
        
        // Clean up
        $db->exec("DELETE FROM rate_limits WHERE `key` = '$key'");
    });

    echo "--- Phase 5 Verification Complete ---\n";

} catch (Exception $e) {
    echo "Global Error: " . $e->getMessage();
}
?>
