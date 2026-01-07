import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    created_at: string;
    status: 'pending' | 'approved' | 'rejected';
    seller: {
        name: string;
    }
}

const ModerationPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const fetchPendingProducts = async () => {
        try {
            setLoading(true);
            // Fetch products where status is pending or null (legacy)
            const { data, error } = await supabase
                .from('products')
                .select(`
                    id, title, price, image, created_at, status,
                    profiles:seller_id (name)
                `)
                .or('status.eq.pending,status.is.null')
                .order('created_at', { ascending: false });

            if (data) {
                // Map to flatten structure
                const mapped = data.map((p: any) => ({
                    ...p,
                    seller: p.profiles
                }));
                setProducts(mapped);
            }
        } catch (error) {
            console.error('Error fetching moderation queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ status: action })
                .eq('id', id);

            if (error) throw error;

            // Remove from list
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            alert('Erreur lors de la mise à jour.');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-orange-500" />
                File de Modération
            </h1>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : products.length === 0 ? (
                <div className="bg-green-50 p-12 rounded-xl border border-green-100 text-center text-green-700">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-bold">Tout est propre !</h3>
                    <p>Aucun produit en attente de validation.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="relative h-48 bg-gray-100">
                                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    {new Date(product.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 mb-1">{product.title}</h3>
                                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                    <span>{product.price.toLocaleString()} XAF</span>
                                    <span>par {product.seller?.name || 'Inconnu'}</span>
                                </div>
                                <div className="mt-auto grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleAction(product.id, 'rejected')}
                                        className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <XCircle size={18} /> Rejeter
                                    </button>
                                    <button
                                        onClick={() => handleAction(product.id, 'approved')}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                    >
                                        <CheckCircle size={18} /> Approuver
                                    </button>
                                </div>
                                <button
                                    onClick={() => navigate(`/product/${product.id}`)}
                                    className="mt-3 w-full text-center text-xs text-blue-500 hover:underline flex items-center justify-center gap-1"
                                >
                                    <Eye size={12} /> Voir détails
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModerationPage;
