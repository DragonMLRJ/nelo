import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, X, Check, Search, BadgeCheck, MapPin, Store } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES, CONGO_CITIES } from '../constants';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/skeletons/ProductCardSkeleton';
import AdBanner from '../components/AdBanner';

const CONDITIONS = ['New', 'Very Good', 'Good', 'Fair'];
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'date_desc', label: 'Newest Arrivals' },
];

const EXCHANGE_RATE = 600; // 1 USD = 600 XAF

// Helper to estimate recency for sorting
const getTimeWeight = (timeStr: string) => {
  const lower = timeStr.toLowerCase();
  if (lower.includes('just now')) return 0; // Newest
  if (lower.includes('hour')) return 1;
  if (lower.includes('day')) return 24;
  if (lower.includes('week')) return 168;
  return 999;
};

const Catalog: React.FC = () => {
  const { products, loading } = useProducts();

  // URL Params for Search
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const catParam = searchParams.get('cat') || 'all';

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [filterCurrency, setFilterCurrency] = useState<'XAF' | '$'>('XAF');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // Initialize from URL params
  const [verifiedSellerOnly, setVerifiedSellerOnly] = useState(searchParams.get('verified') === 'true');
  const [officialStoresOnly, setOfficialStoresOnly] = useState(searchParams.get('official') === 'true');

  // Sort State
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'recommended');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync prop category change if URL param changes
  React.useEffect(() => {
    setSelectedCategory(catParam);
  }, [catParam]);

  // Sync other params if they change directly (e.g. navigation)
  React.useEffect(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam) setSortBy(sortParam);

    const verifiedParam = searchParams.get('verified');
    if (verifiedParam) setVerifiedSellerOnly(verifiedParam === 'true');

    const officialParam = searchParams.get('official');
    if (officialParam) setOfficialStoresOnly(officialParam === 'true');
  }, [searchParams]);

  // Toggle Condition Filter
  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  // Calculate Facet Counts for Condition
  const conditionCounts = useMemo(() => {
    let currentProducts = [...products];

    // Filter by Search
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      currentProducts = currentProducts.filter(p =>
        p.title.toLowerCase().includes(lowerQ) ||
        p.description.toLowerCase().includes(lowerQ) ||
        (p.brand && p.brand.toLowerCase().includes(lowerQ)) ||
        CATEGORIES.find(c => c.id === p.category)?.name.toLowerCase().includes(lowerQ)
      );
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      currentProducts = currentProducts.filter(p => p.category === selectedCategory);
    }

    // Filter by Price
    if (priceRange.min || priceRange.max) {
      currentProducts = currentProducts.filter(p => {
        let price = p.price;
        // Normalize
        if (p.currency !== filterCurrency) {
          price = filterCurrency === 'XAF' ? p.price * EXCHANGE_RATE : p.price / EXCHANGE_RATE;
        }
        const min = priceRange.min ? Number(priceRange.min) : 0;
        const max = priceRange.max ? Number(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Count
    const counts: Record<string, number> = {};
    CONDITIONS.forEach(c => counts[c] = 0);
    currentProducts.forEach(p => {
      if (counts[p.condition] !== undefined) {
        counts[p.condition]++;
      }
    });

    return counts;
  }, [searchQuery, selectedCategory, priceRange, filterCurrency, products]);

  // Filter and Sort Logic for Display
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 1. Text Search Filtering
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(lowerQ) ||
        p.description.toLowerCase().includes(lowerQ) ||
        (p.brand && p.brand.toLowerCase().includes(lowerQ)) ||
        CATEGORIES.find(c => c.id === p.category)?.name.toLowerCase().includes(lowerQ)
      );
    }

    // 2. Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // 3. Filter by Verified Seller
    if (verifiedSellerOnly) {
      result = result.filter(p => p.seller.isVerified);
    }

    // 3.5 Filter by Official Store
    if (officialStoresOnly) {
      result = result.filter(p => p.seller.isOfficialStore);
    }

    // 4. Filter by Location
    const locParam = searchParams.get('loc');
    if (locParam) {
      const lowerLoc = locParam.toLowerCase();
      result = result.filter(p =>
        p.location.toLowerCase().includes(lowerLoc) ||
        p.seller.location.toLowerCase().includes(lowerLoc)
      );
    }

    // 5. Filter by Price
    if (priceRange.min || priceRange.max) {
      result = result.filter(p => {
        let price = p.price;
        // Normalize product price to match filter currency
        if (p.currency !== filterCurrency) {
          if (filterCurrency === 'XAF') {
            // Product is $, Filter is XAF => Convert $ to XAF
            price = p.price * EXCHANGE_RATE;
          } else {
            // Product is XAF, Filter is $ => Convert XAF to $
            price = p.price / EXCHANGE_RATE;
          }
        }

        const min = priceRange.min ? Number(priceRange.min) : 0;
        const max = priceRange.max ? Number(priceRange.max) : Infinity;

        return price >= min && price <= max;
      });
    }

    // 5. Filter by Condition
    if (selectedConditions.length > 0) {
      result = result.filter(p => selectedConditions.includes(p.condition));
    }

    // 6. Sorting
    result.sort((a, b) => {
      // For sorting, normalize price to XAF first to compare apples to apples
      const priceA = a.currency === 'XAF' ? a.price : a.price * EXCHANGE_RATE;
      const priceB = b.currency === 'XAF' ? b.price : b.price * EXCHANGE_RATE;

      switch (sortBy) {
        case 'price_asc':
          return priceA - priceB;
        case 'price_desc':
          return priceB - priceA;
        case 'date_desc':
          const weightA = getTimeWeight(a.postedAt);
          const weightB = getTimeWeight(b.postedAt);
          return weightA - weightB;
        default:
          return 0; // Recommended
      }
    });

    return result;
  }, [selectedCategory, priceRange, filterCurrency, selectedConditions, sortBy, searchQuery, products, verifiedSellerOnly]);

  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0) + (priceRange.min ? 1 : 0) + (priceRange.max ? 1 : 0) + selectedConditions.length + (verifiedSellerOnly ? 1 : 0) + (officialStoresOnly ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchParams(prev => { prev.delete('cat'); return prev; });
    setPriceRange({ min: '', max: '' });
    setSelectedConditions([]);
    setVerifiedSellerOnly(false);
    setOfficialStoresOnly(false);
  };

  const clearSearch = () => {
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-2 sm:px-4 py-4 sm:py-8"
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Filter className="w-4 h-4" /> Filters {activeFiltersCount > 0 && <span className="bg-teal-600 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>}
          </button>
        </div>

        {/* Sidebar Filters */}
        <AnimatePresence>
          {/* Mobile Overlay Backdrop */}
          {isMobileFiltersOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
          )}
        </AnimatePresence>

        <aside
          className={`
            lg:w-72 flex-shrink-0 
            fixed lg:static inset-y-0 left-0 w-3/4 max-w-xs z-50 transform transition-transform duration-300 ease-in-out lg:transform-none lg:z-auto
            ${isMobileFiltersOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 shadow-none'}
            overflow-y-auto lg:overflow-visible
            lg:bg-transparent bg-white
          `}
        >
          <div className="p-6 lg:p-6 lg:sticky lg:top-24 bg-white/80 backdrop-blur-xl rounded-3xl lg:shadow-xl lg:border lg:border-white/50 min-h-screen lg:min-h-0">
            <div className="flex items-center justify-between mb-8 text-gray-800">
              <div className="flex items-center gap-3">
                <div className="bg-teal-100 p-2 rounded-lg text-teal-700">
                  <Filter className="w-5 h-5" />
                </div>
                <h2 className="font-bold font-outfit text-xl">Filtres</h2>
              </div>
              <div className="flex items-center gap-4">
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-teal-600 font-bold hover:underline bg-teal-50 px-2 py-1 rounded-md">
                    R&eacute;initialiser
                  </button>
                )}
                <button onClick={() => setIsMobileFiltersOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Trust Filters (Seller) - eBay Style Highlighting */}
            <div className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold mb-3 text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-amber-600" /> Confiance &amp; S&eacute;curit&eacute;
              </h3>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer group p-2 hover:bg-white/60 rounded-xl transition-colors border border-transparent hover:border-amber-200">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={verifiedSellerOnly}
                      onChange={() => setVerifiedSellerOnly(!verifiedSellerOnly)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-amber-300 rounded-md bg-white peer-checked:bg-teal-600 peer-checked:border-teal-600 transition-all shadow-sm"></div>
                    <Check className="w-3.5 h-3.5 text-white absolute top-[3px] left-[3px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-teal-600" />
                    <span className="text-sm text-gray-800 font-bold group-hover:text-black">Vendeurs V??rifi??s</span>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer group p-2 hover:bg-white/60 rounded-xl transition-colors border border-transparent hover:border-amber-200">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={officialStoresOnly}
                      onChange={() => setOfficialStoresOnly(!officialStoresOnly)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-amber-300 rounded-md bg-white peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-all shadow-sm"></div>
                    <Check className="w-3.5 h-3.5 text-white absolute top-[3px] left-[3px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-800 font-bold group-hover:text-black">Boutiques Officielles</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Location Filter */}
            <div className="mb-8">
              <h3 className="text-sm font-bold mb-3 text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Ville
              </h3>
              <div className="relative group">
                <select
                  value={searchParams.get('loc') || ''}
                  onChange={(e) => setSearchParams(prev => {
                    if (e.target.value) prev.set('loc', e.target.value);
                    else prev.delete('loc');
                    return prev;
                  })}
                  className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/50 transition-all appearance-none cursor-pointer hover:bg-white"
                >
                  <option value="">Toutes les villes</option>
                  {CONGO_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <h3 className="text-sm font-bold mb-3 text-gray-900 uppercase tracking-wider">Cat??gorie</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => { setSelectedCategory('all'); setSearchParams(prev => { prev.delete('cat'); return prev; }) }}
                    className={`text-sm w-full text-left px-3 py-2.5 rounded-xl transition-all font-medium flex justify-between ${selectedCategory === 'all' ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <span>Tout voir</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === 'all' ? 'bg-white/20' : 'bg-gray-100'}`}>{products.length}</span>
                  </button>
                </li>
                {CATEGORIES.map(cat => (
                  <li key={cat.id}>
                    <button
                      onClick={() => { setSelectedCategory(cat.id); setSearchParams(prev => { prev.set('cat', cat.id); return prev; }) }}
                      className={`text-sm w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex justify-between ${selectedCategory === cat.id ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <span>{cat.name}</span>
                      {/* Calculate Count on the fly (mocking complex query for UI speed) */}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                        {products.filter(p => p.category === cat.id).length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Prix</h3>
                <div className="flex bg-gray-100/80 p-1 rounded-lg">
                  <button
                    onClick={() => setFilterCurrency('XAF')}
                    className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${filterCurrency === 'XAF' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    XAF
                  </button>
                  <button
                    onClick={() => setFilterCurrency('$')}
                    className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${filterCurrency === '$' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    $
                  </button>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    placeholder="Min"
                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>
                <span className="text-gray-400 font-medium">-</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    placeholder="Max"
                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <h3 className="text-sm font-bold mb-3 text-gray-900 uppercase tracking-wider">??tat</h3>
              <div className="space-y-1">
                {CONDITIONS.map(condition => (
                  <label key={condition} className="flex items-center cursor-pointer group justify-between p-2 hover:bg-white/50 rounded-xl transition-all">
                    <div className="flex items-center">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedConditions.includes(condition)}
                          onChange={() => toggleCondition(condition)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-md bg-white peer-checked:bg-teal-600 peer-checked:border-teal-600 transition-all shadow-sm"></div>
                        <Check className="w-3.5 h-3.5 text-white absolute top-[3px] left-[3px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 font-medium transition-colors">{condition}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-md">
                      {conditionCounts[condition] || 0}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sidebar Ad */}
            <div className="mt-8 hidden lg:block opacity-80 hover:opacity-100 transition-opacity">
              <AdBanner slot="catalog-sidebar" format="box" />
            </div>

          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {searchQuery ? (
                  <span className="flex items-center gap-2">
                    Results for "{searchQuery}"
                    <button onClick={clearSearch} className="text-gray-400 hover:text-red-500">
                      <X className="w-5 h-5" />
                    </button>
                  </span>
                ) : (
                  selectedCategory === 'all' ? 'All Items' : CATEGORIES.find(c => c.id === selectedCategory)?.name
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{processedProducts.length} results found</p>
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-auto z-20">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full sm:w-64 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 flex items-center justify-between hover:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              >
                <span className="truncate">Sort by: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-full bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden py-1"
                  >
                    {SORT_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 transition-colors ${sortBy === option.value ? 'font-bold text-teal-700 bg-teal-50/50' : 'text-gray-700'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <AdBanner slot="catalog-top" className="mb-8" />

          {/* Active Filters Summary (Chips) */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {(priceRange.min || priceRange.max) && (
                <div className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                  Price: {priceRange.min || '0'} - {priceRange.max || '???'} {filterCurrency}
                  <button onClick={() => setPriceRange({ min: '', max: '' })}><X className="w-3 h-3 hover:text-red-500" /></button>
                </div>
              )}
              {verifiedSellerOnly && (
                <div className="inline-flex items-center gap-1 bg-teal-100 px-3 py-1 rounded-full text-xs font-medium text-teal-800">
                  Verified Sellers <button onClick={() => setVerifiedSellerOnly(false)}><X className="w-3 h-3 hover:text-red-500" /></button>
                </div>
              )}
              {officialStoresOnly && (
                <div className="inline-flex items-center gap-1 bg-purple-100 px-3 py-1 rounded-full text-xs font-medium text-purple-800">
                  Official Stores <button onClick={() => setOfficialStoresOnly(false)}><X className="w-3 h-3 hover:text-red-500" /></button>
                </div>
              )}
              {searchParams.get('loc') && (
                <div className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                  <MapPin className="w-3 h-3" /> {searchParams.get('loc')}
                  <button onClick={() => setSearchParams(prev => { prev.delete('loc'); return prev; })}><X className="w-3 h-3 hover:text-red-500" /></button>
                </div>
              )}
              {selectedConditions.map(c => (
                <div key={c} className="inline-flex items-center gap-1 bg-teal-100 px-3 py-1 rounded-full text-xs font-medium text-teal-800">
                  {c} <button onClick={() => toggleCondition(c)}><X className="w-3 h-3 hover:text-red-500" /></button>
                </div>
              ))}
              <button onClick={clearFilters} className="text-xs text-red-500 hover:underline px-2">Clear all</button>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : processedProducts.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {processedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>

              {/* Conditional Ad Injection */}
              {processedProducts.length > 4 && (
                <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                  <AdBanner slot="catalog-mid-feed" />
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-24 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 text-sm mb-6">
                {searchQuery ? `We couldn't find anything matching "${searchQuery}".` : "Try adjusting your filters."}
              </p>
              <button onClick={() => { clearFilters(); clearSearch(); }} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Catalog;
