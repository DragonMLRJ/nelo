import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Star,
  Flag,
  BadgeCheck,
  MessageCircle,
  Share2,
  AlertTriangle,
  X,
  Check,
  Clock,
  Package
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { user } = useAuth();
  const { createConversation } = useChat();
  const { t } = useLanguage();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [hasReported, setHasReported] = useState(false);

  // Find user data from mock products
  const productWithSeller = products.find(p => p.seller.id === userId);

  // Fallback mock data
  const profileUser = productWithSeller ? productWithSeller.seller : {
    id: userId || 'unknown',
    name: 'Nelo User',
    avatar: 'https://ui-avatars.com/api/?name=Nelo+User&background=random',
    isVerified: false,
    memberSince: '2024',
    responseRate: '98%',
    location: 'Brazzaville, Congo'
  };

  const userListings = products.filter(p => p.seller.id === userId);

  const handleMessageUser = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.id === profileUser.id) {
      alert("You cannot message yourself!");
      return;
    }

    // Create generic conversation with this user
    const convId = createConversation(profileUser);
    navigate(`/messages?cid=${convId}`);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setHasReported(true);
      setIsReportModalOpen(false);
      setReportReason('');
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 pb-20"
    >
      {/* Decorative Background */}
      <div className="h-64 bg-gradient-to-r from-teal-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* Sidebar: Profile Info & Stats */}
          <div className="lg:col-span-4 space-y-6">
            {/* Main Profile Card - Glassmorphism */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-purple-500"></div>

              <div className="w-28 h-28 mx-auto rounded-full bg-white p-1 shadow-lg relative -mt-4 mb-5">
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="w-full h-full object-cover rounded-full bg-gray-100"
                />
                {profileUser.isVerified && (
                  <div className="absolute bottom-0 right-0 bg-teal-600 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Compte vérifié">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2 font-outfit">{profileUser.name}</h1>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100 text-sm font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" /> 4.9
                </span>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-gray-500 text-sm">24 avis</span>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleMessageUser}
                  className="w-full bg-teal-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5" /> {t('profile.message')}
                </button>
                <div className="flex gap-3">
                  <button className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" /> {t('profile.share')}
                  </button>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    disabled={hasReported}
                    className={`flex-1 py-2.5 border border-gray-200 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium ${hasReported ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-red-50 text-gray-600 hover:text-red-600 hover:border-red-100'}`}
                  >
                    <Flag className={`w-4 h-4 ${hasReported ? 'fill-gray-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Info List */}
              <div className="mt-8 space-y-4 text-left border-t border-gray-100 pt-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">{t('product.location')}</p>
                    <p className="font-medium text-gray-900">{profileUser.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-100 transition-colors">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">{t('product.member_since')}</p>
                    <p className="font-medium text-gray-900">{profileUser.memberSince}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">{t('product.response_rate')}</p>
                    <p className="font-medium text-gray-900">{profileUser.responseRate || '100%'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
                <p className="text-3xl font-bold text-teal-600 font-outfit">{userListings.length}</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('profile.listings')}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
                <p className="text-3xl font-bold text-indigo-600 font-outfit">12</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('profile.sold')}</p>
              </div>
            </div>
          </div>

          {/* Main Content: Listings */}
          <div className="lg:col-span-8 pt-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 font-outfit flex items-center gap-2">
                <span className="w-2 h-8 bg-teal-500 rounded-full"></span>
                {t('profile.listings')}
              </h2>

            </div>

            {userListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListings.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-16 rounded-3xl text-center border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-1">{t('profile.no_listings')}</p>
                <p className="text-gray-500 text-sm">Cet utilisateur n'a pas encore mis d'articles en vente.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> {t('profile.report_title')}
                </h3>
                <button onClick={() => setIsReportModalOpen(false)} className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-600 shadow-sm border border-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="p-6">
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  {t('profile.report_msg')} <span className="font-bold text-gray-900">{profileUser.name}</span>.
                  Nous prenons chaque signalement très au sérieux.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    t('report.suspicious') || 'Compte suspect ou spam',
                    t('report.inappropriate') || 'Contenu inapproprié',
                    t('report.harassment') || 'Harcèlement',
                    t('report.prohibited') || 'Article interdit',
                    t('report.other') || 'Autre raison'
                  ].map(reason => (
                    <label key={reason} className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-red-50 hover:border-red-100 transition-all group">
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="report_reason"
                          value={reason}
                          checked={reportReason === reason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-red-500 peer-checked:border-[6px] transition-all bg-white"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-red-700">{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {t('profile.report_cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!reportReason}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {t('profile.report_submit')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {hasReported && !isReportModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 bg-gray-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 border border-white/10"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Signalement envoyé</p>
              <p className="text-xs text-gray-400">{t('profile.report_success')}</p>
            </div>
            <button onClick={() => setHasReported(false)} className="ml-2 text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserProfile;