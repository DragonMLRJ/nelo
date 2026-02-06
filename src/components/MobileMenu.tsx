import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    X,
    Home,
    ShoppingBag,
    PlusCircle,
    Users,
    LogIn,
    LogOut,
    User,
    Settings,
    Heart,
    MessageCircle,
    Package
} from 'lucide-react';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    logout: () => void;
    t: (key: string) => string;
    isSeller: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, user, logout, t, isSeller }) => {
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
        onClose();
    };

    const menuItems = [
        { label: t('nav.home'), icon: Home, path: '/' },
        { label: t('nav.catalog'), icon: ShoppingBag, path: '/catalog' },
        { label: t('nav.sell'), icon: PlusCircle, path: '/sell', highlight: true },
        { label: 'Communauté', icon: Users, action: () => window.open('https://discord.gg/nelo-community', '_blank') },
    ];

    const userItems = user ? [
        { label: 'Mon Profil', icon: User, path: '/profile' },
        { label: 'Mes Commandes', icon: Package, path: '/profile?tab=purchases' },
        { label: 'Favoris', icon: Heart, path: '/profile?tab=wishlist' },
        { label: 'Messages', icon: MessageCircle, path: '/profile?tab=messages' },
        { label: 'Paramètres', icon: Settings, path: '/profile?tab=settings' },
    ] : [];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                        onClick={onClose}
                    />

                    {/* Sidebar Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[9999] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header: User Profile or Login CTA */}
                        <div className="bg-teal-900 text-white p-6 pt-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            {user ? (
                                <div onClick={() => handleNavigation('/profile')} className="cursor-pointer">
                                    <div className="flex items-center gap-4 mb-3">
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-16 h-16 rounded-full border-4 border-white/20 shadow-lg object-cover"
                                        />
                                        <div>
                                            <p className="font-bold text-lg leading-tight">{user.name}</p>
                                            <p className="text-teal-200 text-xs">Membre depuis {user.memberSince || '2024'}</p>
                                        </div>
                                    </div>
                                    {isSeller && (
                                        <span className="inline-block px-2 py-1 bg-teal-500/30 border border-teal-500/50 rounded text-xs font-bold text-teal-100">
                                            Vendeur Vérifié
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <h2 className="text-2xl font-bold mb-2">Bienvenue sur Nelo</h2>
                                    <p className="text-teal-200 text-sm mb-4">Connectez-vous pour acheter et vendre.</p>
                                    <button
                                        onClick={() => handleNavigation('/login')}
                                        className="bg-white text-teal-900 px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                                    >
                                        <LogIn className="w-4 h-4" /> Se connecter
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Menu Links */}
                        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                            <div className="mb-6">
                                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
                                {menuItems.map((item, idx) => (
                                    <motion.button
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => item.action ? item.action() : handleNavigation(item.path!)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${item.highlight
                                                ? 'bg-teal-50 text-teal-700 font-bold'
                                                : 'text-gray-700 hover:bg-gray-50 font-medium'
                                            }`}
                                    >
                                        <item.icon className={`w-6 h-6 ${item.highlight ? 'text-teal-600' : 'text-gray-400'}`} />
                                        <span className="text-lg">{item.label}</span>
                                    </motion.button>
                                ))}
                            </div>

                            {user && (
                                <div className="mb-6">
                                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mon Compte</p>
                                    {userItems.map((item, idx) => (
                                        <motion.button
                                            key={idx}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + (idx * 0.05) }}
                                            onClick={() => handleNavigation(item.path)}
                                            className="w-full flex items-center gap-4 p-4 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all"
                                        >
                                            <item.icon className="w-5 h-5 text-gray-400" />
                                            <span>{item.label}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {user && (
                            <div className="p-4 border-t border-gray-100 bg-gray-50">
                                <button
                                    onClick={() => { logout(); onClose(); }}
                                    className="w-full flex items-center justify-center gap-2 p-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-5 h-5" /> Se déconnecter
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;
