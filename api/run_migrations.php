<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'];
$db   = $_ENV['DB_NAME'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];
$port = $_ENV['DB_PORT'];
$charset = 'utf8mb4';

$dsn = "pgsql:host=$host;port=$port;dbname=$db";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    echo "Connecting to database...\n";
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    $migrations = [
        '../supabase/migrations/11_create_disputes_table.sql',
        '../supabase/migrations/12_add_secure_handover.sql'
    ];

    foreach ($migrations as $file) {
        echo "Running " . basename($file) . "...\n";
        $sql = file_get_contents($file);
        if ($sql === false) {
             echo "Error reading file: $file\n";
             continue;
        }
        
        // Remove comments to avoid issues with some parsers, though PDO usually handles it.
        // For simplicity, we just run it.
        try {
            $pdo->exec($sql);
            echo "Successfully ran " . basename($file) . "\n";
        } catch (PDOException $e) {
            echo "Error running " . basename($file) . ": " . $e->getMessage() . "\n";
        }
    }
    echo "Done.\n";

} catch (\PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
    exit(1);
}
