import { Product, Category } from './types';

export const CURRENCY = 'XAF'; // Central African CFA franc

export const CATEGORIES: Category[] = [
  { id: 'women', name: 'Women', icon: 'shirt' },
  { id: 'men', name: 'Men', icon: 'user' },
  { id: 'kids', name: 'Kids', icon: 'baby' },
  { id: 'home', name: 'Home', icon: 'home' },
  { id: 'tech', name: 'Electronics', icon: 'smartphone' },
  { id: 'ent', name: 'Entertainment', icon: 'gamepad-2' },
  { id: 'beauty', name: 'Beauty', icon: 'sparkles' },
  { id: 'vehicles', name: 'Vehicles', icon: 'car' },
  { id: 'real_estate', name: 'Real Estate', icon: 'building' },
  { id: 'services', name: 'Services', icon: 'briefcase' },
];

export const CONGO_CITIES = [
  'Brazzaville',
  'Pointe-Noire',
  'Dolisie',
  'Nkayi',
  'Kindamba',
  'Impfondo',
  'Ouesso',
  'Madingou',
  'Owando',
  'Sibiti',
  'Loutété',
  'Bouansa',
  'Gamboma',
  'Mossendjo',
  'Kinkala'
];

export const SHIPPING_RATES = {
  SAME_CITY: 1000,
  INTER_CITY: 5000,
  FREE_THRESHOLD: 100000 // Free shipping for official stores over this amount
};

export const FEES = {
  COMMISSION_RATE: 0.05, // 5% commission per sale
  FIXED_FEE: 200 // 200 XAF fixed service fee
};

export const AD_CONFIG: Record<string, { image: string; link: string; title: string }> = {
  'home-top': {
    image: 'https://picsum.photos/1200/200?random=100', // Placeholder for a real banner
    link: '/catalog',
    title: 'Discover our Summer Collection'
  },
  'home-bottom': {
    image: 'https://picsum.photos/1200/250?random=101',
    link: '/sell',
    title: 'Sell your unused items today!'
  }
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Vintage Denim Jacket',
    price: 15000,
    currency: 'XAF',
    image: 'https://picsum.photos/400/500?random=1',
    category: 'women',
    brand: 'Levi\'s',
    size: 'M',
    condition: 'Very Good',
    seller: {
      id: 'u1',
      name: 'Marie K.',
      avatar: 'https://picsum.photos/50/50?random=1',
      isVerified: true,
      memberSince: '2021',
      responseRate: '98%',
      location: 'Brazzaville'
    },
    likes: 12,
    description: 'Authentic vintage denim jacket, slightly worn but in great condition. Perfect for chilly evenings.',
    location: 'Brazzaville, Centre',
    postedAt: '2 days ago'
  },
  {
    id: '2',
    title: 'iPhone 13 Pro Max - 256GB',
    price: 850,
    currency: '$',
    image: 'https://picsum.photos/400/500?random=2',
    category: 'tech',
    brand: 'Apple',
    condition: 'Good',
    seller: {
      id: 'u2',
      name: 'Tech Store B.',
      avatar: 'https://picsum.photos/50/50?random=2',
      isVerified: true,
      memberSince: '2022',
      responseRate: '100%',
      location: 'Pointe-Noire',
      isOfficialStore: true
    },
    likes: 45,
    description: 'iPhone 13 Pro Max, battery health 89%. Comes with box and charger.',
    location: 'Pointe-Noire',
    postedAt: '4 hours ago'
  },
  {
    id: '3',
    title: 'Nike Air Force 1',
    price: 65,
    currency: '$',
    image: 'https://picsum.photos/400/500?random=3',
    category: 'men',
    brand: 'Nike',
    size: '43',
    condition: 'New',
    seller: {
      id: 'u3',
      name: 'Jean D.',
      avatar: 'https://picsum.photos/50/50?random=3',
      isVerified: false,
      memberSince: '2024',
      responseRate: '45%',
      location: 'Oyo'
    },
    likes: 8,
    description: 'Brand new, never worn. Box included.',
    location: 'Oyo',
    postedAt: '1 day ago'
  },
  {
    id: '4',
    title: 'Wooden Coffee Table',
    price: 35000,
    currency: 'XAF',
    image: 'https://picsum.photos/400/500?random=4',
    category: 'home',
    condition: 'Good',
    seller: {
      id: 'u4',
      name: 'Sarah M.',
      avatar: 'https://picsum.photos/50/50?random=4',
      isVerified: true,
      memberSince: '2020',
      responseRate: '92%',
      location: 'Dolisie'
    },
    likes: 22,
    description: 'Handmade wooden table, local craftsmanship.',
    location: 'Dolisie',
    postedAt: '3 days ago'
  },
  {
    id: '5',
    title: 'PlayStation 5 Controller',
    price: 45,
    currency: '$',
    image: 'https://picsum.photos/400/500?random=5',
    category: 'ent',
    brand: 'Sony',
    condition: 'Very Good',
    seller: {
      id: 'u5',
      name: 'Gamer Zone',
      avatar: 'https://picsum.photos/50/50?random=5',
      isVerified: true,
      memberSince: '2019',
      responseRate: '99%',
      location: 'Brazzaville'
    },
    likes: 156,
    description: 'Original DualSense controller. Barely used.',
    location: 'Brazzaville',
    postedAt: '5 hours ago'
  },
  {
    id: '6',
    title: 'Zara Summer Dress',
    price: 8500,
    currency: 'XAF',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400',
    category: 'women',
    brand: 'Zara',
    size: 'S',
    condition: 'Very Good',
    seller: {
      id: 'u1',
      name: 'Marie K.',
      avatar: 'https://ui-avatars.com/api/?name=Marie+K',
      isVerified: true,
      memberSince: '2021',
      responseRate: '98%',
      location: 'Brazzaville'
    },
    likes: 4,
    description: 'Light and airy, perfect for the summer heat.',
    location: 'Brazzaville, Bacongo',
    postedAt: '1 week ago'
  },
  {
    id: '7',
    title: 'Toyota RAV4 2020',
    price: 15000000,
    currency: 'XAF',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?auto=format&fit=crop&w=800',
    category: 'vehicles',
    brand: 'Toyota',
    condition: 'Good',
    seller: {
      id: 'u6',
      name: 'Auto Prestige',
      avatar: 'https://ui-avatars.com/api/?name=Auto+Prestige&background=0D9488&color=fff',
      isVerified: true,
      memberSince: '2019',
      responseRate: '100%',
      location: 'Brazzaville',
      isOfficialStore: true
    },
    likes: 89,
    description: 'Toyota RAV4 4x4, full option, maintained at Toyota Congo. 45,000km.',
    location: 'Brazzaville, Centre-Ville',
    postedAt: '2 days ago'
  },
  {
    id: '8',
    title: 'Appartement Meublé 3 Pièces',
    price: 350000,
    currency: 'XAF',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400',
    category: 'real_estate',
    condition: 'Good',
    seller: {
      id: 'u7',
      name: 'Immo Congo',
      avatar: 'https://ui-avatars.com/api/?name=Immo+Congo&background=0D9488&color=fff',
      isVerified: true,
      memberSince: '2020',
      responseRate: '95%',
      location: 'Pointe-Noire'
    },
    likes: 42,
    description: 'Bel appartement meublé, vue sur mer, sécurisé, groupe électrogène.',
    location: 'Pointe-Noire, Côte Sauvage',
    postedAt: '1 day ago'
  },
  {
    id: '9',
    title: 'HP Envy x360',
    price: 450000,
    currency: 'XAF',
    image: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&w=400',
    category: 'tech',
    brand: 'HP',
    condition: 'Very Good',
    seller: {
      id: 'u8',
      name: 'Student Tech',
      avatar: 'https://ui-avatars.com/api/?name=Student+Tech',
      isVerified: false,
      memberSince: '2023',
      responseRate: '80%',
      location: 'Brazzaville'
    },
    likes: 15,
    description: 'HP convertible laptop, i7 11th gen, 16GB RAM, 512GB SSD.',
    location: 'Brazzaville, Moungali',
    postedAt: '6 hours ago'
  },
  {
    id: '10',
    title: 'Terrain 500m2 Kintélé',
    price: 8000000,
    currency: 'XAF',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400',
    category: 'real_estate',
    condition: 'New',
    seller: {
      id: 'u7',
      name: 'Immo Congo',
      avatar: 'https://ui-avatars.com/api/?name=Immo+Congo&background=0D9488&color=fff',
      isVerified: true,
      memberSince: '2020',
      responseRate: '95%',
      location: 'Pointe-Noire'
    },
    likes: 112,
    description: 'Terrain plat, borné, avec titre foncier. Zone en plein essor.',
    location: 'Kintélé',
    postedAt: '3 days ago'
  },
  {
    id: '11',
    title: 'Dépannage Informatique',
    price: 15000,
    currency: 'XAF',
    image: 'https://images.unsplash.com/photo-1597872250969-966903bf88fb?auto=format&fit=crop&w=400',
    category: 'services',
    condition: 'New',
    seller: {
      id: 'u9',
      name: 'IT Services Pro',
      avatar: 'https://ui-avatars.com/api/?name=IT+Pro',
      isVerified: true,
      memberSince: '2021',
      responseRate: '100%',
      location: 'Brazzaville'
    },
    likes: 5,
    description: 'Réparation PC/Mac, installation Windows/Office, récupération données.',
    location: 'Brazzaville, Poto-Poto',
    postedAt: 'Just now'
  }
];