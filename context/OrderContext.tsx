import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Order } from '../types';

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

const API_BASE = '/api';

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
      const buyerRes = await fetch(`${API_BASE}/orders/index.php?action=list&role=buyer&userId=${user.id}`);
      const buyerData = await buyerRes.json();
      if (buyerData.success) {
        setOrders(buyerData.orders);
      }

      // Fetch Sales (Seller)
      const sellerRes = await fetch(`${API_BASE}/orders/index.php?action=list&role=seller&userId=${user.id}`);
      const sellerData = await sellerRes.json();
      if (sellerData.success) {
        setSales(sellerData.orders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }, [user]);

  // Load orders when user logs in
  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const addOrder = async (orderData: any) => {
    try {
      const response = await fetch(`${API_BASE}/orders/index.php?action=create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();

      if (data.success) {
        await refreshOrders();
        return { success: true, orderIds: data.orderIds };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/orders/index.php?action=update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      const data = await response.json();
      if (data.success) {
        await refreshOrders();
        return true;
      }
      return false;
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