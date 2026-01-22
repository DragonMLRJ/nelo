import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const { savedItemIds } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (savedItemIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            profiles!seller_id (
              id, name, avatar, is_verified
            )
          `)
          .in('id', savedItemIds);

        if (error) throw error;

        if (data) {
          const mapped = data.map(item => ({
            ...item,
            seller: item.profiles || { name: 'Unknown', avatar: '' }
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch wishlist products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [savedItemIds]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Please log in to view your wishlist</h2>
        <Link to="/login" className="text-teal-600 underline">Log In</Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Heart className="w-8 h-8 text-red-500 fill-current" />
        My Wishlist
      </h1>

      {loading ? (
        <div>Loading...</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Save items you want to watch or buy later.</p>
          <Link to="/catalog" className="bg-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-700">
            Browse Catalog
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default Wishlist;
