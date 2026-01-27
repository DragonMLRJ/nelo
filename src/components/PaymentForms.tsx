// @ts-nocheck
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
            // MOCKED STRIPE FLOW for Demo/MVP (Since Node backend is removed)
            // In a real scenario, this would call /api/payment/create-intent

            // Call the PHP Backend generic payment endpoint
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    currency,
                    provider: 'Card',
                    orderId: 'TEMP-' + Date.now() // API expects orderId
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Payment failed');
            }

            // Simulate "Card Confirmation" delay for UX
            await new Promise(resolve => setTimeout(resolve, 1500));

            onSuccess({ provider: 'stripe', id: data.transactionId || 'evt_mock' });

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
    const [network, setNetwork] = useState<'mtn' | 'airtel'>('mtn');

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    currency,
                    phone,
                    network, // Send network to backend
                    orderId: 'MOMO-' + Date.now(),
                    manualTxRef: 'MOMO-PENDING-' + Date.now(),
                    provider: 'Momo'
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Payment request failed');

            alert(`Payment Request Sent to ${phone} via ${network.toUpperCase()}. Please approve ensuring funds.`);

            setTimeout(() => {
                onSuccess({ provider: 'mtn-momo', referenceId: data.transactionId });
            }, 3000);

        } catch (err: any) {
            onError(err.message);
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handlePay} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Choisir le Réseau</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                        type="button"
                        onClick={() => setNetwork('mtn')}
                        className={`relative p-3 border rounded-xl flex items-center justify-center gap-2 transition-all overflow-hidden ${network === 'mtn' ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-400 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/9/9e/MTN_Mobile_Money_logo.svg"
                            alt="MTN"
                            className="h-8 w-auto object-contain"
                        />
                        {network === 'mtn' && (
                            <div className="absolute top-1 right-1">
                                <span className="block w-2 H-2 bg-yellow-400 rounded-full"></span>
                            </div>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setNetwork('airtel')}
                        className={`relative p-3 border rounded-xl flex items-center justify-center gap-2 transition-all overflow-hidden ${network === 'airtel' ? 'border-red-500 bg-red-50 ring-2 ring-red-500 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Airtel_Logo_new.svg"
                            alt="Airtel"
                            className="h-8 w-auto object-contain"
                        />
                    </button>
                </div>

                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Numéro Mobile Money</label>
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
