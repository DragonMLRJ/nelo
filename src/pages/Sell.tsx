import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Tag, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { CONGO_CITIES } from '../constants';
import { supabase } from '../supabaseClient';

const Sell: React.FC = () => {
  const { user } = useAuth();
  const { createProduct } = useProducts();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // ... (auth check remains)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setUploading(true);
    const files = Array.from(e.target.files) as File[];

    try {
      const newImages: string[] = [];

      for (const file of files) {
        // Sanitize filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('products')
          .upload(fileName, file);

        if (error) {
          console.error("Supabase Upload Error:", error);
          throw error;
        }

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);
          newImages.push(publicUrl);
        }
      }

      setImages(prev => [...prev, ...newImages]);

    } catch (error: any) {
      console.error("Error uploading images:", error);
      alert("Upload failed. Ensure you are logged in and file is an image.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Use first image as primary, or placeholder if none
    const primaryImage = images.length > 0 ? images[0] : `https://picsum.photos/400/500?random=${Date.now()}`;

    const productData = {
      title,
      description,
      price: Number(price),
      currency: 'XAF',
      image: primaryImage,
      images: images, // Send all images
      category: category.toLowerCase(),
      brand: brand,
      condition: condition,
      seller_id: user.id,
      location: user.location || 'Brazzaville',
    };

    const result = await createProduct(productData);

    setIsSubmitting(false);

    if (result.success) {
      navigate('/catalog');
    } else {
      alert('Failed to create product: ' + (result.error || 'Unknown error'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-12 max-w-4xl min-h-screen"
    >
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-outfit text-gray-900 mb-3">{t('sell.title')}</h1>
        <p className="text-gray-500 text-lg">Mettez en vente vos articles en quelques secondes.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Section: Photos */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">1</span>
            {t('sell.photos')}
          </h2>
          <p className="text-sm text-gray-500 mb-4 ml-10">Ajoutez jusqu'à 8 photos. La première sera la couverture.</p>

          <div className="ml-0 md:ml-10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm group hover:shadow-md transition-all">
                <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <div className="absolute bottom-0 inset-x-0 bg-teal-600/90 text-white text-[10px] uppercase font-bold text-center py-1 backdrop-blur-sm">
                    {t('sell.cover')}
                  </div>
                )}
              </div>
            ))}

            <label className="border-2 border-dashed border-teal-200 rounded-2xl flex flex-col items-center justify-center bg-teal-50/30 hover:bg-teal-50/60 hover:border-teal-400 transition-all cursor-pointer aspect-square group">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              ) : (
                <>
                  <div className="bg-white p-2 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-xs text-teal-700 font-medium">{t('sell.add_photo')}</span>
                </>
              )}
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Sections Grid */}
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">

          {/* Left Column: Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">2</span>
              Détails
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre de l'annonce</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: iPhone 13 Pro Max 256GB"
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none appearance-none"
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="men">{t('cat.men')}</option>
                  <option value="women">{t('cat.women')}</option>
                  <option value="kids">{t('cat.kids')}</option>
                  <option value="tech">{t('cat.tech')}</option>
                  <option value="home">{t('cat.home')}</option>
                  <option value="ent">{t('cat.entertainment')}</option>
                  <option value="beauty">{t('cat.beauty')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">État</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none appearance-none"
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="New">{t('common.new')}</option>
                  <option value="Very Good">Très bon état</option>
                  <option value="Good">Bon état</option>
                  <option value="Fair">État correct</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Marque (Optionnel)</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="Ex: Apple, Zara, Samsung"
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Décrivez votre article en détail..."
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none"
                required
              />
            </div>
          </div>

          {/* Right Column: Price & Location */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">3</span>
              Prix et Lieu
            </h2>

            <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100">
              <label className="block text-sm font-bold text-teal-900 mb-2">Prix de vente</label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-teal-200 rounded-xl pl-4 pr-16 py-4 text-2xl font-bold text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-teal-600">
                  XAF
                </div>
              </div>
              <p className="text-xs text-teal-600/70 mt-2">
                Nelo ne prend aucune commission sur les ventes entre particuliers.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
              <select
                value={user.location || 'Brazzaville'}
                disabled
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 outline-none cursor-not-allowed"
              >
                {CONGO_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Basé sur votre profil.</p>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-gray-100">
          <button
            disabled={isSubmitting}
            type="submit"
            className={`w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-teal-500/25 hover:from-teal-500 hover:to-teal-600 transition-all transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Publication en cours...
              </span>
            ) : t('sell.submit')}
          </button>
        </div>

      </form>
    </motion.div >
  );
};

export default Sell;