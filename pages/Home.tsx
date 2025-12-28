import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../constants';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import AdBanner from '../components/AdBanner';
import { Shirt, User, Baby, Home as HomeIcon, Smartphone, Gamepad2, Sparkles } from 'lucide-react';

const iconMap: Record<string, any> = {
  shirt: Shirt,
  user: User,
  baby: Baby,
  home: HomeIcon,
  smartphone: Smartphone,
  'gamepad-2': Gamepad2,
  sparkles: Sparkles
};

import { useLanguage } from '../context/LanguageContext';

const Home: React.FC = () => {
  const { products } = useProducts();
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-20"
    >
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-teal-50 rounded-bl-[100px] hidden md:block -z-0"></div>
        <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
              >
                Prêt à faire du tri dans tes placards ?
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 mb-8 max-w-lg"
              >
                Join the largest Congolese marketplace. Sell simply, buy securely.
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4"
              >
                <Link to="/sell" className="bg-teal-600 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Start Selling
                </Link>
                <Link to="/catalog" className="bg-white text-teal-600 border-2 border-teal-600 px-8 py-3.5 rounded-lg font-bold hover:bg-teal-50 transition-all">
                  Shop Now
                </Link>
              </motion.div>
            </div>

            {/* Abstract Hero Image Composition */}
            <div className="md:w-1/2 relative h-[400px] w-full hidden md:block">
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                src="https://picsum.photos/600/800?random=10"
                alt="Fashion Model"
                className="absolute right-10 top-0 w-64 h-80 object-cover rounded-2xl shadow-2xl z-20"
              />
              <motion.img
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                src="https://picsum.photos/600/800?random=11"
                alt="Electronics"
                className="absolute left-10 bottom-0 w-56 h-64 object-cover rounded-2xl shadow-xl z-10 border-4 border-white"
              />
            </div>
          </div>
        </div>
      </div>

      <AdBanner slot="home-top" className="container mx-auto px-4" />

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">{t('home.shop_category')}</h2>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
          {CATEGORIES.map((cat, idx) => {
            const Icon = iconMap[cat.icon] || Shirt;
            // Translate category name using 'cat.{slug}' convention or fallback
            // Assuming strict mapping isn't set up for all category slugs, might use default logic or add to context later.
            // For now, let's rely on the context keys we added or existing logic.
            // Actually, we added 'cat.women', etc. in context.
            // Let's try to map cat.id (which is usually a slug) to 'cat.slug'.
            // If cat.id is 'women', key is 'cat.women'.
            const catName = t(`cat.${cat.id}`) !== `cat.${cat.id}` ? t(`cat.${cat.id}`) : cat.name;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/catalog?cat=${cat.id}`} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all group cursor-pointer bg-gray-50 border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600">{catName}</span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Popular Items */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-gray-800">{t('home.fresh')}</h2>
            <Link to="/catalog" className="text-teal-600 font-medium hover:underline">{t('home.see_all')}</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <AdBanner slot="home-bottom" className="container mx-auto px-4 max-w-4xl" />

      {/* Brand Value Props */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm text-center">
            <h3 className="font-bold text-lg mb-2">{t('home.sell_simply')}</h3>
            <p className="text-gray-500 text-sm">{t('home.sell_desc')}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm text-center">
            <h3 className="font-bold text-lg mb-2">{t('home.buy_securely')}</h3>
            <p className="text-gray-500 text-sm">{t('home.buy_desc')}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm text-center">
            <h3 className="font-bold text-lg mb-2">{t('home.ship_easily')}</h3>
            <p className="text-gray-500 text-sm">{t('home.ship_desc')}</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;