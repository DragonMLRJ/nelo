<?php
require_once __DIR__ . '/config/database.php';
try {
    $db = getDB();
    echo "--- Schemas ---\n";
    $tables = ['categories', 'products'];
    foreach ($tables as $t) {
        echo "Table: $t\n";
        $stmt = $db->query("DESCRIBE $t");
        if ($stmt) {
            $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($cols as $c) {
                echo "  {$c['Field']} - {$c['Type']}\n";
            }
        } else {
            echo "  (Not found)\n";
        }
    }
} catch (Exception $e) { echo $e->getMessage(); }
?>
