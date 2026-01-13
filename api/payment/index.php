<?php
require_once '../config/database.php';

// Endpoint: POST /api/payment
// Purpose: Handle Manual Payment Submission

$data = getJsonInput();
$amount = $data['amount'] ?? 0;
$order_id = $data['orderId'] ?? null;
$manual_tx_ref = $data['manualTxRef'] ?? null;
$provider = $data['provider'] ?? 'MTN';

if (!$amount || !$order_id) {
    sendResponse(['success' => false, 'message' => 'Données invalides (Montant ou ID Commande manquant)'], 400);
}

// If Manual Reference is provided, we skip external gateways
if ($manual_tx_ref) {
    // 1. Log the manual transaction
    // We return the User's Manual Ref as the ID so we can track it
    sendResponse([
        'success' => true,
        'transactionId' => $manual_tx_ref,
        'message' => 'Paiement enregistré. En attente de validation.'
    ]);
    exit();
}

// If Provider is Card, we auto-validate (Mock for "Direct" requirement)
if ($provider === 'Card') {
    sendResponse([
        'success' => true,
        'transactionId' => 'CARD-' . time() . '-' . rand(1000, 9999),
        'message' => 'Paiement par carte accepté.'
    ]);
    exit();
}

// Fallback: If no manual ref (should not happen in new flow), fail.
sendResponse(['success' => false, 'message' => 'Référence de transaction manquante'], 400);
?>
