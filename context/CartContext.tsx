import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

const API_BASE = '/api';

interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    title: string;
    price: number;
    image: string;
    seller_id: string;
    seller_name: string;
    subtotal: number;
    created_at: string;
}

interface CartContextType {
    items: CartItem[];
    total: number;
    itemCount: number;
    loading: boolean;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
    removeFromCart: (cartItemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [itemCount, setItemCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Load cart when user logs in
    useEffect(() => {
        if (user) {
            refreshCart();
        } else {
            // Clear cart when user logs out
            setItems([]);
            setTotal(0);
            setItemCount(0);
        }
    }, [user]);

    const refreshCart = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/cart/index.php?action=get&userId=${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                setItems(data.items || []);
                setTotal(data.total || 0);
                setItemCount(data.itemCount || 0);
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId: string, quantity: number = 1) => {
        if (!user) {
            alert('Please log in to add items to cart');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/cart/index.php?action=add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    productId,
                    quantity
                }),
            });

            const data = await response.json();

            if (data.success) {
                await refreshCart();
            } else {
                alert(data.error || 'Failed to add item to cart');
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Failed to add item to cart');
        }
    };

    const updateQuantity = async (cartItemId: string, quantity: number) => {
        if (!user) return;

        try {
            const response = await fetch(`${API_BASE}/cart/index.php?action=update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    cartItemId,
                    quantity
                }),
            });

            const data = await response.json();

            if (data.success) {
                await refreshCart();
            } else {
                alert(data.error || 'Failed to update cart');
            }
        } catch (error) {
            console.error('Failed to update cart:', error);
            alert('Failed to update cart');
        }
    };

    const removeFromCart = async (cartItemId: string) => {
        if (!user) return;

        try {
            const response = await fetch(`${API_BASE}/cart/index.php?action=remove&userId=${user.id}&cartItemId=${cartItemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                await refreshCart();
            } else {
                alert(data.error || 'Failed to remove item');
            }
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            alert('Failed to remove item');
        }
    };

    const clearCart = async () => {
        if (!user) return;

        try {
            const response = await fetch(`${API_BASE}/cart/index.php?action=clear&userId=${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                setItems([]);
                setTotal(0);
                setItemCount(0);
            } else {
                alert(data.error || 'Failed to clear cart');
            }
        } catch (error) {
            console.error('Failed to clear cart:', error);
            alert('Failed to clear cart');
        }
    };

    return (
        <CartContext.Provider value={{
            items,
            total,
            itemCount,
            loading,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            refreshCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
