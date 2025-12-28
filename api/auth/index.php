<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'login') {
            login();
        } elseif ($action === 'register') {
            register();
        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    case 'GET':
        checkSession();
        break;
        
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function login() {
    $data = getJsonInput();
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        sendResponse(['error' => 'Email and password are required'], 400);
    }
    
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            sendResponse(['error' => 'Invalid credentials'], 401);
        }
        
        // Verify password
        if (!password_verify($password, $user['password'])) {
            sendResponse(['error' => 'Invalid credentials'], 401);
        }
        
        // Remove password from response
        unset($user['password']);
        
        // Convert database fields to match frontend User type
        $userData = [
            'id' => (string)$user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'avatar' => $user['avatar'],
            'location' => $user['location'],
            'isAdmin' => (bool)$user['is_admin'],
            'isVerified' => (bool)$user['is_verified'],
            'memberSince' => (string)$user['member_since'],
            'responseRate' => $user['response_rate']
        ];
        
        sendResponse([
            'success' => true,
            'user' => $userData
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function register() {
    $data = getJsonInput();
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $name = $data['name'] ?? '';
    $location = $data['location'] ?? 'Brazzaville';
    
    if (empty($email) || empty($password) || empty($name)) {
        sendResponse(['error' => 'Email, password, and name are required'], 400);
    }
    
    try {
        $db = getDB();
        
        // Check if user already exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            sendResponse(['error' => 'Email already registered'], 409);
        }
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $db->prepare("
            INSERT INTO users (email, password, name, location, avatar) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $avatar = 'https://picsum.photos/100/100?random=' . rand(1, 1000);
        $stmt->execute([$email, $hashedPassword, $name, $location, $avatar]);
        
        $userId = $db->lastInsertId();
        
        // Fetch the created user
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        unset($user['password']);
        
        // Convert to frontend format
        $userData = [
            'id' => (string)$user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'avatar' => $user['avatar'],
            'location' => $user['location'],
            'isAdmin' => (bool)$user['is_admin'],
            'isVerified' => (bool)$user['is_verified'],
            'memberSince' => (string)$user['member_since'],
            'responseRate' => $user['response_rate']
        ];
        
        sendResponse([
            'success' => true,
            'user' => $userData
        ], 201);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function checkSession() {
    // For now, just return a simple response
    // In a real app, you'd check session/token
    sendResponse(['authenticated' => false]);
}
