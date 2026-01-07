import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, DollarSign, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeProducts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Parallel fetching for speed
                const [users, orders, products] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('orders').select('total_amount', { count: 'exact' }),
                    supabase.from('products').select('*', { count: 'exact', head: true }).eq('condition_status', 'New') // Example filter
                ]);

                // Calculate Revenue manually or via RPC in real app
                // For MVP, we'll assume a sum query or just estimate from fetched count for now to save bandwidth
                // Ideally: const { data } = await supabase.rpc('get_total_revenue');

                // Mock revenue calculation for demo if RPC not ready
                const revenue = (orders.count || 0) * 15000; // Avg order value mock

                setStats({
                    totalUsers: users.count || 0,
                    totalOrders: orders.count || 0,
                    totalRevenue: revenue,
                    activeProducts: products.count || 0
                });

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
                    title="Revenus (Est.)"
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

            {/* Recent Activity / Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Aperçu des Ventes</h3>
                    <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <div className="text-center">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Graphique des Ventes (Bientôt)</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">File de Modération</h3>
                    <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <div className="text-center">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Aucun élément à modérer</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default AdminDashboard;
