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
    orderId?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    amount,
    email,
    name,
    phone,
    onSuccess,
    onClose,
    orderId
}) => {
    const { addNotification } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<'MTN' | 'Airtel' | 'Card'>('MTN');
    const [manualTxRef, setManualTxRef] = useState('');

    const TAX_RATE = 0.08;
    const taxAmount = amount * TAX_RATE;
    const totalAmount = amount + taxAmount;

    const handlePayment = async () => {
        setLoading(true);
        // Simulate payment via our backend service
        const response = await PaymentService.initiatePayment(totalAmount, phone, selectedProvider, orderId, manualTxRef);
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

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${selectedProvider !== 'Card' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setSelectedProvider('MTN')}
                    >
                        Mobile Money
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${selectedProvider === 'Card' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setSelectedProvider('Card')}
                    >
                        Carte Bancaire
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {selectedProvider !== 'Card' ? (
                        /* Mobile Money View */
                        <div className="space-y-6 animate-in fade-in duration-200">
                            {/* Instructions */}
                            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                                <p className="font-bold mb-1">Instructions de paiement :</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Envoyez <b>{totalAmount.toLocaleString('fr-FR')} FCFA</b> par Mobile Money.</li>
                                    <li>Copiez l'ID de la transaction reçu par SMS.</li>
                                    <li>Collez l'ID ci-dessous pour valider.</li>
                                </ol>
                            </div>

                            {/* Provider Selection & Numbers */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSelectedProvider('MTN')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${selectedProvider === 'MTN' ? 'bg-yellow-50 border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className="w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold">MTN</div>
                                    <div className="text-center">
                                        <div className="font-bold text-sm">MTN Money</div>
                                        <div className="text-xs text-gray-500 font-mono">06 663 38 69</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setSelectedProvider('Airtel')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${selectedProvider === 'Airtel' ? 'bg-red-50 border-red-400 ring-1 ring-red-400' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">AIR</div>
                                    <div className="text-center">
                                        <div className="font-bold text-sm">Airtel Money</div>
                                        <div className="text-xs text-gray-500 font-mono">05 532 10 00</div>
                                    </div>
                                </button>
                            </div>

                            {/* Transaction ID Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Numéro de Transaction (ID)
                                </label>
                                <input
                                    type="text"
                                    value={manualTxRef}
                                    onChange={(e) => setManualTxRef(e.target.value)}
                                    placeholder="Ex: 5024349284"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all uppercase placeholder:normal-case font-mono"
                                />
                            </div>
                        </div>
                    ) : (
                        /* Card View */
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-full shadow-sm">
                                    <CreditCard className="w-6 h-6 text-gray-600" />
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p className="font-bold text-gray-800">Carte Bancaire</p>
                                    <p className="text-xs">Visa, Mastercard, cartes prépayées</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Numéro de carte</label>
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Expiration</label>
                                    <input
                                        type="text"
                                        placeholder="MM/AA"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-center"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CVC</label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-center"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Titulaire</label>
                                <input
                                    type="text"
                                    placeholder="Nom sur la carte"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none uppercase placeholder:normal-case"
                                />
                            </div>
                        </div>
                    )}


                    <p className="text-center text-gray-500 text-xs">
                        {selectedProvider !== 'Card'
                            ? "En cliquant sur confirmer, vous attestez avoir effectué le transfert."
                            : "Paiement sécurisé par cryptage SSL de bout en bout."}
                    </p>

                    <button
                        onClick={handlePayment}
                        disabled={loading || (selectedProvider !== 'Card' && !manualTxRef)}
                        className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl transform active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {loading ? 'Traitement...' : `Payer ${totalAmount.toLocaleString('fr-FR')} FCFA`}
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
