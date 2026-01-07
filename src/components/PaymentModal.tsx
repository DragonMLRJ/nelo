import React, { useState } from 'react';
import { CreditCard, Smartphone, X } from 'lucide-react';
import { PaymentService } from '../services/PaymentService';
import { useNotifications } from '../context/NotificationContext';

interface PaymentModalProps {
    amount: number;
    email: string;
    name: string;
    phone: string;
    onSuccess: (response: any) => void;
    onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    amount,
    email,
    name,
    phone,
    onSuccess,
    onClose
}) => {
    const { addNotification } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<'MTN' | 'Airtel' | 'Card'>('MTN');

    const TAX_RATE = 0.08;
    const taxAmount = amount * TAX_RATE;
    const totalAmount = amount + taxAmount;

    const handlePayment = async () => {
        setLoading(true);
        // Simulate payment via our backend service
        const response = await PaymentService.initiatePayment(totalAmount, phone, selectedProvider);
        setLoading(false);

        if (response.success) {
            if (response.paymentUrl) {
                // Redirect to Flutterwave
                window.location.href = response.paymentUrl;
                return;
            }

            addNotification({
                type: 'success',
                title: 'Paiement Réussi',
                message: `Transaction ${response.transactionId} effectuée avec succès.`,
            });
            onSuccess({
                status: 'successful',
                tx_ref: response.transactionId,
                transaction_id: response.transactionId
            });
        } else {
            addNotification({
                type: 'error',
                title: 'Échec du Paiement',
                message: response.message || 'Une erreur est survenue.',
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white text-center relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-teal-100 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                    <h3 className="text-xl font-bold">Paiement Sécurisé</h3>
                    <p className="text-teal-100 text-sm mt-1">République du Congo</p>
                    <div className="mt-4">
                        <span className="text-3xl font-bold">{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                        <div className="text-xs text-teal-200 mt-1">
                            (Dont {taxAmount.toLocaleString('fr-FR')} FCFA de taxes)
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Summary */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Sous-total</span>
                            <span>{amount.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Taxe (8%)</span>
                            <span>{taxAmount.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
                            <span>Total à Payer</span>
                            <span>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-gray-600 text-xs font-medium">
                        <button
                            onClick={() => setSelectedProvider('MTN')}
                            className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-colors ${selectedProvider === 'MTN' ? 'bg-yellow-50 ring-2 ring-yellow-400' : 'hover:bg-gray-50 border border-gray-100'}`}
                        >
                            <div className="w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold shadow-sm">
                                MTN
                            </div>
                            <span>MTN</span>
                        </button>
                        <button
                            onClick={() => setSelectedProvider('Airtel')}
                            className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-colors ${selectedProvider === 'Airtel' ? 'bg-red-50 ring-2 ring-red-400' : 'hover:bg-gray-50 border border-gray-100'}`}
                        >
                            <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                                AIR
                            </div>
                            <span>Airtel</span>
                        </button>
                        <button
                            onClick={() => setSelectedProvider('Card')}
                            className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-colors ${selectedProvider === 'Card' ? 'bg-blue-50 ring-2 ring-blue-400' : 'hover:bg-gray-50 border border-gray-100'}`}
                        >
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <span>Carte</span>
                        </button>
                    </div>

                    <p className="text-center text-gray-500 text-sm">
                        Sélectionnez votre moyen de paiement pour valider la transaction.
                    </p>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl transform active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Traitement...
                            </>
                        ) : (
                            'Payer ' + totalAmount.toLocaleString('fr-FR') + ' FCFA'
                        )}
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full text-gray-400 hover:text-gray-600 text-sm"
                    >
                        Annuler la transaction
                    </button>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-3 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    <span>Sécurisé par</span>
                    <span className="font-bold text-gray-500">Nelo Pay</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
