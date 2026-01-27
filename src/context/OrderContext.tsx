import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Order, ShipmentProof } from '../types';
import { supabase } from '../supabaseClient';

interface OrderContextType {
  orders: Order[]; // Buyer orders
  sales: Order[];  // Seller orders
  addOrder: (orderData: any) => Promise<any>;
  updateOrderStatus: (orderId: string, status: string) => Promise<boolean>;
  submitShipmentProof: (orderId: number, proof: Partial<ShipmentProof>) => Promise<boolean>;
  submitDeliveryProof: (orderId: number, proof: Partial<ShipmentProof>) => Promise<boolean>;
  getOrderProofs: (orderId: number) => Promise<ShipmentProof[]>;
  getOrdersByBuyer: (userId: string) => Order[];
  getOrdersBySeller: (userId: string) => Order[];
  getOrderById: (orderId: string) => Order | undefined;
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

  const submitShipmentProof = async (orderId: number, proof: Partial<ShipmentProof>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Insert proof into shipment_proofs table
      const { data, error } = await supabase
        .from('shipment_proofs')
        .insert([{
          order_id: orderId,
          proof_type: 'shipment',
          submitted_by: user.id,
          proof_method: proof.proof_method,
          proof_data: proof.proof_data,
          file_url: proof.file_url,
          notes: proof.notes
        }])
        .select()
        .single();

      if (error) throw error;

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          shipment_proof_submitted: true,
          shipment_proof_submitted_at: new Date().toISOString(),
          proof_validation_status: 'delivery_pending',
          status: 'shipped'
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      await refreshOrders();
      return true;
    } catch (error) {
      console.error('Failed to submit shipment proof:', error);
      return false;
    }
  };

  const submitDeliveryProof = async (orderId: number, proof: Partial<ShipmentProof>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Insert proof into shipment_proofs table
      const { data, error } = await supabase
        .from('shipment_proofs')
        .insert([{
          order_id: orderId,
          proof_type: 'delivery',
          submitted_by: user.id,
          proof_method: proof.proof_method,
          proof_data: proof.proof_data,
          file_url: proof.file_url,
          notes: proof.notes
        }])
        .select()
        .single();

      if (error) throw error;

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          delivery_proof_submitted: true,
          delivery_proof_submitted_at: new Date().toISOString(),
          proof_validation_status: 'validated',
          status: 'delivered',
          payment_status: 'completed'
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      await refreshOrders();
      return true;
    } catch (error) {
      console.error('Failed to submit delivery proof:', error);
      return false;
    }
  };

  const getOrderProofs = async (orderId: number): Promise<ShipmentProof[]> => {
    try {
      const { data, error } = await supabase
        .from('shipment_proofs')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch proofs:', error);
      return [];
    }
  };

  const getOrdersByBuyer = (userId: string) => {
    return orders;
  };

  const getOrdersBySeller = (userId: string) => {
    return sales;
  };

  const getOrderById = (orderId: string) => {
    return orders.find(o => o.id === orderId) || sales.find(s => s.id === orderId);
  };

  return (
    <OrderContext.Provider value={{
      orders,
      sales,
      addOrder,
      updateOrderStatus,
      submitShipmentProof,
      submitDeliveryProof,
      getOrderProofs,
      getOrdersByBuyer,
      getOrdersBySeller,
      getOrderById,
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