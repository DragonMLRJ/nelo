import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, Settings, DollarSign, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import OrderCard from '../components/OrderCard';

const SellerDashboard: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { orders, getOrdersBySeller } = useOrders();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('orders');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=/sales');
            return;
        }
        getOrdersBySeller(user.id);
    }, [user]);

    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'all') return true;
        return order.status === filterStatus;
    });

    const totalSales = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('seller.title')}</h1>
                    <p className="text-gray-500">{t('seller.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/sell')}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors"
                    >
                        + {t('nav.sell')}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{t('seller.revenue')}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{totalSales.toLocaleString()} XAF</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{t('seller.orders')}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{orders.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{t('seller.pending')}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{pendingOrders}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'orders' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('seller.tab_orders')}
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'products' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('seller.tab_products')}
                </button>
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'overview' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('seller.tab_overview')}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'orders' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {['all', 'pending', 'shipped', 'delivered', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize border ${filterStatus === status
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">{t('seller.no_orders')}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredOrders.map(order => (
                                <OrderCard key={order.id} order={order} role="seller" />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'products' && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">Product management is handled in the "My Profile" section for now.</p>
                    <button
                        onClick={() => navigate('/profile')}
                        className="mt-4 text-teal-600 font-bold hover:underline"
                    >
                        Go to Profile
                    </button>
                </div>
            )}

            {activeTab === 'overview' && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Store settings and analytics coming soon.</p>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
