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
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Sell from './pages/Sell';
import Messages from './pages/Messages';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Policies from './pages/Policies';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import Returns from './pages/legal/Returns';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/Admin/Dashboard';
import Forum from './pages/Forum';
import InfoPage from './pages/InfoPage';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';
import SellerDashboard from './pages/SellerDashboard';
import CookieConsent from './components/CookieConsent';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import UsersPage from './pages/Admin/Users';
import ModerationPage from './pages/Admin/Moderation';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout/:productId" element={<Checkout />} />
        <Route path="/login" element={<Auth type="login" />} />
        <Route path="/register" element={<Auth type="register" />} />
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
        <Route path="/sales" element={<SellerDashboard />} />
      </Routes>
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