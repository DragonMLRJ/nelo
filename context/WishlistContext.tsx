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

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);

  // Load wishlist on mount or auth change
  useEffect(() => {
    if (user) {
      fetch('/api/wishlist/index.php?action=ids', {
        headers: { 'X-User-Id': user.id }
      })
        .then(res => res.json())
        .then(data => {
          if (data.ids) setSavedItemIds(data.ids.map(String));
        })
        .catch(err => console.error("Failed to load wishlist", err));
    } else {
      setSavedItemIds([]);
    }
  }, [user]);

  const addToWishlist = async (id: string) => {
    if (!user) return;
    setSavedItemIds(prev => [...prev, id]); // Optimistic
    try {
      await fetch('/api/wishlist/index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': user.id },
        body: JSON.stringify({ product_id: id })
      });
    } catch (e) { console.error(e); }
  };

  const removeFromWishlist = async (id: string) => {
    if (!user) return;
    setSavedItemIds(prev => prev.filter(itemId => itemId !== id)); // Optimistic
    try {
      await fetch('/api/wishlist/index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': user.id },
        body: JSON.stringify({ product_id: id })
      });
    } catch (e) { console.error(e); }
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
