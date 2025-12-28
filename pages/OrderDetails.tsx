import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Package, Truck, Calendar, User as UserIcon, Shield } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

const OrderDetails: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // In a real app we'd fetch specific order details from API
    // For now we'll simulate fetching or use context if it had a direct get
    const API_BASE = '/api';

    useEffect(() => {
        const fetchOrder = async () => {
            if (!user || !orderId) return;
            try {
                const response = await fetch(`${API_BASE}/orders/index.php?action=details&orderId=${orderId}`);
                const data = await response.json();
                if (data.success) {
                    setOrder(data.order);
                }
            } catch (error) {
                console.error('Failed to fetch order', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, user]);

    if (loading) return <div className="p-8 text-center">Loading order...</div>;
    if (!order) return <div className="p-8 text-center">Order not found</div>;

    const isSeller = user?.id === order.seller_id;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Orders
            </button>

            <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_number || order.id}</h1>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold capitalize">
                            {order.status}
                        </span>
                    </div>
                    <p className="text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {isSeller && order.status === 'pending' && (
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                            Mark as Shipped
                        </button>
                    )}
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                        Contact {isSeller ? 'Buyer' : 'Seller'}
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-gray-500" /> Items
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {(order.items || []).map((item: any) => (
                                <div key={item.id} className="p-4 flex gap-4">
                                    <img
                                        src={item.image || item.product_snapshot && JSON.parse(item.product_snapshot).image}
                                        alt={item.title}
                                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        <p className="text-sm text-gray-500">{item.unit_price?.toLocaleString()} {order.currency || 'XAF'} each</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-gray-900">
                                            {item.subtotal?.toLocaleString()} {order.currency || 'XAF'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline / Tracking (Placeholder) */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-gray-500" /> Order Status
                        </h3>
                        <div className="relative pl-8 border-l-2 border-gray-200 space-y-8">
                            <div className="relative">
                                <div className="absolute -left-[37px] w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm ring-1 ring-gray-200"></div>
                                <p className="font-bold text-gray-900">Order Placed</p>
                                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            {order.status !== 'pending' && (
                                <div className="relative">
                                    <div className="absolute -left-[37px] w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm ring-1 ring-gray-200"></div>
                                    <p className="font-bold text-gray-900">Processing</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Customer/Seller Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4">
                            {isSeller ? 'Customer' : 'Seller'} Info
                        </h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{isSeller ? order.buyer_name : order.seller_name}</p>
                                <p className="text-xs text-gray-500">{isSeller ? order.buyer_email : order.seller_email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4">Shipping Address</h3>
                        <div className="flex items-start gap-3 text-gray-600">
                            <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>{order.shipping_address || "No address provided"}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4">Payment Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{order.total_amount?.toLocaleString()} {order.currency}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>{order.total_amount?.toLocaleString()} {order.currency}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                            <CreditCard className="w-4 h-4" />
                            <span className="capitalize">{order.payment_method}</span> ({order.payment_status})
                        </div>
                    </div>

                    <div className="bg-teal-50 rounded-xl p-4 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-teal-600 flex-shrink-0" />
                        <p className="text-xs text-teal-800">
                            <span className="font-bold block mb-1">Buyer Protection</span>
                            Your purchase is protected. If you don't receive your item, you will be refunded.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
