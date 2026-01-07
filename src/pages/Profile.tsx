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
  Clock
} from 'lucide-react';
import OrderCard from '../components/OrderCard';

const Profile: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { getOrdersByBuyer, getOrdersBySeller } = useOrders();
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales' | 'settings'>('purchases');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '' });

  // Initialize form data when entering settings or user changes
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
    if (success) {
      setIsEditing(false);
    } else {
      alert('Échec de la mise à jour du profil');
    }
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
      {/* Header Profile Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-teal-100 p-1 relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-sm"
              />
              {user.isVerified && (
                <div className="absolute bottom-0 right-0 bg-teal-600 text-white p-1 rounded-full border-2 border-white">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-1 justify-center md:justify-start">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center gap-2">
                  {user.isAdmin && (
                    <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold border border-purple-200">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  )}
                  {user.isForumManager && (
                    <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold border border-orange-200">
                      <MessageSquare className="w-3 h-3" /> Modérateur Forum
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1" title="Ville">
                  <MapPin className="w-4 h-4 text-gray-400" /> {user.location || 'Brazzaville, Congo'}
                </span>
                <span className="hidden md:inline text-gray-300">•</span>
                <span className="flex items-center gap-1" title="Membre depuis">
                  <Calendar className="w-4 h-4 text-gray-400" /> Membre depuis {user.memberSince || '2024'}
                </span>
                {user.email && (
                  <>
                    <span className="hidden md:inline text-gray-300">•</span>
                    <span>{user.email}</span>
                  </>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Modifier le profil
                </button>
                <button onClick={logout} className="px-4 py-2 border border-gray-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Se déconnecter
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="flex gap-4 md:gap-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{myPurchases.length}</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Achats</p>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{mySales.length}</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Ventes</p>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{user.responseRate || '100%'}</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide flex items-center gap-1 justify-center">
                  <Clock className="w-3 h-3" /> Taux de rép.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4 mt-4">
          <div className="flex gap-8 border-b border-gray-200 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`pb-4 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap ${activeTab === 'purchases' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <ShoppingBag className="w-4 h-4" /> Mes Commandes
              {activeTab === 'purchases' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`pb-4 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap ${activeTab === 'sales' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <Package className="w-4 h-4" /> Mes Ventes
              {activeTab === 'sales' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap ${activeTab === 'settings' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <Settings className="w-4 h-4" /> Paramètres
              {activeTab === 'settings' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Informations personnelles</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-teal-600 font-bold text-sm hover:underline"
                  >
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-gray-500 font-bold text-sm hover:underline"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="bg-teal-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-teal-700"
                    >
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                    <input
                      type="text"
                      value={isEditing ? formData.name : user.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      readOnly={!isEditing}
                      className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 ${isEditing ? 'bg-white border-teal-500 ring-2 ring-teal-100' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input
                      type="text"
                      value={isEditing ? formData.location : user.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      readOnly={!isEditing}
                      className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 ${isEditing ? 'bg-white border-teal-500 ring-2 ring-teal-100' : ''}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse Email</label>
                  <input type="email" value={user.email || "demo@nelo.cg"} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed" title="Email cannot be changed" />
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Moyens de paiement</h3>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <CreditCard className="w-6 h-6 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">•••• •••• •••• 4242</span>
                    <span className="text-xs text-gray-400 ml-auto">Expire 12/25</span>
                  </div>
                  <button className="text-teal-600 text-sm font-bold mt-3 hover:underline">Ajouter une carte</button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl"
            >
              {displayOrders.length > 0 ? (
                <div className="space-y-4">
                  {displayOrders.map((order) => (
                    <div key={order.id} className="mb-4">
                      <OrderCard order={order} role={activeTab === 'purchases' ? 'buyer' : 'seller'} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune {activeTab === 'purchases' ? 'commande' : 'vente'} pour l'instant</h3>
                  <p className="text-gray-500 text-sm mb-6">Les {activeTab === 'purchases' ? 'articles achetés' : 'articles vendus'} apparaîtront ici.</p>
                  {activeTab === 'purchases' && (
                    <Link to="/catalog" className="inline-block bg-teal-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-teal-700 transition-colors">
                      Commencer à acheter
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