export interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    paymentUrl?: string;
    message?: string;
}

export const PaymentService = {
    /**
     * Submits a manual payment reference for verification.
     */
    async initiatePayment(amount: number, phone: string, provider: 'MTN' | 'Airtel' | 'Card', orderId?: string, manualTxRef?: string): Promise<PaymentResponse> {
        try {
            // Use relative path for Vercel (rewrites to /api/payment)
            const API_URL = '/api/payment';

            // MOCK FOR LOCAL DEV: If Card is selected OR no manual ref provided
            if ((provider === 'Card' || !manualTxRef) && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                console.log('Using Mock Payment for Localhost');
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2s processing time
                return {
                    success: true,
                    transactionId: orderId || ('CARD-TXN-' + Date.now()),
                    message: 'Paiement par carte validé'
                };
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, phone, provider, orderId, manualTxRef }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.message || 'Payment failed' };
            }

            return {
                success: true,
                transactionId: data.transactionId,
                paymentUrl: data.paymentUrl,
                message: data.message
            };

        } catch (error) {
            console.error('Payment Error:', error);
            return {
                success: false,
                message: 'Erreur de connexion.'
            };
        }
    }
};
