<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

require_once __DIR__ . '/../vendor/autoload.php';

// Load .env if it exists (for local dev mostly, docker envs are automatic)
if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->safeLoad();
}

class EmailService {
    private static $logFile = __DIR__ . '/../email_logs.txt';

    public static function sendOrderConfirmation($toEmail, $orderData) {
        $mail = new PHPMailer(true);

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = getenv('SMTP_HOST') ?: 'smtp.gmail.com'; // Default fallback
            $mail->SMTPAuth   = true;
            $mail->Username   = getenv('SMTP_USER');
            $mail->Password   = getenv('SMTP_PASS');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = getenv('SMTP_PORT') ?: 587;

            // Recipients
            $mail->setFrom(getenv('SMTP_FROM_EMAIL') ?: 'notifications@nelo.cg', getenv('SMTP_FROM_NAME') ?: 'Nelo Marketplace');
            $mail->addAddress($toEmail);

            // Content
            $mail->isHTML(true);
            $mail->Subject = "Order Confirmation - " . $orderData['orderNumber'];
            $mail->Body    = self::generateOrderTemplate($orderData);
            $mail->AltBody = strip_tags(self::generateOrderTemplate($orderData)); // Plain text version

            $mail->send();
            return true;
        } catch (Exception $e) {
            // Log error
            $errorMsg = "Message could not be sent. Mailer Error: {$mail->ErrorInfo}\n";
            file_put_contents(self::$logFile, $errorMsg, FILE_APPEND);
            
            // Fallback to local logging if real email fails (so we don't break the app)
            self::logLocally($toEmail, $orderData);
            return false;
        }
    }

    private static function generateOrderTemplate($orderData) {
        $itemsHtml = '';
        foreach ($orderData['items'] as $item) {
            $itemsHtml .= "<li>{$item['product']['title']} (x{$item['quantity']})</li>";
        }

        return "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
                <h2 style='color: #0d9488;'>Thank you for your order!</h2>
                <p>Hello,</p>
                <p>We have received your order <strong>{$orderData['orderNumber']}</strong>.</p>
                
                <div style='background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;'>
                    <h3 style='margin-top: 0;'>Order Summary</h3>
                    <p><strong>Total:</strong> " . number_format($orderData['totalAmount'], 0) . " {$orderData['currency']}</p>
                    <p><strong>Payment Method:</strong> " . ucfirst($orderData['paymentMethod']) . "</p>
                    <p><strong>Address:</strong> {$orderData['shippingAddress']}</p>
                </div>

                <h3>Items</h3>
                <ul>
                    $itemsHtml
                </ul>

                <p>We will notify you when your order ships!</p>
                <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>
                <p style='color: #666; font-size: 12px;'>Nelo Marketplace - Congo</p>
            </div>
        ";
    }

    private static function logLocally($toEmail, $orderData) {
        $subject = "Order Confirmation - " . $orderData['orderNumber'];
        $timestamp = date('Y-m-d H:i:s');
        
        $message = "[$timestamp] [FALLBACK LOG] To: $toEmail\n";
        $message .= "Subject: $subject\n";
        $message .= "Total: " . $orderData['totalAmount'] . "\n\n";
        file_put_contents(self::$logFile, $message, FILE_APPEND);
    }
}
