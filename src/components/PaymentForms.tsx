import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Phone, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Initialize Stripe (Replace with env var in production)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface PaymentProps {
    amount: number;
    currency: string;
    onSuccess: (details: any) => void;
    onError: (error: string) => void;
    isProcessing: boolean;
    setIsProcessing: (loading: boolean) => void;
}

const StripeForm: React.FC<PaymentProps> = ({ amount, currency, onSuccess, onError, isProcessing, setIsProcessing }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [cardError, setCardError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setCardError(null);

        try {
            // 1. Create Payment Intent on Backend
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/create-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency }),
            });

            if (!response.ok) throw new Error('Failed to initialize payment');

            const { clientSecret } = await response.json();

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) throw new Error('Card element not found');

            // 2. Confirm Card Payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement as any,
                }
            });

            if (result.error) {
                setCardError(result.error.message || 'Payment failed');
                onError(result.error.message || 'Payment failed');
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    onSuccess({ provider: 'stripe', id: result.paymentIntent.id });
                }
            }
        } catch (err: any) {
            setCardError(err.message);
            onError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-teal-500 transition-all">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#1e293b',
                            '::placeholder': { color: '#94a3b8' },
                            fontFamily: 'Inter, sans-serif',
                            iconColor: '#0d9488',
                        },
                        invalid: { color: '#ef4444' },
                    },
                }} />
            </div>
            {cardError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" /> {cardError}
                </div>
            )}
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                Pay {amount.toLocaleString()} {currency}
            </button>
        </form>
    );
};

export const StripePayment = (props: PaymentProps) => (
    <Elements stripe={stripePromise}>
        <StripeForm {...props} />
    </Elements>
);

export const MobileMoneyForm: React.FC<PaymentProps> = ({ amount, currency, onSuccess, onError, isProcessing, setIsProcessing }) => {
    const [phone, setPhone] = useState('');

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/momo/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency, phone }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Payment request failed');

            // For Sandbox, we simulate success easily. In prod, we'd poll the status.
            alert(`Payment Request Sent to ${phone}. Please approve ensuring funds.`);

            // Simulating a delay for the user to approve on phone
            setTimeout(() => {
                onSuccess({ provider: 'mtn-momo', referenceId: data.referenceId });
            }, 3000);

        } catch (err: any) {
            onError(err.message);
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handlePay} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Money Number</label>
                <div className="relative">
                    <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="242 06..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all font-mono"
                        required
                    />
                    <Phone className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Supports MTN Mobile Money & Airtel Money</p>
            </div>

            <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-yellow-400 text-yellow-900 py-3.5 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="font-extrabold text-lg">Momo</span>}
                Pay {amount.toLocaleString()} {currency}
            </button>
        </form>
    );
};
