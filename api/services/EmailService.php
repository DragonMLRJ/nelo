<?php

class EmailService {
    private static $logFile = __DIR__ . '/../email_logs.txt';

    public static function sendOrderConfirmation($toEmail, $orderData) {
        $subject = "Order Confirmation - " . $orderData['orderNumber'];
        $timestamp = date('Y-m-d H:i:s');
        
        $message = "[$timestamp] To: $toEmail\n";
        $message .= "Subject: $subject\n";
        $message .= "------------------------------------------------\n";
        $message .= "Thank you for your order!\n\n";
        $message .= "Order Number: " . $orderData['orderNumber'] . "\n";
        $message .= "Total Amount: " . number_format($orderData['totalAmount'], 0) . " " . $orderData['currency'] . "\n\n";
        $message .= "Items:\n";
        
        foreach ($orderData['items'] as $item) {
            $message .= "- " . $item['product']['title'] . " (x" . $item['quantity'] . ")\n";
        }
        
        $message .= "\nShipping Address: " . $orderData['shippingAddress'] . "\n";
        $message .= "------------------------------------------------\n\n";

        // Append to log file
        file_put_contents(self::$logFile, $message, FILE_APPEND);
    }
}
