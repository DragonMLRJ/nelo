<?php
require_once '../config/database.php';

// Endpoint: POST /api/payment
// Purpose: Initiate a payment (Flutterwave Standard)

$data = getJsonInput();
$amount = $data['amount'] ?? 0;
$email = $data['email'] ?? 'user@example.com';
$phone = $data['phone'] ?? '';
$user_id = $data['userId'] ?? 0;

if (!$amount || !$email) {
    sendResponse(['success' => false, 'message' => 'Invalid data'], 400);
}

// 1. Generate Transaction Ref
$tx_ref = 'NELO-' . uniqid() . '-' . time();

// 2. Call Flutterwave API (Standard Payment Link)
// Docs: https://developer.flutterwave.com/docs/payments/standard-payments
$flw_secret = getenv('FLW_SECRET_KEY'); // You need to add this to .env
$redirect_url = getenv('APP_URL') . '/payment-callback'; // Frontend route

// Payload
$payload = [
    'tx_ref' => $tx_ref,
    'amount' => $amount,
    'currency' => 'XAF',
    'redirect_url' => $redirect_url,
    'customer' => [
        'email' => $email,
        'phonenumber' => $phone,
        'name' => $data['name'] ?? 'Nelo Customer'
    ],
    'customizations' => [
        'title' => 'Nelo Marketplace',
        'logo' => 'https://nelo.cg/logo.png'
    ]
];

// If using Mobile Money directly (USSD Push), the payload differs.
// For MVP, we often use the Payment Link/Modal flow.
// But PaymentModal.tsx expects a direct response? 
// If PaymentModal is "success", it means "Payment Initiated".
// We will return the tx_ref as transactionId.

// Check if we are mocking (no key)
if (!$flw_secret) {
    // Mock Response
    sendResponse([
        'success' => true,
        'transactionId' => $tx_ref,
        'message' => 'Payment Initiated (Mock)'
    ]);
}

// Real Call to Flutterwave
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.flutterwave.com/v3/payments');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $flw_secret,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
curl_close($ch);
$res = json_decode($response, true);

if (isset($res['status']) && $res['status'] === 'success') {
    sendResponse([
        'success' => true,
        'transactionId' => $tx_ref,
        'paymentUrl' => $res['data']['link'], // Critical for redirect
        'message' => 'Payment Initiated'
    ]);
} else {
    error_log("Flutterwave Error: " . json_encode($res));
    sendResponse(['success' => false, 'message' => 'Payment Gateway Error'], 500);
}
?>
