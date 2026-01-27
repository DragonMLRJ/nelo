<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
// SECURITY: Defaults removed to prevent accidental exposure of dev credentials in production.
// Ensure these environment variables are set in your deployment platform (Vercel/Docker/Apache).
define('DB_CONNECTION', getenv('DB_CONNECTION') ?: 'mysql');
define('DB_HOST', getenv('DB_HOST'));
define('DB_USER', getenv('DB_USER'));
define('DB_PASS', getenv('DB_PASS'));
define('DB_NAME', getenv('DB_NAME'));

if (!DB_HOST || !DB_USER || !DB_NAME) {
    // Fail securely if config is missing
    error_log("Critical: Database configuration missing.");
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error']);
    exit();
}

// Create database connection
function getDB() {
    try {
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ];

        // Add SSL if configured (Required for Aiven/Azure/AWS)
        if (getenv('DB_SSL_CA')) {
            $options[PDO::MYSQL_ATTR_SSL_CA] = getenv('DB_SSL_CA');
            $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
        }

        if (DB_CONNECTION === 'pgsql') {
            $dsn = "pgsql:host=" . DB_HOST . ";port=" . (getenv('DB_PORT') ?: 5432) . ";dbname=" . DB_NAME;
        } else {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        }

        $conn = new PDO(
            $dsn,
            DB_USER,
            DB_PASS,
            $options
        );
        return $conn;
    } catch(PDOException $e) {
        // SECURITY: Log the detailed error but NEVER expose it to the client
        error_log("Database Connection Error: " . $e->getMessage());
        http_response_code(500);
        // Generic message for security
        echo json_encode(['error' => 'Service temporarily unavailable']);
        exit();
    }
}

// Helper function to send JSON response
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

// Helper function to get JSON input
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

// Security & Classes Autoload
require_once __DIR__ . '/../classes/Validator.php';
require_once __DIR__ . '/../classes/RateLimiter.php';
require_once __DIR__ . '/../classes/JWT.php';

// Global Rate Limit Check (IP-based)
// Limit: 100 requests per minute per IP
// DISABLED FOR VERCEL DEPLOYMENT (No local MySQL)
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
try {
    $rateDb = getDB(); 
    $limiter = new RateLimiter($rateDb, "ip:" . $ip, 100, 60); // 100 req/min
    if (!$limiter->check()) {
        http_response_code(429);
        echo json_encode(['error' => 'Too Many Requests']);
        exit();
    }
} catch (Exception $e) {
    // Fail open
}
?>
