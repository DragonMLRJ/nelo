<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    $email = 'jjmassoukou|@gmail.com';
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo "User found: " . print_r($user, true);
        // Also check if there are any other users to fallback to
        $stmt = $db->query("SELECT id, name, email, role FROM users LIMIT 5");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "\nFirst 5 users in DB:\n" . print_r($users, true);
    } else {
        echo "User '$email' NOT FOUND.\n";
        // List all users to see what's there
        $stmt = $db->query("SELECT id, name, email, role FROM users LIMIT 10");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Listing first 10 users:\n" . print_r($users, true);
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
