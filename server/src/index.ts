import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Load from root .env or local

const app = express();
const PORT = process.env.PORT || 3001;

import orderRoutes from './routes/orders';

app.use(cors());
app.use(express.json());

// Routes
app.use('/orders', orderRoutes); // Maps to /api/v2/orders via Nginx

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'nelo-backend', timestamp: new Date().toISOString() });
});

// Mock Mobile Money Payment Endpoint
app.post('/api/payment/initiate', (req, res) => {
    const { amount, phone, provider } = req.body;

    console.log(`[Payment] Initiating ${provider} payment for ${phone} - Amount: ${amount}`);

    // Simulate Network Latency (1-3 seconds)
    setTimeout(() => {
        // Mock Success (For now, assume all succeed)
        const success = true;

        if (success) {
            res.json({
                success: true,
                transactionId: `TXN-${Math.floor(Math.random() * 1000000)}`,
                message: 'Paiement effectué avec succès'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Échec du paiement. Solde insuffisant.'
            });
        }
    }, 2000);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
