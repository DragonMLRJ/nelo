import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../constants';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/skeletons/ProductCardSkeleton';
import { CategorySkeleton } from '../components/skeletons/CategorySkeleton';
import AdBanner from '../components/AdBanner';
import { Shirt, User, Baby, Home as HomeIcon, Smartphone, Gamepad2, Sparkles, Car, Building, Briefcase, ArrowRight, ShieldCheck, Truck, Zap, Headphones, RotateCcw } from 'lucide-react';

const iconMap: Record<string, any> = {
  shirt: Shirt,
  user: User,
  baby: Baby,
  home: HomeIcon,
  smartphone: Smartphone,
  'gamepad-2': Gamepad2,
  sparkles: Sparkles,
  car: Car,
  building: Building,
  briefcase: Briefcase
};

import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Home: React.FC = () => {
  const { products, loading } = useProducts();
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    if (products.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % products.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [products]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-20 bg-gray-50/50"
    >
      <SEO
        title="Accueil"
        description="Achetez et vendez facilement au Congo. Mode, Électronique, Maison et plus."
      />

      {/* Bento Grid Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:h-[600px] auto-rows-[minmax(180px, auto)]">

          {/* 1. Main Value Prop (Large Box) - Clickable & Integrated Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-midnight-900 to-teal-900 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden text-white flex flex-col justify-end group shadow-2xl shadow-teal-900/20 cursor-pointer overflow-hidden transform transition-transform hover:scale-[1.01]"
            onClick={() => window.location.href = '/catalog'}
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl -mr-40 -mt-20 pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

            {/* Hover visual cue */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-white/5 transition-colors duration-300"></div>

            <motion.div
              className="relative z-10 max-w-lg"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.span variants={fadeInUp} className="inline-block px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 backdrop-blur-md text-teal-300 text-xs font-bold uppercase tracking-wider mb-6">
                N°1 Marketplace au Congo 🇨🇩
              </motion.span>
              <h1 className="text-4xl md:text-6xl font-heading font-black leading-tight mb-6 tracking-tight">
                <motion.span variants={fadeInUp} className="block">Vendez simplement.</motion.span>
                <motion.span variants={fadeInUp} className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-200 flex items-center gap-2">
                  Achetez sereinement. <ArrowRight className="w-8 h-8 text-teal-200 opacity-80" />
                </motion.span>
              </h1>
              <motion.p variants={fadeInUp} className="text-lg text-teal-100/80 mb-8 max-w-sm font-light">
                La plateforme la plus sécurisée pour donner une seconde vie à vos objets.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* 2. Featured Image (Vertical Box) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="md:row-span-2 relative rounded-[2.5rem] overflow-hidden group shadow-xl cursor-pointer"
            onClick={() => window.location.href = '/catalog?cat=women&sort=date_desc&official=true'}
            title="Saison : Les dernières nouveautés Pro"
          >
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" alt="Fashion" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white w-fit shadow-lg"
              >
                <p className="font-bold text-sm capitalize">Collection {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                <p className="text-xs text-white/80">Tendances de la saison</p>
              </motion.div>
            </div>
          </motion.div>

          {/* 3. Quick Action: Sell - Slideshow & Bubble Style */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="bg-gray-100 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-teal-100 transition-all group cursor-pointer h-full min-h-[280px]"
            onClick={() => window.location.href = '/sell'}
          >
            {/* Background Slideshow */}
            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                {products.length > 0 ? (
                  <motion.img
                    key={`slide-${currentImageIndex}-${products[currentImageIndex]?.id}`}
                    src={products[currentImageIndex]?.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80'}
                    alt="Product Slideshow"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"
                    alt="Fallback"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-0"></div>

            {/* Content Bubble */}
            <div className="relative z-10 p-6 flex flex-col justify-between h-full">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/30 backdrop-blur-md p-4 rounded-2xl w-fit border border-white/20 shadow-lg mb-auto"
              >
                <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center text-teal-800 mb-3">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-white mb-1 drop-shadow-md">Vendre un objet</h3>
                <p className="text-sm text-white/90 font-medium">Gagnez de l'argent en 2 clics</p>
              </motion.div>
            </div>
          </motion.div>

          {/* 4. Stats / Trust */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-lg shadow-purple-500/20 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => window.open('https://discord.gg/nelo-community', '_blank')}
          >
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-purple-500 bg-white/20 backdrop-blur-sm"></div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-purple-500 bg-white flex items-center justify-center text-xs font-bold text-purple-700">+1k</div>
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl mb-1">Communauté</h3>
              <p className="text-sm text-purple-200">Membres actifs cette semaine</p>
            </div>
          </motion.div>

        </div >
      </div >

      {/* Trust Signal Strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="bg-white border-y border-gray-100 py-8 mb-8"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center text-center">
            {[
              { icon: ShieldCheck, title: "Paiement Sécurisé", desc: "Transactions protégées" },
              { icon: Truck, title: "Livraison Rapide", desc: "Partout au Congo" },
              { icon: Headphones, title: "Support 24/7", desc: "Une équipe à votre écoute" },
              { icon: RotateCcw, title: "Satisfait ou remboursé", desc: "Retours simplifiés" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 group cursor-default">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 transition-colors group-hover:bg-teal-100"
                >
                  <item.icon className="w-6 h-6" />
                </motion.div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <AdBanner slot="home-top" className="container mx-auto px-4 mt-8" />

      {/* Modern Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-heading font-bold text-slate-900">{t('home.shop_category')}</h2>
            <p className="text-slate-500 mt-2">Explorez nos collections populaires</p>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {loading
            ? Array.from({ length: 7 }).map((_, i) => <CategorySkeleton key={i} />)
            : CATEGORIES.map((cat, idx) => {
              const Icon = iconMap[cat.icon] || Shirt;
              const catName = t(`cat.${cat.id}`) !== `cat.${cat.id}` ? t(`cat.${cat.id}`) : cat.name;

              return (
                <motion.div
                  key={cat.id}
                  variants={fadeInUp}
                >
                  <Link to={`/catalog?cat=${cat.id}`} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group h-full">
                    <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 mb-4 transform group-hover:scale-110">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-teal-700 text-center">{catName}</span>
                  </Link>
                </motion.div>
              )
            })}
        </motion.div>
      </section>

      {/* Fresh Arrivals - Staggered Grid */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-slate-50/50 skew-y-1 transform origin-top-left -z-10 h-full w-full"></div>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-heading font-bold text-slate-900">{t('home.fresh')}</h2>
              <p className="text-slate-500 mt-2">Les dernières pépites ajoutées par la communauté</p>
            </div>
            <Link to="/catalog" className="group flex items-center gap-2 text-teal-600 font-bold hover:text-teal-800 transition-colors">
              {t('home.see_all')} <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
              : products.slice(0, 10).map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            }
          </motion.div>
        </div>
      </section>

      <AdBanner slot="home-bottom" className="container mx-auto px-4 max-w-5xl my-12" />

      {/* Value Proposition - Slide Up */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="bg-teal-900 rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden"
        >
          {/* Pattern */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-teal-900 to-teal-900"></div>

          <div className="relative z-10 grid md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Zap className="w-8 h-8 text-teal-300" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">{t('home.sell_simply')}</h3>
              <p className="text-teal-100 leading-relaxed text-sm">{t('home.sell_desc')}</p>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <ShieldCheck className="w-8 h-8 text-teal-300" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">{t('home.buy_securely')}</h3>
              <p className="text-teal-100 leading-relaxed text-sm">{t('home.buy_desc')}</p>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Truck className="w-8 h-8 text-teal-300" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">{t('home.ship_easily')}</h3>
              <p className="text-teal-100 leading-relaxed text-sm">{t('home.ship_desc')}</p>
            </div>
          </div>
        </motion.div>
      </section>
    </motion.div >
  );
};

export default Home;
