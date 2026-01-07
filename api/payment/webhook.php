<?php
// api/payment/webhook.php

// Configuration
$supabaseUrl = getenv('VITE_SUPABASE_URL');
$supabaseKey = getenv('VITE_SUPABASE_SERVICE_ROLE_KEY'); // Use Service Role Key for updates!
$flwSecretHash = getenv('FLW_SECRET_HASH') ?: 'nelo_secret_hash';

// Verify Signature
$signature = $_SERVER['HTTP_VERIF_HASH'] ?? '';
if (!$signature || ($signature !== $flwSecretHash)) {
    http_response_code(401);
    exit();
}

// Parse Payload
$body = file_get_contents('php://input');
$payload = json_decode($body, true);

if ($payload['event'] === 'charge.completed' && $payload['data']['status'] === 'successful') {
    $txRef = $payload['data']['tx_ref']; // This should match our Order Number
    
    if ($supabaseUrl && $supabaseKey) {
        // Update Order in Supabase via REST API
        $url = $supabaseUrl . '/rest/v1/orders?order_number=eq.' . $txRef;
        
        $data = [
            'status' => 'paid',
            'payment_status' => 'paid'
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'apikey: ' . $supabaseKey,
            'Authorization: Bearer ' . $supabaseKey,
            'Content-Type: application/json',
            'Prefer: return=minimal'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            // Success
            // Trigger Email (Optional: Supabase Edge Function might differ, but we can call our email script here)
            // For now, we rely on Supabase Hooks or Client logic for emails, 
            // OR we can keep our EmailService if we wire it up.
        } else {
            error_log("Supabase Update Failed: " . $response);
        }
    }
}

http_response_code(200);
?>
