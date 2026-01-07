<?php
require_once 'services/EmailService.php';

// Mock Order Data
$orderData = [
    'orderNumber' => 'TEST-ORD-' . rand(1000, 9999),
    'totalAmount' => 15000,
    'currency' => 'XAF',
    'paymentMethod' => 'cod',
    'shippingAddress' => '123 Test St, Brazzaville',
    'items' => [
        [
            'quantity' => 2,
            'product' => [
                'title' => 'Test Product A',
                'price' => 5000
            ]
        ],
        [
            'quantity' => 1,
            'product' => [
                'title' => 'Test Product B',
                'price' => 5000
            ]
        ]
    ]
];

$toEmail = $_GET['email'] ?? 'test@example.com';

echo "<h2>Testing Email Service</h2>";
echo "<p>Sending to: $toEmail</p>";

$result = EmailService::sendOrderConfirmation($toEmail, $orderData);

if ($result) {
    echo "<h3 style='color: green'>Success! Email sent (or logged if SMTP invalid).</h3>";
    echo "<p>Check <code>api/email_logs.txt</code> inside container if using fallback.</p>";
} else {
    echo "<h3 style='color: red'>Failed. Check logs.</h3>";
}
