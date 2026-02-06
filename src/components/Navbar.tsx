import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Bell, Heart, User as UserIcon, PlusCircle, MessageCircle, ArrowRight, Settings, LogOut, Package, Shield, Globe, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { useProducts } from '../context/ProductContext';
import { useNotifications } from '../context/NotificationContext';
import { CATEGORIES } from '../constants';
import ConfirmationModal from './ConfirmationModal';
import CartBadge from './CartBadge';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, login, logout } = useAuth();
  const chatContext = useChat();
  const wishlistContext = useWishlist();
  const productContext = useProducts();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate suggestions
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();

    // Match Categories
    const categoryMatches = CATEGORIES
      .filter(c => c.name.toLowerCase().includes(lowerQuery))
      .map(c => c.name);

    // Match Products (Titles) from dynamic context
    const productMatches = productContext.products
      .filter(p => p.title.toLowerCase().includes(lowerQuery))
      .map(p => p.title);

    // Match Brands (Unique)
    const brandMatches = Array.from(new Set(
      productContext.products
        .map(p => p.brand)
        .filter((b): b is string => !!b && b.toLowerCase().includes(lowerQuery))
    ));

    // Combine and limit
    const combined = [...categoryMatches, ...brandMatches, ...productMatches].slice(0, 6);
    setSuggestions(combined);
  }, [searchQuery, productContext.products]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/catalog?q=${encodeURIComponent(suggestion)}`);
  };

  const handleSellClick = () => {
    if (!user) {
      navigate('/login?redirect=/sell');
    } else {
      navigate('/sell');
    }
  };

  const toggleLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLangMenu(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      navigate(link);
      setShowNotifications(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-2xl bg-white/70 border-b border-white/20 supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="text-3xl font-heading font-black text-teal-900 tracking-tighter flex-shrink-0 relative group">
            nelo<span className="text-teal-500">.</span>
            <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-100 to-emerald-50 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t('nav.search')}
                className="w-full pl-11 pr-4 py-3 bg-white/90 border border-gray-200/50 rounded-xl focus:bg-white focus:ring-0 focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.1)] transition-all outline-none font-medium text-sm relative"
              />
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 pointer-events-none group-focus-within:text-teal-500 transition-colors" />
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (searchQuery.length >= 2 || suggestions.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-2 z-50">
                {suggestions.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Suggestions
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2.5 hover:bg-teal-50 text-gray-700 text-sm flex items-center justify-between group transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                          {suggestion}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No matches found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-5">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 font-bold text-xs border border-transparent hover:border-gray-200"
              >
                {language}
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden animate-fade-in-up">
                  {['EN', 'FR', 'LN'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => toggleLanguage(lang as Language)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 ${language === lang ? 'font-bold text-teal-600' : 'text-gray-700'}`}
                    >
                      {lang === 'EN' ? 'English' : lang === 'FR' ? 'Fran??ais' : 'Lingala'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200"></div>

            <Link to="/wishlist" className="relative group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 text-gray-500 group-hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              {wishlistContext.wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                  {wishlistContext.wishlistCount}
                </span>
              )}
            </Link>

            <CartBadge />

            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <button className="relative group" onClick={() => navigate('/messages')}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-teal-50 text-gray-500 group-hover:text-teal-600 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    {chatContext.unreadTotal > 0 && (
                      <span className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                        {chatContext.unreadTotal}
                      </span>
                    )}
                  </button>

                  {/* Notifications */}
                  <div className="relative" ref={notifRef}>
                    <button
                      className="relative group outline-none"
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showNotifications ? 'bg-teal-50 text-teal-600' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bell-shake' : ''}`} />
                      </div>
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
                        >
                          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                              <button onClick={markAllAsRead} className="text-xs text-teal-600 font-medium hover:underline">
                                Mark all read
                              </button>
                            )}
                          </div>
                          <div className="max-h-80 max-h-[60vh] overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-gray-400 text-sm">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                No notifications
                              </div>
                            ) : (
                              <ul>
                                {notifications.map(n => (
                                  <li key={n.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors relative group ${n.isRead ? 'bg-white' : 'bg-blue-50/30'}`}>
                                    <div
                                      className="p-3 pr-8 cursor-pointer"
                                      onClick={() => handleNotificationClick(n.id, n.link)}
                                    >
                                      <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm ${n.isRead ? 'font-medium text-gray-800' : 'font-bold text-black'}`}>{n.title}</h4>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{new Date(n.date).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                                      className="absolute right-2 top-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                      title="Remove"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div
                    className="relative group cursor-pointer"
                    onMouseEnter={() => { }}
                    onMouseLeave={() => { }}
                  >
                    <div className="flex items-center gap-2 hover:text-teal-600 transition-colors">
                      <UserIcon className="w-6 h-6" />
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 mb-1">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.id}</p>
                        {user.isAdmin && (
                          <p className="text-xs text-purple-600 font-bold mt-1 uppercase">Admin User</p>
                        )}
                      </div>

                      {user.isAdmin && (
                        <Link to="/admin" className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 font-semibold flex items-center gap-2 w-full">
                          <Shield className="w-4 h-4" /> {t('nav.admin')}
                        </Link>
                      )}

                      <Link to="/profile" className="px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2 w-full">
                        <UserIcon className="w-4 h-4" /> {t('nav.profile')}
                      </Link>
                      <Link to="/profile" className="px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2 w-full">
                        <Package className="w-4 h-4" /> {t('nav.orders')}
                      </Link>
                      <Link to="/profile" className="px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2 w-full">
                        <Settings className="w-4 h-4" /> {t('nav.settings')}
                      </Link>
                      <Link to="/disputes" className="px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2 w-full">
                        <Shield className="w-4 h-4 text-orange-500" /> Disputes
                      </Link>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogoutClick} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left flex items-center gap-2">
                          <LogOut className="w-4 h-4" /> {t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/register" className="text-teal-600 font-medium hover:underline text-sm">{t('nav.signup')}</Link>
                <Link to="/login" className="text-gray-500 font-medium hover:text-gray-700 text-sm">{t('nav.login')}</Link>
              </div>
            )}

            <button
              onClick={handleSellClick}
              className="bg-teal-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {t('nav.sell')}
            </button>
          </div>

          {/* Mobile Menu Toggle & Actions */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={() => navigate('/catalog')} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {user && (
              <button onClick={() => navigate('/messages')} className="w-10 h-10 flex items-center justify-center bg-transparent text-gray-600 relative">
                <MessageCircle className="w-6 h-6" />
                {chatContext.unreadTotal > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {chatContext.unreadTotal}
                  </span>
                )}
              </button>
            )}

            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 fixed top-20 left-0 right-0 bottom-0 overflow-y-auto shadow-lg z-[9999]">
            <div className="p-4 flex flex-col gap-4">
              {/* Mobile Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative mb-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search')}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              </form>

              {/* Mobile Language Selector */}
              <div className="flex gap-2">
                {['EN', 'FR', 'LN'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang as Language)}
                    className={`flex-1 py-1 text-xs border rounded ${language === lang ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold' : 'border-gray-200 text-gray-600'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {user ? (
                <div className="pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold overflow-hidden">
                      {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{user.name}</p>
                        {user.isAdmin && <Shield className="w-3 h-3 text-purple-600" />}
                      </div>
                      <p className="text-xs text-gray-500">Member since 2024</p>
                    </div>
                  </div>

                  {user.isAdmin && (
                    <Link to="/admin" className="block w-full text-center py-2 mb-2 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 font-medium hover:bg-purple-100 flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" /> {t('nav.admin')}
                    </Link>
                  )}

                  <Link to="/profile" className="block w-full text-center py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                    {t('nav.profile')}
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2 pb-4 border-b border-gray-100">
                  <Link to="/register" className="flex-1 bg-white border border-teal-600 text-teal-600 py-2 rounded text-center font-medium">{t('nav.signup')}</Link>
                  <Link to="/login" className="flex-1 bg-teal-600 text-white py-2 rounded text-center font-medium">{t('nav.login')}</Link>
                </div>
              )}

              <Link to="/catalog" className="text-gray-700 py-2 font-medium">{t('nav.browse')}</Link>

              <Link to="/wishlist" className="flex items-center justify-between text-gray-700 py-2 font-medium">
                {t('nav.wishlist')}
                {wishlistContext.wishlistCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlistContext.wishlistCount}</span>}
              </Link>

              {user && (
                <>
                  <Link to="/messages" className="flex items-center justify-between text-gray-700 py-2 font-medium">
                    {t('nav.messages')}
                    {chatContext.unreadTotal > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{chatContext.unreadTotal}</span>}
                  </Link>
                  <Link to="/profile" className="text-gray-700 py-2 font-medium">{t('nav.orders')}</Link>
                </>
              )}

              <button onClick={handleSellClick} className="bg-teal-600 text-white py-3 rounded-md font-bold mt-2 shadow-sm">
                {t('nav.sell')}
              </button>

              {user && (
                <button onClick={handleLogoutClick} className="text-red-500 text-sm mt-4 text-left flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title={t('nav.logout_title')}
        message={t('nav.logout_msg')}
        confirmText={t('nav.logout_confirm')}
        isDestructive={true}
      />
    </>
  );
};

export default Navbar;
