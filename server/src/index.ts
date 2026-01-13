import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payment';

dotenv.config({ path: '../.env' }); // Load from root .env or local

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/orders', orderRoutes); // Maps to /api/v2/orders via Nginx
app.use('/payments', paymentRoutes); // Maps to /api/payments

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
