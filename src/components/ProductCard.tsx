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
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-gray-200"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out will-change-transform"
            loading="lazy"
          />
        </Link>

        {/* eBay-style Badges Top Left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.condition === 'New' ? (
            <span className="bg-blue-600 text-white px-2 py-0.5 text-[11px] font-bold rounded shadow-sm">
              NEW
            </span>
          ) : (
            <span className="bg-gray-900/80 backdrop-blur-sm text-white px-2 py-0.5 text-[10px] font-medium uppercase rounded shadow-sm">
              {product.condition}
            </span>
          )}
        </div>

        {/* Hover Actions - Simplified */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <motion.button
            onClick={handleHeartClick}
            whileTap={{ scale: 0.9 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-gray-100 ${isSaved ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'}`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Transactional Content */}
      <div className="p-3 flex flex-col gap-1">
        {/* Title - Descriptive 2 lines */}
        <Link to={`/product/${product.id}`} className="group-hover:text-blue-700 transition-colors block">
          <h3 className="font-sans text-[15px] font-medium text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.title}
          </h3>
        </Link>

        {/* Price - Massive & Bold */}
        <div className="mt-1">
          <span className="font-sans text-xl font-black text-gray-900 tracking-tight">
            {product.currency} {(product.price || 0).toLocaleString()}
          </span>
        </div>

        {/* Trust Signals & Meta */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-100">
          {/* Seller / Rating */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="truncate max-w-[100px]">{product.seller?.name || 'Seller'}</span>
              {product.seller?.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-gray-400 mt-0.5">
              <span>{product.seller?.responseRate || '98%'} positive</span>
            </div>
          </div>

          {/* Location */}
          <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 truncate max-w-[80px]">
            {product.location ? product.location.split(',')[0] : 'Congo'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
