import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, BadgeCheck, Eye, Share2 } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useQuickView } from '../context/QuickViewContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openQuickView } = useQuickView();
  const { addNotification } = useNotifications();
  const { t } = useLanguage();
  const isSaved = isInWishlist(product.id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);

    if (!isSaved) {
      addNotification({
        type: 'success',
        title: t('product.added_wishlist'),
        message: `${product.title} ${t('product.added_wishlist_msg')}`,
        link: '/wishlist'
      });
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}#/product/${product.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, text: `Check out this ${product.title} on Nelo!`, url: shareUrl });
      } catch (err) { console.log('Error sharing:', err); }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        addNotification({ type: 'info', title: t('product.link_copied'), message: t('product.link_copied_msg') });
      } catch (err) { console.error('Failed to copy:', err); }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-500 border border-gray-100 hover:border-gray-200"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out will-change-transform"
            loading="lazy"
          />
        </Link>

        {/* Overlay Gradient (Subtle) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.condition === 'New' && (
            <span className="bg-teal-500/90 backdrop-blur-md text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
              NEW
            </span>
          )}
          {product.seller.isVerified && (
            <span className="bg-white/90 backdrop-blur-md text-teal-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" /> PRO
            </span>
          )}
        </div>

        {/* Hover Actions Pill - Hidden on desktop until hover, always visible on mobile */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-full bg-white/95 backdrop-blur-xl border border-gray-200 shadow-lg opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 ease-out z-20">
          <motion.button
            onClick={handleHeartClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${isSaved ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white text-slate-600 hover:bg-teal-50 hover:text-teal-600 shadow-sm'}`}
            title={t('product.add_wishlist')}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </motion.button>
          <div className="w-px h-5 bg-gray-200"></div>
          <motion.button
            onClick={handleQuickViewClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-full bg-white text-slate-600 hover:text-teal-600 hover:bg-teal-50 flex items-center justify-center transition-all duration-300 shadow-sm"
            title={t('product.quick_view')}
          >
            <Eye className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-0.5">{product.brand || 'Nelo'}</p>
            <Link to={`/product/${product.id}`} className="group-hover:text-teal-700 transition-colors block">
              <h3 className="font-heading font-bold text-slate-900 line-clamp-1 leading-tight text-base">{product.title}</h3>
            </Link>
          </div>
          <p className="font-heading font-extrabold text-lg text-slate-900 tracking-tight">
            {product.price.toLocaleString()} <span className="text-xs font-normal text-slate-400">{product.currency}</span>
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-100 overflow-hidden">
              <img src={product.seller.avatar} alt={product.seller.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs text-slate-500 truncate max-w-[80px]">{product.seller.name}</span>
          </div>
          <motion.button
            onClick={handleShareClick}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="text-slate-300 hover:text-teal-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;