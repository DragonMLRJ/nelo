import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { QuickViewProvider } from './context/QuickViewContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
const Home = React.lazy(() => import('./pages/Home'));
const Catalog = React.lazy(() => import('./pages/Catalog'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const Sell = React.lazy(() => import('./pages/Sell'));
const Messages = React.lazy(() => import('./pages/Messages'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Policies = React.lazy(() => import('./pages/Policies'));
const Terms = React.lazy(() => import('./pages/legal/Terms'));
const Privacy = React.lazy(() => import('./pages/legal/Privacy'));
const Returns = React.lazy(() => import('./pages/legal/Returns'));
const Profile = React.lazy(() => import('./pages/Profile'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const AdminDashboard = React.lazy(() => import('./pages/Admin/Dashboard'));
const Forum = React.lazy(() => import('./pages/Forum'));
const InfoPage = React.lazy(() => import('./pages/InfoPage'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const OrderDetails = React.lazy(() => import('./pages/OrderDetails'));
const SellerDashboard = React.lazy(() => import('./pages/SellerDashboard'));
const InvoiceView = React.lazy(() => import('./pages/InvoiceView'));
const UsersPage = React.lazy(() => import('./pages/Admin/Users'));
const ModerationPage = React.lazy(() => import('./pages/Admin/Moderation'));

import CookieConsent from './components/CookieConsent';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
  </div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <React.Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/:productId" element={<Checkout />} />
          <Route path="/login" element={<Auth type="login" />} />
          <Route path="/register" element={<Auth type="register" />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Policies type="cookies" />} />
          <Route path="/refund-policy" element={<Returns />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:userId" element={<UserProfile />} />
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="moderation" element={<ModerationPage />} />
          </Route>

          {/* Info Pages */}
          <Route path="/about" element={<InfoPage pageKey="about" />} />
          <Route path="/sustainability" element={<InfoPage pageKey="sustainability" />} />
          <Route path="/jobs" element={<InfoPage pageKey="jobs" />} />
          <Route path="/how-it-works" element={<InfoPage pageKey="how-it-works" />} />
          <Route path="/pro" element={<InfoPage pageKey="pro" />} />
          <Route path="/trust" element={<InfoPage pageKey="trust" />} />

          {/* Order Management */}
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/invoice/:orderId" element={<InvoiceView />} />
          <Route path="/sales" element={<SellerDashboard />} />
        </Routes>
      </React.Suspense>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProductProvider>
          <OrderProvider>
            <CartProvider>
              <WishlistProvider>
                <ChatProvider>
                  <QuickViewProvider>
                    <LanguageProvider>
                      <BrowserRouter>
                        <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
                          <Navbar />
                          <main className="flex-grow">
                            <AnimatedRoutes />
                          </main>
                          <Footer />
                          <CookieConsent />
                        </div>
                      </BrowserRouter>
                    </LanguageProvider>
                  </QuickViewProvider>
                </ChatProvider>
              </WishlistProvider>
            </CartProvider>
          </OrderProvider>
        </ProductProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

import { HelmetProvider } from 'react-helmet-async';

export default function AppWrapper() {
  return (
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
}