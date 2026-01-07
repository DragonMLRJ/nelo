import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, MapPin, BadgeCheck, Star, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useChat } from './ChatContext';
import { useAuth } from './AuthContext';

interface QuickViewContextType {
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

const QuickViewModal: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createConversation } = useChat();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleMessageSeller = () => {
    onClose();
    if (!user) {
      navigate(`/login?redirect=/product/${product.id}`);
      return;
    }
    if (user.id === product.seller.id) {
      alert("You cannot message yourself!");
      return;
    }
    const conversationId = createConversation(product.seller, product);
    navigate(`/messages?cid=${conversationId}`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col md:flex-row"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image */}
        <div className="w-full md:w-1/2 bg-gray-100 relative h-64 md:h-auto">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
             <span className="bg-white/90 backdrop-blur px-2 py-1 text-xs font-bold uppercase tracking-wider rounded text-gray-800 shadow-sm">
                {product.condition}
             </span>
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                 {product.brand && <p className="text-sm text-gray-500 font-medium mb-1">{product.brand}</p>}
                 <h2 className="text-2xl font-bold text-gray-900 leading-tight">{product.title}</h2>
              </div>
              <p className="text-2xl font-bold text-teal-600 flex-shrink-0 ml-4">
                {product.price.toLocaleString()} {product.currency}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {product.location}
              </span>
              <span>•</span>
              <span>{product.postedAt}</span>
              {product.size && (
                <>
                  <span>•</span>
                  <span className="font-medium text-gray-700">Size: {product.size}</span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6 line-clamp-4">
              {product.description}
            </p>

            <div className="flex gap-3 mb-6">
              <button 
                onClick={handleMessageSeller}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Chat with Seller
              </button>
              <Link 
                to={`/product/${product.id}`}
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                View Full Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Mini Seller Profile */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center gap-3">
                 <div className="relative">
                   <img src={product.seller.avatar} alt={product.seller.name} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                   {product.seller.isVerified && (
                     <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                       <BadgeCheck className="w-3.5 h-3.5 text-teal-600 fill-teal-50" />
                     </div>
                   )}
                 </div>
                 <div className="flex-1">
                   <p className="text-sm font-bold text-gray-900">{product.seller.name}</p>
                   <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span>4.9 (24)</span>
                      <span>•</span>
                      <span>Responds within hour</span>
                   </div>
                 </div>
                 <Link to={`/user/${product.seller.id}`} onClick={onClose} className="text-xs font-bold text-teal-600 hover:underline">
                   View Profile
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const QuickViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const openQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeQuickView = () => {
    setSelectedProduct(null);
  };

  return (
    <QuickViewContext.Provider value={{ openQuickView, closeQuickView }}>
      {children}
      <AnimatePresence>
        {selectedProduct && (
          <QuickViewModal product={selectedProduct} onClose={closeQuickView} />
        )}
      </AnimatePresence>
    </QuickViewContext.Provider>
  );
};

export const useQuickView = () => {
  const context = useContext(QuickViewContext);
  if (context === undefined) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
};