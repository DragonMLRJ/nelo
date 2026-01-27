import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Package, Truck, Home, DollarSign, AlertTriangle } from 'lucide-react';
import { OrderWithProofs } from '../types';

interface ProofTimelineProps {
    order: OrderWithProofs;
    isSeller: boolean;
}

const ProofTimeline: React.FC<ProofTimelineProps> = ({ order, isSeller }) => {
    const getStatusIcon = (status: string, isActive: boolean) => {
        const iconClass = `w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`;

        switch (status) {
            case 'placed':
                return <Check className={iconClass} />;
            case 'shipment_proof':
                return <Package className={iconClass} />;
            case 'shipped':
                return <Truck className={iconClass} />;
            case 'delivery_proof':
                return <Home className={iconClass} />;
            case 'validated':
                return <Check className={iconClass} />;
            case 'payment':
                return <DollarSign className={iconClass} />;
            default:
                return <Clock className={iconClass} />;
        }
    };

    const getStatusColor = (isActive: boolean, isCompleted: boolean) => {
        if (isCompleted) return 'bg-green-500';
        if (isActive) return 'bg-teal-500';
        return 'bg-gray-300';
    };

    const timelineSteps = [
        {
            id: 'placed',
            label: 'Commande Passée',
            description: 'Paiement reçu',
            timestamp: order.created_at,
            isCompleted: true,
            isActive: false
        },
        {
            id: 'shipment_proof',
            label: isSeller ? 'Preuve de Disponibilité/Expédition' : 'Attente Preuve Disponibilité',
            description: order.shipment_proof_submitted
                ? `Soumise le ${new Date(order.shipment_proof_submitted_at!).toLocaleDateString()}`
                : 'Preuve requise',
            timestamp: order.shipment_proof_submitted_at,
            isCompleted: order.shipment_proof_submitted,
            isActive: !order.shipment_proof_submitted && order.status === 'pending',
            requiresAction: !order.shipment_proof_submitted && isSeller
        },
        {
            id: 'shipped',
            label: 'Expédié',
            description: order.status === 'shipped' ? 'Colis en transit' : 'En attente d\'expédition',
            timestamp: order.shipment_proof_submitted_at,
            isCompleted: ['shipped', 'delivered'].includes(order.status),
            isActive: order.status === 'shipped'
        },
        {
            id: 'delivery_proof',
            label: isSeller ? 'En Attente de Confirmation' : 'Confirmer Réception',
            description: order.delivery_proof_submitted
                ? `Confirmée le ${new Date(order.delivery_proof_submitted_at!).toLocaleDateString()}`
                : 'Confirmation requise à réception',
            timestamp: order.delivery_proof_submitted_at,
            isCompleted: order.delivery_proof_submitted,
            isActive: order.status === 'shipped' && !order.delivery_proof_submitted,
            requiresAction: order.status === 'shipped' && !order.delivery_proof_submitted && !isSeller
        },
        {
            id: 'validated',
            label: 'Transaction Validée',
            description: order.proof_validation_status === 'validated'
                ? 'Commande finalisée'
                : 'En attente de validation',
            timestamp: order.delivery_proof_submitted_at,
            isCompleted: order.proof_validation_status === 'validated',
            isActive: order.proof_validation_status === 'validated'
        },
        {
            id: 'payment',
            label: 'Paiement Transféré',
            description: isSeller ? 'Paiement reçu' : 'Transaction complète',
            timestamp: undefined,
            isCompleted: order.proof_validation_status === 'validated' && order.payment_status === 'completed',
            isActive: false
        }
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-500" />
                Suivi de Commande
            </h3>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Timeline Steps */}
                <div className="space-y-8">
                    {timelineSteps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-16"
                        >
                            {/* Icon */}
                            <div
                                className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(
                                    step.isActive,
                                    step.isCompleted
                                )} shadow-lg transition-all duration-300`}
                            >
                                {getStatusIcon(step.id, step.isCompleted || step.isActive)}
                            </div>

                            {/* Content */}
                            <div className={`${step.requiresAction ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'} rounded-xl p-4 transition-all`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className={`font-bold ${step.isActive ? 'text-teal-700' : 'text-gray-900'}`}>
                                            {step.label}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                        {step.timestamp && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(step.timestamp).toLocaleString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Required Badge */}
                                    {step.requiresAction && (
                                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                                            <AlertTriangle className="w-3 h-3" />
                                            Action Requise
                                        </div>
                                    )}

                                    {/* Completed Badge */}
                                    {step.isCompleted && (
                                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                                            <Check className="w-3 h-3" />
                                            Complété
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Legal Notice */}
            {order.proof_validation_status !== 'validated' && (
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs text-blue-800">
                        <span className="font-bold block mb-1">Protection {isSeller ? 'Vendeur' : 'Acheteur'}</span>
                        {isSeller
                            ? 'Votre paiement sera libéré une fois que l\'acheteur aura confirmé la réception. Si aucune réclamation n\'est signalée dans les 14 jours, la transaction sera automatiquement validée.'
                            : 'Votre achat est protégé. Si vous ne recevez pas votre article ou s\'il n\'est pas conforme, vous serez remboursé intégralement.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProofTimeline;
