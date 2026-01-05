<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Including database.php...\n";
try {
    require_once __DIR__ . '/config/database.php';
    echo "Database included successfully.\n";
    
    echo "Checking Validator class...\n";
    if (class_exists('Validator')) {
        echo "Validator exists.\n";
    } else {
        echo "Validator INVALID.\n";
    }
    
    echo "Checking RateLimiter class...\n";
    if (class_exists('RateLimiter')) {
        echo "RateLimiter exists.\n";
    } else {
        echo "RateLimiter INVALID.\n";
    }

} catch (Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
?>
