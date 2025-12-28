export interface User {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  isVerified: boolean;
  isAdmin?: boolean;
  isForumManager?: boolean;
  memberSince?: string;
  responseRate?: string;
  location?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  images?: string[]; // Optional array of image URLs
  category: string;
  brand?: string;
  size?: string;
  condition: 'New' | 'Very Good' | 'Good' | 'Fair';
  seller: User;
  likes: number;
  description: string;
  location: string;
  postedAt: string;
}

export interface AdProps {
  slot: string;
  format?: 'horizontal' | 'vertical' | 'box';
  className?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  isRead: boolean;
  attachmentUrl?: string; // Optional
  attachmentType?: 'image' | 'document'; // Optional
}

export interface Conversation {
  id: string;
  participants: User[];
  productId?: string; // Optional context if chat is about a specific item
  productName?: string;
  productImage?: string;
  messages: Message[];
  lastMessageAt: Date;
  unreadCount: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  title: string;
  image: string;
  product_snapshot?: any;
}

export interface Order {
  id: number;
  order_number: string;
  buyer_id: number;
  seller_id: number;
  total_amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  shipping_address: string;
  payment_method: string;
  payment_status: string;

  // Joined fields
  counterparty_name: string;
  counterparty_avatar?: string;

  items: OrderItem[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  date: Date;
  link?: string;
}