import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types';

interface ProductContextType {
  products: Product[];
  createProduct: (productData: any) => Promise<{ success: boolean; product_id?: string; error?: string }>;
  getProductById: (id: string) => Product | undefined;
  loading: boolean;
  refreshProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const API_BASE = '/api';

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Load products from API on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/products/index.php`);
      const data = await response.json();

      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: any) => {
    try {
      const response = await fetch(`${API_BASE}/products/index.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh products to get the new item with complete server-side data (timestamps, seller info etc)
        await loadProducts();
        return result;
      } else {
        return { success: false, error: result.error || 'Failed to create product' };
      }
    } catch (error) {
      console.error('Error creating product:', error);
      return { success: false, error: 'Network error occurred' };
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