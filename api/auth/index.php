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

    case 'PUT':
        updateProfile();
        break;
        
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function login() {
    $data = getJsonInput();
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    // Rate Limit: 5 Login attempts per minute per email
    try {
        $db = getDB();
        $limiter = new RateLimiter($db, "login:" . $email, 5, 60);
        if (!$limiter->check()) {
            sendResponse(['error' => 'Too many login attempts. Please try again later.'], 429);
        }
    } catch (Exception $e) {
        // Fail open if rate limiter fails
    }
    
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
        
        // Generate Token
        $payload = [
            'sub' => $user['id'],
            'email' => $user['email'],
            'exp' => time() + (60 * 60 * 24 * 7) // 7 days expiration
        ];
        $token = JWT::encode($payload);
        
        sendResponse([
            'success' => true,
            'user' => $userData,
            'token' => $token
        ]);
        
    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function register() {
    $data = getJsonInput();
    // Sanitize
    $email = Validator::sanitize($data['email'] ?? '');
    $name = Validator::sanitize($data['name'] ?? '');
    $location = Validator::sanitize($data['location'] ?? 'Brazzaville');
    $password = $data['password'] ?? ''; // Don't sanitize password, just hash it

    // Validate
    if (!Validator::validateRequired(['email', 'password', 'name'], $data)) {
        sendResponse(['error' => 'Email, password, and name are required'], 400);
    }

    if (!Validator::validateEmail($email)) {
        sendResponse(['error' => 'Invalid email format'], 400);
    }

    if (!Validator::validatePassword($password)) {
        sendResponse(['error' => 'Password must be at least 8 characters and contain a number'], 400);
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

function updateProfile() {
    // SECURITY CHECK: Verify Token
    $authUserId = JWT::getUserIdFromHeader();
    if (!$authUserId) {
        sendResponse(['error' => 'Unauthorized Access'], 401);
    }

    $data = getJsonInput();
    
    if (empty($data['name'])) {
        sendResponse(['error' => 'Name is required'], 400);
    }

    try {
        $db = getDB();
        
        // Update user (Use $authUserId from Token, NOT data['id'])
        $stmt = $db->prepare("UPDATE users SET name = ?, location = ?, avatar = ? WHERE id = ?");
        $stmt->execute([
            $data['name'],
            $data['location'] ?? 'Brazzaville',
            $data['avatar'] ?? '',
            $authUserId // FORCE AUTH ID
        ]);

        // Fetch updated user to return
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$authUserId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            sendResponse(['error' => 'User not found after update'], 404);
        }

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
            'user' => $userData,
            'message' => 'Profile updated successfully'
        ]);

    } catch(PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}
