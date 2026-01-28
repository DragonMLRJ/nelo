import express from 'express';
import { PaymentService } from '../services/payment';

const router = express.Router();

// Stripe: Create Payment Intent
router.post('/create-intent', async (req, res) => {
    try {
        const { amount, currency } = req.body; // Expect amount in standard unit (e.g., 20.00)
        const result = await PaymentService.createStripePaymentIntent(amount, currency);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// MTN MoMo: Request to Pay
router.post('/momo/pay', async (req: express.Request, res: express.Response) => {
    try {
        const { amount, currency, phone } = req.body;
        const result = await PaymentService.requestMtnPayment(amount, currency, phone);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// MTN MoMo: Check Status
router.get('/momo/status/:referenceId', async (req, res) => {
    try {
        const { referenceId } = req.params;
        const result = await PaymentService.getMtnTransactionStatus(referenceId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
