import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  MapPin,
  Settings,
  LogOut,
  Calendar,
  CheckCircle,
  Truck,
  MoreHorizontal,
  CreditCard,
  User as UserIcon,
  Shield,
  MessageSquare,
  Clock,
  Download
} from 'lucide-react';
import OrderCard from '../components/OrderCard';
import { exportToCSV } from '../utils/exportUtils';

const Profile: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { getOrdersByBuyer, getOrdersBySeller } = useOrders();
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales' | 'settings'>('purchases');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '' });

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        location: user.location || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    const success = await updateProfile({
      name: formData.name,
      location: formData.location
    });
    if (success) setIsEditing(false);
    else alert('Échec de la mise à jour du profil');
  };

  if (!user) return <Navigate to="/login" />;

  const myPurchases = getOrdersByBuyer(user.id);
  const mySales = getOrdersBySeller(user.id);
  const displayOrders = activeTab === 'purchases' ? myPurchases : mySales;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 pb-20"
    >
      {/* Premium Header Section */}
      <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white pb-12">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-28 h-28 rounded-full p-1 relative ring-4 ring-white/10">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover border-4 border-teal-900 shadow-xl"
              />
              {user.isVerified && (
                <div className="absolute bottom-1 right-1 bg-teal-500 text-white p-1 rounded-full border-4 border-teal-900">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-2 justify-center md:justify-start">
                <h1 className="text-3xl font-bold font-outfit tracking-tight">{user.name}</h1>
                <div className="flex items-center gap-2">
                  {user.isAdmin && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-500/30 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  )}
                  {user.isForumManager && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-200 border border-orange-500/30 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Modérateur Forum
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-teal-100/80 mb-6">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {user.location || 'Brazzaville, Congo'}
                </span>
                <span className="hidden md:inline text-teal-100/30">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Membre depuis {user.memberSince || '2024'}
                </span>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button onClick={logout} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold backdrop-blur-sm transition-all border border-white/10 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Se déconnecter
                </button>
              </div>
            </div>

            {/* Stats Cards - Glassmorphism */}
            <div className="flex flex-wrap gap-4 md:gap-0 md:divide-x divide-white/10 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <div className="flex-1 min-w-[100px] px-6 py-4 text-center">
                <p className="text-2xl font-bold text-white">{myPurchases.length}</p>
                <p className="text-xs text-teal-200 uppercase font-bold tracking-wider">Achats</p>
              </div>
              <div className="flex-1 min-w-[100px] px-6 py-4 text-center">
                <p className="text-2xl font-bold text-white">{mySales.length}</p>
                <p className="text-xs text-teal-200 uppercase font-bold tracking-wider">Ventes</p>
              </div>
              <div className="flex-1 min-w-[100px] px-6 py-4 text-center">
                <p className="text-2xl font-bold text-white">{user.responseRate || '100%'}</p>
                <p className="text-xs text-teal-200 uppercase font-bold tracking-wider">Taux Rép.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto hide-scrollbar">
            {[
              { id: 'purchases', label: 'Mes Commandes', icon: ShoppingBag },
              { id: 'sales', label: 'Mes Ventes', icon: Package },
              { id: 'settings', label: 'Paramètres', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-5 text-sm font-bold flex items-center gap-2.5 transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-teal-700' : 'text-gray-500 hover:text-gray-800'}`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-10">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 font-outfit">Informations personnelles</h3>
                      <p className="text-gray-500">Gérez vos informations de profil et de contact.</p>
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-teal-600 font-bold bg-teal-50 px-4 py-2 rounded-xl hover:bg-teal-100 transition-colors"
                      >
                        Modifier
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-colors"
                        >
                          Enregistrer
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Nom complet</label>
                        <input
                          type="text"
                          value={isEditing ? formData.name : user.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          readOnly={!isEditing}
                          className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-medium outline-none transition-all ${isEditing ? 'focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500' : 'opacity-70'}`}
                        />
                      </div>
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Adresse Email</label>
                        <input
                          type="email"
                          value={user.email || "demo@nelo.cg"}
                          readOnly
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-400 font-medium cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Ville</label>
                        <input
                          type="text"
                          value={isEditing ? formData.location : user.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          readOnly={!isEditing}
                          className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-medium outline-none transition-all ${isEditing ? 'focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500' : 'opacity-70'}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-10 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Moyens de paiement</h3>
                    <div className="flex items-center justify-between p-5 border border-gray-200 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg border border-gray-200">
                          <CreditCard className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Visa terminant par 4242</p>
                          <p className="text-sm text-gray-500">Expire 12/25</p>
                        </div>
                      </div>
                      <button className="text-teal-600 text-sm font-bold group-hover:underline">Modifier</button>
                    </div>
                    <button className="mt-4 text-teal-600 text-sm font-bold hover:underline flex items-center gap-1">
                      + Ajouter une carte
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto"
            >
              {displayOrders.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => {
                        const data = displayOrders.map(o => ({
                          Date: new Date(o.created_at).toLocaleDateString(),
                          'Order #': o.order_number,
                          [activeTab === 'purchases' ? 'Seller' : 'Buyer']: o.counterparty_name,
                          Amount: `${o.total_amount} ${o.currency}`,
                          Status: o.status
                        }));
                        exportToCSV(data, `nelo_${activeTab}_${new Date().toISOString().split('T')[0]}`);
                      }}
                      className="flex items-center gap-2 text-teal-600 font-bold hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" /> Exporter CSV
                    </button>
                  </div>
                  {displayOrders.map((order) => (
                    <div key={order.id} className="transform transition-all hover:translate-y-[-2px]">
                      <OrderCard order={order} role={activeTab === 'purchases' ? 'buyer' : 'seller'} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-teal-600/50" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 font-outfit">Aucune {activeTab === 'purchases' ? 'commande' : 'vente'}</h3>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    {activeTab === 'purchases'
                      ? "Vous n'avez pas encore passé de commande. Explorez le catalogue !"
                      : "Vous n'avez aucun article en vente pour le moment."}
                  </p>
                  {activeTab === 'purchases' ? (
                    <Link to="/catalog" className="inline-block bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-1">
                      Découvrir nos produits
                    </Link>
                  ) : (
                    <Link to="/sell" className="inline-block bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-1">
                      Vendre un article
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Profile;