import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Cart: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { items = [], total = 0, itemCount = 0, loading, updateQuantity, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();

    console.log('Cart Render:', { user: !!user, loading, itemCount, itemsLength: items?.length });

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-2xl font-bold mb-4">{t('cart.login_view')}</h2>
                <button
                    onClick={() => navigate('/login?redirect=/cart')}
                    className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700"
                >
                    {t('nav.login')}
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">{t('common.loading')}</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-200" />
                <h2 className="text-3xl font-bold mb-4 text-gray-800">{t('cart.empty')}</h2>
                <p className="text-gray-600 mb-8">{t('cart.start')}</p>
                <button
                    onClick={() => navigate('/catalog')}
                    className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                    {t('nav.browse')}
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t('cart.title')}</h1>
                        <p className="text-gray-600 mt-1">{itemCount} {itemCount === 1 ? t('cart.item') : t('cart.items')}</p>
                    </div>
                </div>
                {items.length > 0 && (
                    <button
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                    >
                        <Trash2 className="w-5 h-5" />
                        {t('cart.clear')}
                    </button>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex gap-4">
                                {/* Product Image */}
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                                />

                                {/* Product Details */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{t('order.sold_by')} {item.seller_name}</p>
                                    <p className="text-teal-600 font-bold text-xl">${item.price.toFixed(2)}</p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                        title="Remove from cart"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => {
                                                if (item.quantity > 1) {
                                                    updateQuantity(item.id, item.quantity - 1);
                                                }
                                            }}
                                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-2 hover:bg-gray-100"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <p className="text-gray-900 font-bold mt-2">
                                        ${item.subtotal.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6 text-gray-900">{t('cart.summary')}</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-700">
                                <span>{t('cart.subtotal')} ({itemCount} {t('cart.items')})</span>
                                <span className="font-semibold">${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>{t('cart.shipping')}</span>
                                <span className="font-semibold text-teal-600">{t('cart.free')}</span>
                            </div>
                            <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-bold">
                                <span>{t('checkout.total')}</span>
                                <span className="text-teal-600">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-teal-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg mb-3"
                        >
                            {t('cart.proceed')}
                        </button>

                        <button
                            onClick={() => navigate('/catalog')}
                            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                            {t('cart.continue')}
                        </button>

                        <div className="mt-6 pt-6 border-t border-gray-300">
                            <p className="text-xs text-gray-500 text-center">
                                {t('cart.secure')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
