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
  Clock
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
    // Simulate API call
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
      {/* Header / Cover */}
      <div className="bg-teal-700 h-32 md:h-48 relative">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="grid md:grid-cols-4 gap-6">

          {/* Sidebar: Profile Info & Stats */}
          <div className="md:col-span-1 space-y-6">
            {/* Main Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center relative overflow-hidden">
              <div className="w-24 h-24 mx-auto rounded-full bg-white p-1 shadow-md relative -mt-12 mb-4">
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="w-full h-full object-cover rounded-full bg-gray-200"
                />
                {profileUser.isVerified && (
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                    <BadgeCheck className="w-5 h-5 text-teal-600 fill-teal-50" />
                  </div>
                )}
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-1">{profileUser.name}</h1>
              <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold text-sm mb-4">
                <Star className="w-4 h-4 fill-current" /> 4.9 (24)
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleMessageUser}
                  className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> {t('profile.message')}
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" /> {t('profile.share')}
                  </button>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    disabled={hasReported}
                    className={`flex-1 py-2 border border-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2 ${hasReported ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-red-50 text-gray-600 hover:text-red-600 hover:border-red-200'}`}
                    title={t('profile.report')}
                  >
                    <Flag className={`w-4 h-4 ${hasReported ? 'fill-gray-400' : ''}`} /> {t('profile.report')}
                  </button>
                </div>
              </div>
            </div>

            {/* About Seller Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{t('profile.about')}</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('product.location')}</p>
                    <p className="font-medium text-gray-900">{profileUser.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('product.member_since')}</p>
                    <p className="font-medium text-gray-900">{profileUser.memberSince}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('product.response_rate')}</p>
                    <p className="font-medium text-gray-900">{profileUser.responseRate || '100%'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-teal-600">{userListings.length}</p>
                  <p className="text-xs text-gray-500 font-medium">{t('profile.listings')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">12</p>
                  <p className="text-xs text-gray-500 font-medium">{t('profile.sold')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Listings */}
          <div className="md:col-span-3 pt-6 md:pt-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900">{t('profile.listings')}</h2>
              <p className="text-gray-500 text-sm">{t('home.see_all')}</p>
            </div>

            {userListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userListings.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl text-center border border-dashed border-gray-200">
                <p className="text-gray-500">{t('profile.no_listings')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> {t('profile.report_title')}
                </h3>
                <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  {t('profile.report_msg')} <span className="font-bold">{profileUser.name}</span>.
                </p>

                <div className="space-y-3 mb-6">
                  {['Suspicious or spam account', 'Inappropriate content', 'Harassment or offensive behavior', 'Selling prohibited items', 'Other'].map(reason => (
                    <label key={reason} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="report_reason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t('profile.report_cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!reportReason}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50"
          >
            <Check className="w-5 h-5 text-green-400" />
            <span className="font-medium text-sm">{t('profile.report_success')}</span>
            <button onClick={() => setHasReported(false)} className="ml-2 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserProfile;