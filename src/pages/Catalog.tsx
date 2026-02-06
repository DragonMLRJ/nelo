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
