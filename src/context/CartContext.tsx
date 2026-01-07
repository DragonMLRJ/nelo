import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

interface CartItem {
    id: string; // Cart Item ID
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
            // Fetch cart items with product details
            const { data, error } = await supabase
                .from('cart_items')
                .select(`
                    id,
                    quantity,
                    created_at,
                    product_id,
                    products (
                        id,
                        title,
                        price,
                        image,
                        seller_id,
                        user:profiles!seller_id (
                            name
                        )
                    )
                `)
                .eq('user_id', user.id);

            if (error) throw error;

            if (data) {
                const mappedItems: CartItem[] = data.map((item: any) => ({
                    id: item.id.toString(),
                    product_id: item.product_id.toString(),
                    quantity: item.quantity,
                    title: item.products?.title || 'Unknown Product',
                    price: Number(item.products?.price) || 0,
                    image: item.products?.image || '',
                    seller_id: item.products?.seller_id?.toString() || '',
                    seller_name: item.products?.user?.name || 'Unknown Seller',
                    subtotal: (Number(item.products?.price) || 0) * item.quantity,
                    created_at: item.created_at
                }));

                setItems(mappedItems);

                const calculatedTotal = mappedItems.reduce((acc, item) => acc + item.subtotal, 0);
                const calculatedCount = mappedItems.reduce((acc, item) => acc + item.quantity, 0);

                setTotal(calculatedTotal);
                setItemCount(calculatedCount);
            }
        } catch (error) {
            console.error('Failed to load cart from Supabase:', error);
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
            // Check if item already exists
            const { data: existing } = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('user_id', user.id)
                .eq('product_id', productId)
                .single();

            if (existing) {
                // Update quantity
                await supabase
                    .from('cart_items')
                    .update({ quantity: existing.quantity + quantity })
                    .eq('id', existing.id);
            } else {
                // Insert new
                await supabase
                    .from('cart_items')
                    .insert({
                        user_id: user.id,
                        product_id: productId,
                        quantity: quantity
                    });
            }

            await refreshCart();
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Failed to add item to cart');
        }
    };

    const updateQuantity = async (cartItemId: string, quantity: number) => {
        if (!user) return;
        if (quantity < 1) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('id', cartItemId)
                .eq('user_id', user.id);

            if (error) throw error;
            await refreshCart();
        } catch (error) {
            console.error('Failed to update cart:', error);
            alert('Failed to update cart');
        }
    };

    const removeFromCart = async (cartItemId: string) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', cartItemId)
                .eq('user_id', user.id);

            if (error) throw error;
            await refreshCart();
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            alert('Failed to remove item');
        }
    };

    const clearCart = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;

            setItems([]);
            setTotal(0);
            setItemCount(0);
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
