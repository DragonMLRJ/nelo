import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { formatCurrency } from '../utils/currency';
import { FEES } from '../constants';
import SEO from '../components/SEO';

const InvoiceView: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { getOrderById } = useOrders();
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        if (orderId) {
            const foundOrder = getOrderById(orderId);
            setOrder(foundOrder);
        }
    }, [orderId, getOrderById]);

    if (!order) {
        return <div className="p-8 text-center">Chargement de la facture...</div>;
    }

    return (
        <div className="bg-white min-h-screen p-8 text-gray-900 font-sans print:p-0">
            <SEO title={`Facture #${order.id}`} description="Facture Nelo Marketplace" />

            <div className="max-w-3xl mx-auto border border-gray-200 p-8 shadow-sm print:shadow-none print:border-0">
                {/* Header */}
                <div className="flex justify-between items-start mb-12 border-b border-gray-100 pb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-teal-700 mb-2">nelo.</h1>
                        <p className="text-gray-500 text-sm">Le marché du Congo</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">FACTURE</h2>
                        <p className="text-gray-500">#{order.id}</p>
                        <p className="text-gray-500 text-sm mt-1">{new Date(order.date).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                    </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Facturé à</h3>
                        <p className="font-bold text-lg">{order.shippingAddress || 'Client'}</p>
                        <p className="text-gray-600 email">{order.buyerId}</p> {/* Assuming buyerId is helpful, ideally name */}
                    </div>
                    <div className="text-right">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Payé via</h3>
                        <p className="font-bold">{order.paymentMethod === 'card' ? 'Carte Bancaire / Mobile Money' : 'Paiement à la livraison (COD)'}</p>
                        <p className="text-gray-600">{order.isPaid ? 'Payé' : 'En attente'}</p>
                    </div>
                </div>

                {/* Items */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-gray-100 text-left">
                            <th className="py-3 font-bold text-gray-600">Article</th>
                            <th className="py-3 font-bold text-gray-600 text-right">Qté</th>
                            <th className="py-3 font-bold text-gray-600 text-right">Prix</th>
                            <th className="py-3 font-bold text-gray-600 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(order.items || []).map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-50">
                                <td className="py-4">
                                    <p className="font-bold text-gray-800">{item.title}</p>
                                    <p className="text-xs text-gray-500">Vendeur: {order.sellerId}</p>
                                </td>
                                <td className="py-4 text-right">{item.quantity}</td>
                                <td className="py-4 text-right font-mono">{formatCurrency(item.price)}</td>
                                <td className="py-4 text-right font-bold font-mono">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-1/2 space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Sous-total</span>
                            <span className="font-mono">{formatCurrency(order.total - FEES.FIXED_FEE)} (Est.)</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Frais de Service & Protection</span>
                            <span className="font-mono">{formatCurrency(FEES.FIXED_FEE)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-3">
                            <span>Total</span>
                            <span className="font-mono text-teal-600">{formatCurrency(order.total)}</span>
                        </div>
                        <p className="text-xs text-right text-gray-400 italic">TVA incluse si applicable</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-gray-400 text-sm mt-12 pt-8 border-t border-gray-100">
                    <p className="mb-2">Merci de faire confiance à Nelo Marketplace.</p>
                    <p>Pour toute question: support@nelo.cg</p>
                </div>

                {/* Print Button - Hidden when printing */}
                <div className="mt-8 text-center print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition-colors"
                    >
                        Imprimer / PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceView;
