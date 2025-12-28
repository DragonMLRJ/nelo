import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext'; // Import CartContext
import { ShieldCheck, CreditCard, CheckCircle, Truck, Package } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

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
      condition: getProductById(productId)?.condition || 'New'
    }] : [])
    : cartItems;

  const subtotal = productId
    ? (checkoutItems[0]?.price || 0)
    : cartTotal;

  // Assuming XAF for demo if mixed, or taking first item's currency
  const currency = checkoutItems[0]?.currency || 'XAF';
  const shippingFee = 2500;
  const protectionFee = 500;
  const total = subtotal + shippingFee + protectionFee;

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/checkout/${productId || ''}`);
    }
  }, [user, navigate, productId]);

  if (checkoutItems.length === 0) {
    return <div className="p-8 text-center">{t('checkout.no_items')} <button onClick={() => navigate('/catalog')} className="text-teal-600 underline">{t('checkout.browse_catalog')}</button></div>;
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsProcessing(true);

    const orderPayload = {
      buyerId: user.id,
      shippingAddress: user.location || "123 Main St, Brazzaville, Congo",
      paymentMethod: 'card',
      items: checkoutItems.map(item => ({
        productId: item.product_id || (item as any).id, // Handle different ID structures if necessary. CartItem has product_id. Product has id.
        quantity: item.quantity || 1
      }))
    };

    // Handle "Buy Now" structure which uses Product type directly mapped above
    if (productId) {
      orderPayload.items = [{ productId: productId, quantity: 1 }];
    }

    const result = await addOrder(orderPayload);

    setIsProcessing(false);

    if (result.success) {
      setOrderIds(result.orderIds);
      setIsSuccess(true);
      if (!productId) {
        clearCart(); // Clear cart only if it was a cart checkout
      }
    } else {
      alert('Payment failed: ' + result.error);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('checkout.success')}</h2>
          <p className="text-gray-500 mb-6">
            {t('checkout.thank_you')}
            {orderIds.length > 0 && <span className="block mt-2 text-sm font-mono bg-gray-100 p-2 rounded">Order #{orderIds.join(', #')}</span>}
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors"
          >
            {t('checkout.view_orders')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t('checkout.title')}</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Shipping & Payment */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-500" /> {t('checkout.shipping')}
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="font-bold">{user?.name}</p>
              <p>{user?.location || "123 Main St, Brazzaville, Congo"}</p>
              <button className="text-teal-600 text-sm font-bold mt-2 hover:underline">{t('checkout.change_address')}</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-500" /> {t('checkout.payment')}
            </h3>
            <form onSubmit={handlePayment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.card_number')}</label>
                  <input type="text" placeholder="0000 0000 0000 0000" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.expiry')}</label>
                    <input type="text" placeholder="MM/YY" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.cvc')}</label>
                    <input type="text" placeholder="123" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 text-sm text-gray-500">
                  <span>{t('checkout.secure_ssl')}</span>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold mt-4 hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    `${t('checkout.pay')} ${total.toLocaleString()} ${currency}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4">{t('checkout.summary')} ({checkoutItems.length} {t('cart.items')})</h3>

            <div className="max-h-[300px] overflow-y-auto pr-2 mb-4 space-y-4">
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <img src={item.image} alt={item.title} className="w-16 h-16 rounded-md object-cover bg-gray-100 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2">{item.title}</h4>
                    <p className="text-gray-500 text-xs">{t('cart.item')} {idx + 1}</p>
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
                <span className="text-gray-500">{t('checkout.subtotal')}</span>
                <span>{subtotal.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('cart.shipping')}</span>
                <span>{shippingFee.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('checkout.buyer_protection_fee')}</span>
                <span>{protectionFee.toLocaleString()} {currency}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg">
              <span>{t('checkout.total')}</span>
              <span>{total.toLocaleString()} {currency}</span>
            </div>

            <div className="mt-6 flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
              <p className="text-xs text-gray-500">
                {t('checkout.secure_desc_short')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;