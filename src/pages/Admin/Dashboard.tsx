import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, DollarSign, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeProducts: 0,
        pendingModeration: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Fetch Key Counts
                const [users, products, pendingProducts] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
                    supabase.from('products').select('*', { count: 'exact', head: true }).or('status.eq.pending,status.is.null')
                ]);

                // 2. Fetch Orders for Revenue & Chart (Last 30 days)
                const { data: ordersData } = await supabase
                    .from('orders')
                    .select('total_amount, created_at')
                    .order('created_at', { ascending: true });

                let totalRevenue = 0;
                let totalOrders = 0;
                const salesByDate: Record<string, number> = {};

                if (ordersData) {
                    totalOrders = ordersData.length;
                    ordersData.forEach((order: any) => {
                        totalRevenue += (order.total_amount || 0);

                        // Aggregating for Chart
                        const date = new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                        salesByDate[date] = (salesByDate[date] || 0) + (order.total_amount || 0);
                    });
                }

                // Format Chart Data
                const formattedChartData = Object.keys(salesByDate).map(date => ({
                    name: date,
                    sales: salesByDate[date]
                })).slice(-7); // Last 7 active days

                setStats({
                    totalUsers: users.count || 0,
                    totalOrders: totalOrders,
                    totalRevenue: totalRevenue,
                    activeProducts: products.count || 0,
                    pendingModeration: pendingProducts.count || 0 // New field
                });
                setChartData(formattedChartData);

            } catch (error) {
                console.error('Admin stats error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-sm font-medium text-gray-400">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            <p className="text-sm text-gray-500 mt-1">{title}</p>
        </motion.div>
    );

    return (

        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Admin</h1>
                    <p className="text-gray-500">Bon retour, {user?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={async () => {
                            const { data } = await supabase.from('orders').select('*');
                            if (data) import('../../utils/exportUtils').then(m => m.exportToCSV(data, 'nelo_orders'));
                        }}
                        className="text-sm font-medium text-teal-600 hover:underline"
                    >
                        Exporter Données
                    </button>
                    <div className="text-sm text-gray-400">
                        Dernière mise à jour: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Utilisateurs"
                    value={loading ? '...' : stats.totalUsers}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Commandes"
                    value={loading ? '...' : stats.totalOrders}
                    icon={ShoppingBag}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Revenus Total"
                    value={loading ? '...' : `${stats.totalRevenue.toLocaleString()} XAF`}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <StatCard
                    title="Produits Actifs"
                    value={loading ? '...' : stats.activeProducts}
                    icon={Package}
                    color="bg-orange-500"
                />
            </div>

            {/* Recent Activity / Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[300px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Aperçu des Ventes (7 derniers jours actifs)</h3>
                    <div className="flex-1 w-full h-64">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="sales" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                <p>Aucune donnée de vente pour le moment</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Moderation Queue Preview */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">File de Modération</h3>
                        {(stats as any).pendingModeration > 0 && (
                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                                {(stats as any).pendingModeration} en attente
                            </span>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200 p-8">
                        {(stats as any).pendingModeration > 0 ? (
                            <div className="text-center">
                                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-orange-500" />
                                <p className="text-gray-900 font-bold mb-1">Attention requise</p>
                                <p className="text-sm mb-4">Il y a des produits en attente de validation.</p>
                                <a href="/admin/moderation" className="text-teal-600 font-bold hover:underline">
                                    Aller à la modération &rarr;
                                </a>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-gray-900 font-bold">Tout est à jour</p>
                                <p className="text-sm">Aucun produit en attente.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

};

export default AdminDashboard;
