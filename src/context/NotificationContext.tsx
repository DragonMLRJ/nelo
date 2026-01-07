import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Notification } from '../types';
import { supabase } from '../supabaseClient';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Derived unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // 1. Initial Fetch
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20); // Limit to recent 20 for now

      if (data) {
        const mapped = data.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          isRead: n.is_read,
          date: new Date(n.created_at),
          link: n.link
        }));
        setNotifications(mapped);
      }
    };

    fetchNotifications();

    // 2. Realtime Subscription
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const n = payload.new;
        const newNote: Notification = {
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          isRead: n.is_read,
          date: new Date(n.created_at),
          link: n.link
        };
        setNotifications(prev => [newNote, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const addNotification = (n: Omit<Notification, 'id' | 'date' | 'isRead'>) => {
    // Transient client-side notification
    const newNote: Notification = {
      id: Date.now().toString(),
      date: new Date(),
      isRead: false,
      ...n
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const markAsRead = async (id: string) => {
    // Optimistic
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

    if (user) {
      // If it's a transient ID (timestamp), we can't update DB. 
      // We really should check. UUID (DB) vs Date.now() (Transient).
      // UUIDs usually have hyphens.
      if (id.includes('-')) {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      }
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    if (user) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false); // Only update unread
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    // DB clear? usually just local clear for UI.
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};