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
    image: 'https://picsum.photos/400/500?random=6',
    category: 'women',
    brand: 'Zara',
    size: 'S',
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
    likes: 4,
    description: 'Light and airy, perfect for the summer heat.',
    location: 'Brazzaville, Bacongo',
    postedAt: '1 week ago'
  },
];