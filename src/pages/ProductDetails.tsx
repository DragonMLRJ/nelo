import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, ChevronLeft, Star, ShieldCheck, Heart, Share2, MapPin, MessageCircle, BadgeCheck, HandCoins, X, ShoppingCart, Store, Truck } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { supabase } from '../supabaseClient';
import { SHIPPING_RATES } from '../constants';
import AdBanner from '../components/AdBanner';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import SEO from '../components/SEO';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products } = useProducts();
  const { createConversation, sendMessage } = useChat();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addNotification } = useNotifications();

  const { t } = useLanguage();

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');

  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const product = products.find(p => p.id === id);
  const [selectedImage, setSelectedImage] = useState('');

  // Combine primary image and extra images
  const allImages = React.useMemo(() => {
    if (!product) return [];
    // If product.images exists, use it. Otherwise just product.image
    if (product.images && product.images.length > 0) return product.images;
    return [product.image];
  }, [product]);

  React.useEffect(() => {
    if (allImages.length > 0) {
      setSelectedImage(allImages[0]);
    }
  }, [allImages]);

  React.useEffect(() => {
    if (product) {
      const fetchRelated = async () => {
        try {
          // Fetch related products (same category, different ID) from Supabase
          const { data, error } = await supabase
            .from('products')
            .select(`
              *,
              profiles!seller_id (id, name, avatar, is_verified)
            `)
            .eq('category_id', product.category_id || 0) // Fallback if no category_id
            .neq('id', product.id)
            .limit(5);

          if (error) throw error;

          if (data) {
            const formatted = data.map(p => ({
              ...p,
              image: p.image,
              seller: {
                id: p.profiles?.id.toString(),
                name: p.profiles?.name,
                avatar: p.profiles?.avatar,
                isVerified: p.profiles?.is_verified
              }
            }));
            setRelatedProducts(formatted);
          }
        } catch (err) {
          console.error("Failed to load related products", err);
        }
      };

      fetchRelated();
    }
  }, [product]);

  if (!product) return <div>Article introuvable</div>;

  const isSaved = isInWishlist(product.id);

  // Shipping Calculation
  const getShippingFee = () => {
    if (product.seller.isOfficialStore && product.price >= SHIPPING_RATES.FREE_THRESHOLD) return 0;

    // Default fallback if user location is unknown, assume Inter-city for safety
    if (!user?.location) return SHIPPING_RATES.INTER_CITY;

    const userCity = user.location.split(',')[0].trim();
    const productCity = product.location.split(',')[0].trim();

    return userCity.toLowerCase() === productCity.toLowerCase()
      ? SHIPPING_RATES.SAME_CITY
      : SHIPPING_RATES.INTER_CITY;
  };

  const shippingFee = getShippingFee();

  const handleMessageSeller = () => {
    if (!user) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    // Prevent messaging yourself
    if (user.id === product.seller.id) {
      alert("Vous ne pouvez pas vous envoyer de message !");
      return;
    }

    const conversationId = createConversation(product.seller, product);
    navigate(`/messages?cid=${conversationId}`);
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate(`/login?redirect=/checkout/${id}`);
      return;
    }
    if (user.id === product.seller.id) {
      alert("Vous ne pouvez pas acheter votre propre article !");
      return;
    }
    navigate(`/checkout/${id}`);
  };

  const handleOfferClick = () => {
    if (!user) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    if (user.id === product.seller.id) {
      alert("Vous ne pouvez pas faire une offre sur votre propre article !");
      return;
    }
    setOfferPrice(product.price.toString());
    setIsOfferModalOpen(true);
  };

  const submitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const conversationId = createConversation(product.seller, product);
    const text = `Offre: Je souhaite acheter ceci pour ${Number(offerPrice).toLocaleString()} ${product.currency}. ${offerMessage}`;
    sendMessage(conversationId, text);

    setIsOfferModalOpen(false);
    addNotification({
      type: 'success',
      title: 'Offre envoyée',
      message: `Votre offre de ${Number(offerPrice).toLocaleString()} ${product.currency} a été envoyée à ${product.seller.name}.`
    });

    // Optional: Navigate to chat
    // navigate(`/messages?cid=${conversationId}`);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    if (user.id === product.seller.id) {
      alert("Impossible d'ajouter votre propre article au panier !");
      return;
    }
    await addToCart(product.id);
    addNotification({
      type: 'success',
      title: 'Ajouté au panier',
      message: `${product.title} a été ajouté à votre panier.`
    });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/product/${product.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this ${product.title} on Nelo!`,
          url: shareUrl
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        addNotification({
          type: 'info',
          title: 'Lien copié',
          message: 'Lien copié dans le presse-papiers.'
        });
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      {product && (
        <SEO
          title={`${product.title} - ${product.price.toLocaleString()} ${product.currency}`}
          description={product.description.substring(0, 160)}
          image={product.image}
          type="product"
          slug={`/product/${product.id}`}
        />
      )}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Images */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-[4/5] mb-4 relative drop-shadow-sm">
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {/* Zoom/Fullscreen Icon could go here */}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {allImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square bg-gray-100 rounded cursor-pointer overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-teal-500 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <p className="text-gray-500 text-sm">
                  {product.size && <span className="mr-3">{product.size}</span>}
                  <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-semibold uppercase">{product.condition}</span>
                </p>
              </div>
              <h2 className="text-2xl font-bold text-teal-600">{product.price.toLocaleString()} {product.currency}</h2>
            </div>

            <div className="border-t border-b border-gray-100 py-4 my-4">
              <p className="text-gray-700 leading-relaxed mb-4">{product.description}</p>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" /> {product.location} • Posted {product.postedAt}
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={handleBuyNow}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-teal-700 hover:shadow-lg transition-all transform active:scale-[0.98]"
              >
                {t('product.buy_now')}
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full border-2 border-teal-600 text-teal-600 py-3 rounded-lg font-bold hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> {t('product.add_cart')}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleOfferClick}
                  className="flex-1 border-2 border-teal-600 text-teal-600 py-3 rounded-lg font-bold hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
                >
                  <HandCoins className="w-4 h-4" /> {t('product.make_offer')}
                </button>
                <button
                  onClick={handleMessageSeller}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> {t('product.message_seller')}
                </button>
              </div>
            </div>

            <div className="flex gap-4 justify-center mb-8">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${isSaved ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? t('product.saved') : t('product.add_fav')}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 border border-gray-200 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> {t('product.share')}
              </button>
            </div>

            {/* Seller Card - Enhanced */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm relative">
                    <img src={product.seller.avatar} alt={product.seller.name} className="w-full h-full object-cover" />
                    {product.seller.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <BadgeCheck className="w-4 h-4 text-teal-600 fill-teal-50" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm text-gray-900">{product.seller.name}</p>
                      {product.seller.isVerified && (
                        <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">{t('product.verified_seller')}</span>
                      )}
                      {product.seller.isOfficialStore && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide flex items-center gap-1">
                          <Store className="w-3 h-3" /> Official Store
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-gray-700 font-medium">4.8</span>
                      <span className="text-gray-400">(24)</span>
                    </div>
                  </div>
                </div>
                <Link to={`/user/${product.seller.id}`} className="text-teal-600 text-sm font-bold hover:underline">{t('common.view')} Profile</Link>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">{t('product.response_rate')}</p>
                  <p className="text-sm font-bold text-gray-800">{product.seller.responseRate || 'N/A'}</p>
                </div>
                <div className="text-center border-l border-gray-200">
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">{t('product.member_since')}</p>
                  <p className="text-sm font-bold text-gray-800">{product.seller.memberSince || '2024'}</p>
                </div>
                <div className="text-center border-l border-gray-200">
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">{t('product.location')}</p>
                  <p className="text-sm font-bold text-gray-800 truncate px-1">{product.seller.location || product.location}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-start gap-3 mb-4">
                <Truck className="w-6 h-6 text-teal-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Estimated Shipping</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {shippingFee === 0
                      ? <span className="text-green-600 font-bold">Free Shipping (Official Store Offer)</span>
                      : `${shippingFee.toLocaleString()} ${product.currency} to ${user?.location || 'your location'}`
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-teal-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{t('product.buyer_protection')}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('product.protection_desc')}
                  </p>
                </div>
              </div>
            </div>


            <div className="mt-8 border-t border-gray-100 pt-8" id="reviews">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">{t('review.customer_reviews')}</h3>
                {user && user.id !== product.seller.id && (
                  <button
                    onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                    className="text-teal-600 font-bold hover:underline"
                  >
                    {isReviewFormOpen ? t('common.cancel') : t('review.write_btn')}
                  </button>
                )}
              </div>

              {isReviewFormOpen && (
                <div className="mb-8">
                  <ReviewForm
                    productId={parseInt(product.id)}
                    onSuccess={() => {
                      setIsReviewFormOpen(false);
                      setRefreshReviews(prev => prev + 1);
                      addNotification({
                        type: 'success',
                        title: 'Review Submitted',
                        message: 'Thank you for your feedback!'
                      });
                    }}
                    onCancel={() => setIsReviewFormOpen(false)}
                  />
                </div>
              )}

              <ReviewList productId={parseInt(product.id)} refreshTrigger={refreshReviews} />
            </div>

            <AdBanner slot="product-detail-sidebar" format="box" className="mt-6" />
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-xl font-bold mb-6">{t('product.related')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {relatedProducts.length > 0 ? (
            relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full">No related products found.</p>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      <AnimatePresence>
        {isOfferModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-xl shadow-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-teal-50">
                <h3 className="font-bold text-teal-900">Faire une offre</h3>
                <button onClick={() => setIsOfferModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={submitOffer} className="p-6">
                <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-lg">
                  <img src={product.image} alt="" className="w-12 h-12 object-cover rounded bg-white border border-gray-200" />
                  <div>
                    <p className="text-xs text-gray-500 line-clamp-1">{product.title}</p>
                    <p className="text-sm font-bold text-gray-900">Prix: {product.price.toLocaleString()} {product.currency}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Votre Offre ({product.currency})</label>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-bold text-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="0"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Suggéré: {(product.price * 0.9).toLocaleString()} - {product.price.toLocaleString()}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message (Optionnel)</label>
                  <textarea
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Je peux passer le chercher aujourd'hui..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-teal-700 transition-colors"
                >
                  Envoyer l'offre
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );


};

export default ProductDetails;