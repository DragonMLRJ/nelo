import Stripe from 'stripe';
import axios from 'axios';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover', // Official API version
});

interface MTNConfig {
    userId: string;
    apiKey: string;
    primaryKey: string;
    targetEnv: 'sandbox' | 'mtncongo';
    baseUrl: string;
}

const mtnConfig: MTNConfig = {
    userId: process.env.MTN_MOMO_USER_ID || '',
    apiKey: process.env.MTN_MOMO_API_KEY || '',
    primaryKey: process.env.MTN_MOMO_PRIMARY_KEY || '',
    targetEnv: (process.env.MTN_MOMO_TARGET_ENV as 'sandbox' | 'mtncongo') || 'sandbox',
    baseUrl: process.env.MTN_MOMO_TARGET_ENV === 'mtncongo'
        ? 'https://proxy.momoapi.mtn.com'
        : 'https://sandbox.momodeveloper.mtn.com'
};

export class PaymentService {

    // --- STRIPE ---
    static async createStripePaymentIntent(amount: number, currency: string = 'usd') {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe expects cents
                currency: currency.toLowerCase(),
                automatic_payment_methods: { enabled: true },
            });
            return {
                clientSecret: paymentIntent.client_secret,
                id: paymentIntent.id
            };
        } catch (error: any) {
            console.error('Stripe Error:', error.message);
            throw new Error(`Stripe payment failed: ${error.message}`);
        }
    }

    // --- MTN MOMO ---
    static async getMtnToken(): Promise<string> {
        const auth = Buffer.from(`${mtnConfig.userId}:${mtnConfig.apiKey}`).toString('base64');
        try {
            const response = await axios.post(`${mtnConfig.baseUrl}/collection/token/`, {}, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Ocp-Apim-Subscription-Key': mtnConfig.primaryKey
                }
            });
            return response.data.access_token;
        } catch (error: any) {
            console.error('MTN Token Error:', error.response?.data || error.message);
            // Mock token for testing if env is missing
            if (mtnConfig.targetEnv === 'sandbox' && !mtnConfig.userId) return 'mock-token';
            throw new Error('Failed to authenticate with MTN MoMo');
        }
    }

    static async requestMtnPayment(amount: number, currency: string, phone: string) {
        // MTN Sandbox fixes: currency usually EUR for sandbox, XAF for live
        const validCurrency = mtnConfig.targetEnv === 'sandbox' ? 'EUR' : 'XAF';
        const externalId = uuidv4();

        try {
            const token = await this.getMtnToken();
            if (token === 'mock-token') {
                return { status: 'PENDING', referenceId: externalId, message: 'Mock Payment Initiated' };
            }

            await axios.post(`${mtnConfig.baseUrl}/collection/v1_0/requesttopay`, {
                amount: amount.toString(),
                currency: validCurrency,
                externalId: externalId,
                payer: {
                    partyIdType: 'MSISDN',
                    partyId: phone
                },
                payerMessage: 'Payment for Nelo Marketplace',
                payeeNote: 'Nelo Order'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Reference-Id': externalId,
                    'X-Target-Environment': mtnConfig.targetEnv,
                    'Ocp-Apim-Subscription-Key': mtnConfig.primaryKey,
                    'Content-Type': 'application/json'
                }
            });

            return {
                status: 'PENDING',
                referenceId: externalId, // Used to check status later
                message: 'Payment request sent to user phone'
            };

        } catch (error: any) {
            console.error('MTN MoMo Error:', error.response?.data || error.message);
            throw new Error(`MTN Payment failed: ${error.message}`);
        }
    }

    static async getMtnTransactionStatus(referenceId: string) {
        try {
            const token = await this.getMtnToken();
            if (token === 'mock-token') return { status: 'SUCCESSFUL' };

            const response = await axios.get(`${mtnConfig.baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': mtnConfig.targetEnv,
                    'Ocp-Apim-Subscription-Key': mtnConfig.primaryKey
                }
            });
            return response.data; // Includes status: SUCCESSFUL, FAILED, PENDING
        } catch (error: any) {
            throw new Error(`Failed to check transaction status: ${error.message}`);
        }
    }
}
