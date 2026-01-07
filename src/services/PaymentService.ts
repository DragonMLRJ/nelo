export interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    paymentUrl?: string;
    message?: string;
}

export const PaymentService = {
    /**
     * Initiates a Mobile Money payment via the Node.js backend.
     */
    async initiatePayment(amount: number, phone: string, provider: 'MTN' | 'Airtel' | 'Card'): Promise<PaymentResponse> {
        try {
            // Use relative path for Vercel (rewrites to /api/payment)
            const API_URL = '/api/payment';

            // MOCK FOR LOCAL DEV ONLY: If localhost, return success immediately
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('Using Mock Payment for Localhost');
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
                return {
                    success: true,
                    transactionId: 'TEST-TXN-' + Date.now(),
                    message: 'Paiement simulé réussi'
                };
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, phone, provider }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.message || 'Payment failed' };
            }

            return {
                success: true,
                transactionId: data.transactionId,
                paymentUrl: data.paymentUrl, // Capture the link
                message: data.message
            };

        } catch (error) {
            console.error('Payment Error:', error);
            return {
                success: false,
                message: 'Erreur de connexion. Veuillez vérifier votre internet et réessayer.'
            };
        }
    }
};
