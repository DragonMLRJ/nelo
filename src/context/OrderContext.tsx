import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Order } from '../types';
import { supabase } from '../supabaseClient';

interface OrderContextType {
  orders: Order[]; // Buyer orders
  sales: Order[];  // Seller orders
  addOrder: (orderData: any) => Promise<any>;
  updateOrderStatus: (orderId: string, status: string) => Promise<boolean>;
  getOrdersByBuyer: (userId: string) => Order[];
  getOrdersBySeller: (userId: string) => Order[];
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const { user } = useAuth();

  const refreshOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setSales([]);
      return;
    }

    try {
      // Fetch Purchases (Buyer)
      const { data: buyerData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products ( title, image )
          ),
          users:profiles!orders_seller_id_fkey ( name, avatar )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (buyerData) {
        const mappedOrders = buyerData.map((order: any) => ({
          ...order,
          id: order.id.toString(),
          items: order.order_items.map((item: any) => ({
            ...item,
            title: item.products?.title || 'Unknown',
            image: item.products?.image || '',
          })),
          counterparty_name: order.users?.name,
          counterparty_avatar: order.users?.avatar,
        }));
        setOrders(mappedOrders);
      }

      // Fetch Sales (Seller)
      const { data: sellerData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products ( title, image )
          ),
          users:profiles!orders_buyer_id_fkey ( name, avatar )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (sellerData) {
        const mappedSales = sellerData.map((order: any) => ({
          ...order,
          id: order.id.toString(),
          items: order.order_items.map((item: any) => ({
            ...item,
            title: item.products?.title || 'Unknown',
            image: item.products?.image || '',
          })),
          counterparty_name: order.users?.name,
          counterparty_avatar: order.users?.avatar,
        }));
        setSales(mappedSales);
      }

    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }, [user]);

  // Load orders when user logs in and subscribe to changes
  useEffect(() => {
    refreshOrders();

    if (!user) return;

    // Realtime subscription
    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Order Change detected:', payload);
        refreshOrders(); // Refresh full list on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [refreshOrders, user]);

  const addOrder = async (orderData: any) => {
    try {
      // 1. Create Order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: `ORD-${Date.now()}`,
          buyer_id: user?.id,
          seller_id: orderData.sellerId,
          total_amount: orderData.total,
          currency: 'XAF',
          status: 'pending',
          shipping_address: orderData.shippingAddress,
          payment_method: orderData.paymentMethod || 'card',
          payment_status: 'pending' // Integrate payment gateway later
        }])
        .select()
        .single();

      if (orderError) throw orderError;
      if (!newOrder) throw new Error('Failed to create order');

      // 2. Create Order Items
      const itemsPayload = orderData.items.map((item: any) => ({
        order_id: newOrder.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        product_snapshot: { title: item.title, image: item.image } // Store snapshot
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      await refreshOrders();
      return { success: true, orderIds: [newOrder.id] };

    } catch (error: any) {
      console.error('Failed to create order:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      await refreshOrders();
      return true;
    } catch (error) {
      console.error('Failed to update status:', error);
      return false;
    }
  };

  const getOrdersByBuyer = (userId: string) => {
    return orders;
  };

  const getOrdersBySeller = (userId: string) => {
    return sales;
  };

  return (
    <OrderContext.Provider value={{
      orders,
      sales,
      addOrder,
      updateOrderStatus,
      getOrdersByBuyer,
      getOrdersBySeller,
      refreshOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};