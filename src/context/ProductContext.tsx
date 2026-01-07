import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, User } from '../types';
import { supabase } from '../supabaseClient';

interface ProductContextType {
  products: Product[];
  createProduct: (productData: any) => Promise<{ success: boolean; product_id?: string; error?: string }>;
  getProductById: (id: string) => Product | undefined;
  loading: boolean;
  refreshProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Load products from Supabase on mount and subscribe to changes
  useEffect(() => {
    loadProducts();

    // Realtime subscription
    const subscription = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('Product Change detected:', payload);
        // We could optimize by updating state directly, but reloading is safer for relations
        loadProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const mapSupabaseToProduct = (data: any): Product => {
    return {
      id: data.id.toString(),
      title: data.title,
      price: Number(data.price),
      currency: data.currency || 'XAF',
      image: data.image,
      images: data.images || [data.image], // Fallback/Support invalid/legacy data
      category: data.category_id ? data.categories?.slug : data.category, // Handle join or fallback
      brand: data.brand,
      size: data.size,
      condition: data.condition_status as any, // Cast to union type
      description: data.description,
      location: data.location,
      postedAt: data.created_at,
      likes: data.likes || 0,
      seller: data.profiles ? {
        id: data.profiles.id.toString(),
        name: data.profiles.name,
        email: data.profiles.email,
        avatar: data.profiles.avatar || '',
        isVerified: data.profiles.is_verified,
        isAdmin: data.profiles.is_admin,
        location: data.profiles.location,
        memberSince: data.profiles.member_since,
        responseRate: data.profiles.response_rate,
        isOfficialStore: data.profiles.is_official || data.profiles.name?.toLowerCase().includes('store') || false, // Mock logic: If name has 'store' -> Official
      } : { id: '0', name: 'Unknown', avatar: '', isVerified: false, isOfficialStore: false } as User
    };
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Query products and join seller (users) and category (categories)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles!seller_id (
            id, name, email, avatar, location, is_verified, is_admin, member_since, response_rate
          ),
          categories (
            slug, name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedProducts = data.map(mapSupabaseToProduct);
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Failed to load products from Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: any) => {
    try {
      // Resolve Category ID from Slug if needed
      let catId = productData.category_id;
      if (!catId && productData.category) {
        // Assume productData.category is a slug like 'men'
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', productData.category)
          .single();

        if (catData) catId = catData.id;
      }

      // Insert into Supabase
      // Note: mapping frontend 'Product' shape back to DB columns
      const dbPayload = {
        title: productData.title,
        price: productData.price,
        currency: productData.currency,
        image: productData.image,
        // category: productData.category,  <-- REMOVED: Column does not exist
        category_id: catId,
        brand: productData.brand,
        size: productData.size,
        condition_status: productData.condition,
        description: productData.description,
        location: productData.location,
        seller_id: productData.seller_id || productData.seller?.id,
        status: 'pending' // Enforce moderation for all new items
      };

      const { data, error } = await supabase
        .from('products')
        .insert([dbPayload])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        await loadProducts();
        return { success: true, product_id: data.id.toString() };
      }
      return { success: false, error: 'No data returned' };

    } catch (error: any) {
      console.error('Error creating product:', error);
      return { success: false, error: error.message || 'Network error occurred' };
    }
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  const refreshProducts = () => {
    loadProducts();
  };

  return (
    <ProductContext.Provider value={{ products, createProduct, getProductById, loading, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};