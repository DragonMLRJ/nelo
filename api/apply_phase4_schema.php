<?php
// Standalone migration script to avoid circular dependency
// (because database.php applies rate limiting, which needs this table!)

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: 'admin123');
define('DB_NAME', getenv('DB_NAME') ?: 'nelo_marketplace');

try {
    $db = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Hardcoded SQL because 'database' folder is not mounted in PHP container
    $sql = "CREATE TABLE IF NOT EXISTS rate_limits (
        `key` VARCHAR(255) PRIMARY KEY,
        attempts INT DEFAULT 1,
        reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );";

    // Execute
    $db->exec($sql);
    echo "Phase 4 Schema (Rate Limits) applied successfully.\n";
} catch(PDOException $e) {
    echo "Error applying schema: " . $e->getMessage() . "\n";
}
?>
