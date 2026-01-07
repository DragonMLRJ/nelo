<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../services/EmailService.php';

// Rate Limiting (File-based) - This works on Vercel (Ephemeral FS) but resets on cold start. 
// Acceptable for simple anti-spam.
$ip_address = $_SERVER['REMOTE_ADDR'];
$rate_file = sys_get_temp_dir() . '/rate_limit_' . md5($ip_address);
if (file_exists($rate_file) && (time() - filemtime($rate_file) < 5)) {
    http_response_code(429);
    echo json_encode(["status" => "error", "message" => "Too many requests."]);
    exit();
}
touch($rate_file);

// Get posted data
$data = json_decode(file_get_contents("php://input"), true);

if (
    !empty($data['email']) &&
    !empty($data['orderNumber']) &&
    !empty($data['totalAmount'])
) {
    try {
        $toEmail = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        
        if (!filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format");
        }

        // Send Email using provided data (Stateless)
        $sent = EmailService::sendOrderConfirmation($toEmail, $data);

        if ($sent) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Confirmation email sent."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to send email."]);
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
}
?>
