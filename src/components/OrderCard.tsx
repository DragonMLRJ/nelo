import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { Order } from '../types';

interface OrderCardProps {
    order: Order;
    role: 'buyer' | 'seller';
}

import { useLanguage } from '../context/LanguageContext';

const OrderCard: React.FC<OrderCardProps> = ({ order, role }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'delivered':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'shipped':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'delivered':
                return <CheckCircle className="w-4 h-4" />;
            case 'shipped':
                return <Truck className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div
            onClick={() => navigate(`/orders/${order.id}`)}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {order.order_number}
                        </span>
                        <span className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <h3 className="font-bold text-gray-900">
                        {role === 'buyer' ? `${t('order.sold_by')} ${order.counterparty_name}` : `${t('order.ordered_by')} ${order.counterparty_name}`}
                    </h3>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{t(`order.status.${order.status.toLowerCase()}`)}</span>
                </div>
            </div>

            {/* Items Preview */}
            <div className="space-y-3 mb-4">
                {(order.items || []).slice(0, 2).map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-bold text-gray-700">
                            {(item.unit_price * item.quantity).toLocaleString()} {order.currency || 'XAF'}
                        </div>
                    </div>
                ))}
                {(order.items?.length || 0) > 2 && (
                    <p className="text-xs text-gray-500 pl-1">
                        + {(order.items?.length || 0) - 2} more items
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                    <p className="text-xs text-gray-500">{t('checkout.total')}</p>
                    <p className="font-bold text-lg text-teal-600">
                        {order.total_amount.toLocaleString()} {order.currency || 'XAF'}
                    </p>
                </div>
                <button className="text-sm font-bold text-gray-600 group-hover:text-teal-600 flex items-center gap-1 transition-colors">
                    {t('common.view')} <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div >
    );
};

export default OrderCard;
