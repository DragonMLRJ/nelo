import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, BadgeCheck, Eye, Share2 } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useQuickView } from '../context/QuickViewContext';
import { useNotifications } from '../context/NotificationContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openQuickView } = useQuickView();
  const { addNotification } = useNotifications();
  const isSaved = isInWishlist(product.id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);

    // Feedback notification
    if (!isSaved) {
      addNotification({
        type: 'success',
        title: 'Added to Wishlist',
        message: `${product.title} has been saved to your favorites.`,
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

    // Construct URL based on current location protocol/host and HashRouter convention
    const shareUrl = `${window.location.origin}${window.location.pathname}#/product/${product.id}`;

    const shareData = {
      title: product.title,
      text: `Check out this ${product.title} on Nelo!`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        addNotification({
          type: 'info',
          title: 'Link Copied',
          message: 'Product link copied to clipboard.',
        });
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group border border-gray-100 relative"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Condition Badge */}
        <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded text-gray-700 shadow-sm border border-gray-100 z-10">
          {product.condition}
        </span>

        {/* Action Overlay (Desktop: Appear on Hover, Mobile: Always visible or handled via layout) */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleQuickViewClick}
            className="bg-white text-gray-800 px-4 py-2 rounded-full font-medium text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2 hover:bg-teal-600 hover:text-white"
          >
            <Eye className="w-4 h-4" /> Quick View
          </button>
        </div>

        {/* Overlay Verified Badge for Image */}
        {product.seller.isVerified && (
          <span className="absolute bottom-2 left-2 bg-white/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded text-teal-700 flex items-center gap-1 shadow-sm z-10">
            <BadgeCheck className="w-3 h-3" /> Verified
          </span>
        )}
      </Link>

      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-gray-900 truncate pr-2">{product.price.toLocaleString()} {product.currency}</h3>
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleShareClick}
              className="text-gray-400 hover:text-teal-600 transition-colors relative z-20 p-1 rounded-full hover:bg-teal-50"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleHeartClick}
              className={`transition-colors relative z-20 p-1 rounded-full hover:bg-red-50 ${isSaved ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <span>{product.brand || 'Unbranded'}</span>
          {product.size && (
            <>
              <span>•</span>
              <span>{product.size}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-50 mt-1">
          {/* Seller small info */}
          <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            <img src={product.seller.avatar} alt={product.seller.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <span className="text-xs text-gray-500 truncate">{product.seller.name}</span>
            {product.seller.isVerified && (
              <BadgeCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" aria-label="Verified Seller" />
            )}
          </div>
          <span className="text-xs text-gray-300 flex-shrink-0">{product.likes} likes</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;