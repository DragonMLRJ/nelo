import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext'; // Import CartContext
import { ShieldCheck, CreditCard, CheckCircle, Truck, Package, Banknote, Building2 } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

import PaymentModal from '../components/PaymentModal';
import { SHIPPING_RATES } from '../constants';

const Checkout: React.FC = () => {
  const { t } = useLanguage();
  const { productId } = useParams<{ productId: string }>();
  const { getProductById } = useProducts();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const { items: cartItems, clearCart, total: cartTotal } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  /* paymentMethod already defined above */
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Determine items to checkout
  const checkoutItems = productId
    ? (getProductById(productId) ? [{
      id: 'temp',
      product_id: productId,
      quantity: 1,
      title: getProductById(productId)?.title,
      price: getProductById(productId)?.price,
      image: getProductById(productId)?.image,
      currency: getProductById(productId)?.currency,
      condition: getProductById(productId)?.condition || 'New',
      seller_id: getProductById(productId)?.seller.id
    }] : [])
    : cartItems;

  const subtotal = productId
    ? (checkoutItems[0]?.price || 0)
    : cartTotal;

  // Assuming XAF for demo if mixed, or taking first item's currency
  /* currency already defined above */
  const currency = checkoutItems[0]?.currency || 'XAF';

  // Calculate Shipping Fee
  const shippingFee = React.useMemo(() => {
    if (!user?.location || checkoutItems.length === 0) return SHIPPING_RATES.INTER_CITY;

    // Simple logic: if any item is from a different city, charge Inter-city
    // If official store and > threshold, free shipping.

    // Check for Official Store Free Shipping (assuming first item determines store for now)
    // In a real app with mixed cart, this would be per-seller.
    // For MVP, we use the first item's seller info if available (which we don't fully have in CartItem, 
    // so we might need to rely on what we have).

    // Note: checkoutItems from CartContext might not have 'seller' object fully populated with 'isOfficialStore'
    // unless we updated CartContext or passed it. 
    // BUT we can check the 'productId' via 'getProductById' which we have.

    const firstProduct = getProductById(checkoutItems[0].product_id || (checkoutItems[0] as any).id);

    if (firstProduct) {
      if (firstProduct.seller.isOfficialStore && subtotal >= SHIPPING_RATES.FREE_THRESHOLD) {
        return 0;
      }

      const userCity = user.location.split(',')[0].trim().toLowerCase();
      const productCity = firstProduct.location.split(',')[0].trim().toLowerCase();

      return userCity === productCity ? SHIPPING_RATES.SAME_CITY : SHIPPING_RATES.INTER_CITY;
    }

    return SHIPPING_RATES.INTER_CITY;
  }, [user, checkoutItems, subtotal, getProductById]);

  const protectionFee = 500;
  const total = subtotal + shippingFee + protectionFee;

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/checkout/${productId || ''}`);
    }
  }, [user, navigate, productId]);

  if (checkoutItems.length === 0) {
    return <div className="p-8 text-center">Votre panier est vide. <button onClick={() => navigate('/catalog')} className="text-teal-600 underline">Parcourir le catalogue</button></div>;
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (paymentMethod === 'card') {
      setShowPaymentModal(true);
      return;
    }

    // For COD
    handleOrderPlacement({});
  };

  const handleOrderPlacement = async (paymentDetails: any) => {
    setIsProcessing(true);
    setShowPaymentModal(false);

    const orderPayload = {
      buyerId: user?.id,
      shippingAddress: user?.location || "123 Main St, Brazzaville, Congo",
      paymentMethod: paymentMethod,
      sellerId: (checkoutItems[0] as any).seller_id, // Get seller from first item
      total: total,
      items: checkoutItems.map(item => ({
        productId: item.product_id || (item as any).id,
        quantity: item.quantity || 1,
        price: item.price,
        title: item.title,
        image: item.image
      })),
      paymentDetails
    };

    // Handle "Buy Now" - Logic is already handled in checkoutItems map above

    const result = await addOrder(orderPayload);

    setIsProcessing(false);

    if (result.success) {
      setOrderIds(result.orderIds);
      setIsSuccess(true);
      if (!productId) {
        clearCart(); // Clear cart only if it was a cart checkout
      }

      // 3. Trigger Email Confirmation (Backend)
      try {
        await fetch('/api/orders/confirmation.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user?.email,
            orderNumber: result.orderIds[0] || 'ORD-UNKNOWN',
            totalAmount: total,
            currency: currency,
            paymentMethod: paymentMethod,
            shippingAddress: user?.location || 'Unknown Address',
            items: checkoutItems.map(item => ({
              quantity: item.quantity || 1,
              product: { title: item.title, price: item.price }
            }))
          })
        });
      } catch (err) {
        console.error("Failed to trigger email confirmation", err);
        // Don't block success screen, just log
      }

    } else {
      alert('Échec du paiement : ' + result.error);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h2>
          <p className="text-gray-500 mb-6">
            Merci pour votre commande.
            {orderIds.length > 0 && <span className="block mt-2 text-sm font-mono bg-gray-100 p-2 rounded">Commande #{orderIds.join(', #')}</span>}
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors"
          >
            Voir mes commandes
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="Paiement"
        description="Finalisez votre commande en toute sécurité."
      />
      <h1 className="text-2xl font-bold mb-8">Finaliser la commande</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Shipping & Payment */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-500" /> Livraison
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="font-bold">{user?.name}</p>
              <p>{user?.location || "123 Main St, Brazzaville, Congo"}</p>
              <button className="text-teal-600 text-sm font-bold mt-2 hover:underline">Modifier l'adresse</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-500" /> Paiement
            </h3>

            <form onSubmit={handlePayment}>
              {/* Payment Method Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === 'card' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs font-bold text-center">Mobile Money / Carte</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === 'cod' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <Banknote className="w-6 h-6" />
                  <span className="text-xs font-bold text-center">Paiement à la livraison</span>
                </button>
              </div>

              {/* Conditional Content */}
              <div className="space-y-4">
                {paymentMethod === 'card' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 flex gap-3 text-sm text-teal-800">
                      <CreditCard className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-bold">Paiement sécurisé via Flutterwave</p>
                        <p>Accepte Mobile Money (Airtel/MTN) et Cartes Bancaires.</p>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-sm text-orange-800 animate-fadeIn">
                    <p className="font-bold mb-1">Payez à la réception !</p>
                    <p>Merci de préparer le montant exact de <strong>{total.toLocaleString()} {currency}</strong> pour le livreur.</p>
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer select-none">
                    J'ai lu et j'accepte les <a href="/terms" target="_blank" className="text-teal-600 hover:underline">Conditions Générales</a>,
                    la <a href="/privacy" target="_blank" className="text-teal-600 hover:underline">Politique de Confidentialité</a> et
                    la <a href="/refund-policy" target="_blank" className="text-teal-600 hover:underline">Politique de Retour</a> de Nelo Marketplace.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !agreedToTerms}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Traitement en cours... Ne fermez pas la fenêtre.</span>
                    </div>
                  ) : (
                    paymentMethod === 'card'
                      ? `Payer maintenant (${total.toLocaleString()} ${currency})`
                      : `Confirmer la commande (${total.toLocaleString()} ${currency})`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4">Résumé ({checkoutItems.length} articles)</h3>

            <div className="max-h-[300px] overflow-y-auto pr-2 mb-4 space-y-4">
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <img src={item.image} alt={item.title} className="w-16 h-16 rounded-md object-cover bg-gray-100 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2">{item.title}</h4>
                    <p className="text-gray-500 text-xs">Article {idx + 1}</p>
                    <p className="text-gray-500 text-xs">{(item as any).condition || 'New'}</p>
                  </div>
                  <div className="ml-auto font-bold text-sm">
                    {((item.price || 0) * (item.quantity || 1)).toLocaleString()} {currency}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total</span>
                <span>{subtotal.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Livraison</span>
                <span>{shippingFee.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Frais de protection</span>
                <span>{protectionFee.toLocaleString()} {currency}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{total.toLocaleString()} {currency}</span>
            </div>

            <div className="mt-6 flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
              <p className="text-xs text-gray-500">
                Paiement sécurisé et garantie acheteur inclus.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Payment Modal */}
      {showPaymentModal && user && (
        <PaymentModal
          amount={total}
          email={user.email}
          name={user.name}
          phone={user.phone || '000000000'} // Fallback if no phone
          onSuccess={(response) => {
            handleOrderPlacement({ payment_reference: response.tx_ref });
          }}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default Checkout;