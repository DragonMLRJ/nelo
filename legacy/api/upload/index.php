<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check for file upload
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../../uploads/';
    
    // Create uploads directory if it doesn't exist
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $file = $_FILES['file'];
    $fileName = time() . '_' . basename($file['name']);
    $targetPath = $uploadDir . $fileName;
    $fileType = strtolower(pathinfo($targetPath, PATHINFO_EXTENSION));

    // Basic validation
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type.']);
        exit();
    }

    if ($file['size'] > 5000000) { // 5MB limit
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File too large. Max 5MB.']);
        exit();
    }

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Return relative URL or absolute URL depending on setup
        // Assuming web root is at ../../
        $fileUrl = 'http://localhost:8000/uploads/' . $fileName; 
        
        echo json_encode([
            'success' => true,
            'url' => $fileUrl,
            'type' => in_array($fileType, ['jpg', 'jpeg', 'png', 'gif']) ? 'image' : 'document',
            'name' => $file['name']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file.']);
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error.']);
}
?>
