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
      className="container mx-auto px-4 py-8 max-w-3xl"
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">{t('sell.title')}</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">

        {/* Photo Upload */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-4">{t('sell.photos')} {images.length > 0 && `(${images.length})`}</label>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Tag className="w-3 h-3 rotate-45" /> {/* Using Tag as X icon workaround or just import X */}
                </button>
                {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">{t('sell.cover')}</span>}
              </div>
            ))}

            <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer aspect-square">
              {uploading ? (
                <span className="text-xs text-gray-500 animate-pulse">{t('sell.uploading')}</span>
              ) : (
                <>
                  <Camera className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">{t('sell.add_photo')}</span>
                </>
              )}
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Title & Desc */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('sell.item_title')}</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('sell.item_title_ph')}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('sell.description')}</label>
            <textarea
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('sell.description_ph')}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6 mb-8 border-t border-gray-100 pt-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('sell.category')}</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                required
              >
                <option value="">{t('sell.select_category')}</option>
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
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('sell.brand')}</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder={t('sell.brand_ph')}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('sell.condition')}</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                required
              >
                <option value="">{t('sell.select_condition')}</option>
                <option value="New">{t('common.new')}</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          {/* Location for Item - Defaults to User Location */}
          <div className="mt-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('product.location')}</label>
            <select
              value={user.location || 'Brazzaville'}
              onChange={() => { }}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none"
              disabled
            >
              {CONGO_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Item location is based on your profile.</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-8 border-t border-gray-100 pt-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">{t('sell.price')}</label>
          <div className="relative max-w-xs">
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-lg"
              required
            />
            <div className="absolute right-0 top-0 bottom-0 px-4 bg-gray-100 border-l border-gray-300 rounded-r-lg flex items-center text-gray-500 font-bold">
              XAF
            </div>
          </div>
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className={`w-full bg-teal-600 text-white py-4 rounded-lg font-bold text-lg shadow-md hover:bg-teal-700 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? t('sell.submitting') : t('sell.submit')}
        </button>

      </form>
    </motion.div >
  );
};

export default Sell;