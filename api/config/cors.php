<?php
/**
 * CORS Configuration for Render.com Deployment
 * 
 * This file handles Cross-Origin Resource Sharing (CORS) for production.
 * Restricts API access to authorized frontend domains only.
 */

// Allowed origins for production
$allowed_origins = [
    'https://nelo-frontend.onrender.com',
    'https://nelo-marketplace.onrender.com',  // If you add custom domain
];

// In development, allow localhost
if (getenv('APP_ENV') !== 'production') {
    $allowed_origins[] = 'http://localhost:3000';
    $allowed_origins[] = 'http://localhost:5173';
}

// Get request origin
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Check if origin is allowed
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    // For Render preview deployments (*.onrender.com)
    if (strpos($origin, '.onrender.com') !== false && getenv('APP_ENV') === 'production') {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
    }
}

// CORS headers
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
