import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  savedItemIds: string[];
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

import { supabase } from '../supabaseClient';

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);

  // Load wishlist on mount or auth change and subscribe
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('wishlists')
          .select('product_id')
          .eq('user_id', user.id);

        if (data) {
          setSavedItemIds(data.map(item => item.product_id.toString()));
        }
        if (error) console.error('Failed to load wishlist', error);
      } else {
        setSavedItemIds([]);
      }
    };
    loadWishlist();

    if (!user) return;

    // Realtime subscription
    const subscription = supabase
      .channel('public:wishlists')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlists', filter: `user_id=eq.${user.id}` }, () => {
        loadWishlist();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const addToWishlist = async (id: string) => {
    if (!user) return;
    setSavedItemIds(prev => [...prev, id]); // Optimistic
    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: id });

      if (error) throw error;
    } catch (e) {
      console.error(e);
      // Revert if failed
      setSavedItemIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const removeFromWishlist = async (id: string) => {
    if (!user) return;
    setSavedItemIds(prev => prev.filter(itemId => itemId !== id)); // Optimistic
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', id);

      if (error) throw error;
    } catch (e) {
      console.error(e);
      // Revert
      setSavedItemIds(prev => [...prev, id]);
    }
  };

  const toggleWishlist = (id: string) => {
    if (savedItemIds.includes(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  const isInWishlist = (id: string) => savedItemIds.includes(id);

  return (
    <WishlistContext.Provider value={{
      savedItemIds,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      wishlistCount: savedItemIds.length
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
