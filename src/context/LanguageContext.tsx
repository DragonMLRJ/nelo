import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'EN' | 'FR' | 'LN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    // Navigation
    'nav.home': 'Home',
    'nav.catalog': 'Catalog',
    'nav.sell': 'Sell now',
    'nav.login': 'Log in',
    'nav.signup': 'Sign up',
    'nav.search': 'Search items...',
    'nav.profile': 'My Profile',
    'nav.orders': 'My Orders',
    'nav.settings': 'Settings',
    'nav.logout': 'Log out',
    'nav.admin': 'Admin Dashboard',
    'nav.messages': 'Messages',
    'nav.wishlist': 'Wishlist',
    'nav.browse': 'Browse All',

    // Hero Section
    'hero.title': 'Ready to declutter?',
    'hero.subtitle': 'Join the largest Congolese marketplace. Sell simply, buy securely.',
    'hero.btn_sell': 'Start Selling',
    'hero.btn_shop': 'Shop Now',

    // Categories
    'cat.women': 'Women',
    'cat.men': 'Men',
    'cat.kids': 'Kids',
    'cat.home': 'Home & Garden',
    'cat.tech': 'Electronics',
    'cat.entertainment': 'Entertainment',
    'cat.beauty': 'Beauty & Health',
    'cat.sports': 'Sports',

    // Common
    'common.currency': 'FCFA',
    'common.new': 'New',
    'common.used': 'Used',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',

    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.start': 'Start adding items to your cart!',
    'cart.items': 'items',
    'cart.item': 'item',
    'cart.clear': 'Clear Cart',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.free': 'FREE',
    'cart.proceed': 'Proceed to Checkout',
    'cart.continue': 'Continue Shopping',
    'cart.secure': 'Secure checkout powered by Nelo',
    'cart.login_view': 'Please log in to view your cart',

    // Checkout
    'checkout.title': 'Checkout',
    'checkout.summary': 'Order Summary',
    'checkout.shipping': 'Shipping Address',
    'checkout.payment': 'Payment Method',
    'checkout.subtotal': 'Subtotal',
    'checkout.total': 'Total',
    'checkout.pay': 'Pay Now',
    'checkout.card': 'Credit Card',
    'checkout.mobile': 'Mobile Money',
    'checkout.cash': 'Cash on Delivery',
    'checkout.success': 'Payment Successful!',
    'checkout.processing': 'Processing payment...',
    'checkout.no_items': 'No items to checkout.',
    'checkout.browse_catalog': 'Browse Catalog',
    'checkout.card_number': 'Card Number',
    'checkout.expiry': 'Expiry',
    'checkout.cvc': 'CVC',
    'checkout.secure_ssl': 'Secure SSL Encrypted',
    'checkout.buyer_protection_fee': 'Buyer Protection Fee',
    'checkout.secure_desc_short': 'Secure payment. Your money is held until you confirm receipt of the item.',
    'checkout.thank_you': 'Thank you for your purchase.',
    'checkout.view_orders': 'View My Orders',
    'checkout.change_address': 'Change Address',

    // Seller Dashboard
    'seller.title': 'Seller Dashboard',
    'seller.subtitle': 'Manage your sales, orders, and products',
    'seller.revenue': 'Total Revenue',
    'seller.orders': 'Total Orders',
    'seller.pending': 'Pending Orders',
    'seller.tab_orders': 'Orders',
    'seller.tab_products': 'My Products',
    'seller.tab_overview': 'Overview & Settings',
    'seller.no_orders': 'No orders found.',

    // Orders
    'order.status.pending': 'Pending',
    'order.status.processing': 'Processing',
    'order.status.shipped': 'Shipped',
    'order.status.delivered': 'Delivered',
    'order.status.cancelled': 'Cancelled',
    'order.id': 'Order ID',
    'order.date': 'Date',
    'order.sold_by': 'Sold by',
    'order.ordered_by': 'Ordered by',

    // Reviews
    'review.write_title': 'Write a Review',
    'review.rating_label': 'Rating',
    'review.comment_label': 'Comment',
    'review.comment_placeholder': 'Share your experience with this product...',
    'review.submit': 'Submit Review',
    'review.error_rating': 'Please select a rating',
    'review.no_reviews': 'No reviews yet. Be the first to review!',
    'review.customer_reviews': 'Customer Reviews',
    'review.write_btn': 'Write a Review',

    // Home
    'home.shop_category': 'Shop by Category',
    'home.fresh': 'Fresh recommendations',
    'home.see_all': 'See all',
    'home.sell_simply': 'Sell simply',
    'home.sell_desc': 'Snap a photo, describe your item, and set your price. It\'s free to list!',
    'home.buy_securely': 'Buy securely',
    'home.buy_desc': 'We protect your money until you receive the item and confirm it\'s as described.',
    'home.ship_easily': 'Ship easily',
    'home.ship_desc': 'Use our integrated delivery partners for hassle-free shipping across Congo.',

    // Product
    'product.buy_now': 'Buy now',
    'product.add_cart': 'Add to Cart',
    'product.make_offer': 'Make Offer',
    'product.message_seller': 'Message',
    'product.saved': 'Saved to favorites',
    'product.add_fav': 'Add to favorites',
    'product.share': 'Share',
    'product.buyer_protection': 'Buyer Protection',
    'product.protection_desc': 'We hold your payment until you confirm the item has arrived and matches the description.',
    'product.related': 'You might also like',
    'product.verified_seller': 'Verified',
    'product.member_since': 'Joined',
    'product.response_rate': 'Response',
    'product.location': 'Location',
    'product.quick_view': 'Quick View',
    'product.link_copied': 'Link Copied',
    'product.link_copied_msg': 'Product link copied to clipboard.',
    'product.added_wishlist': 'Added to Wishlist',
    'product.added_wishlist_msg': 'has been saved to your favorites.',
    'product.likes': 'likes',

    // Sell
    'sell.title': 'Sell an Item',
    'sell.photos': 'Photos',
    'sell.add_photo': 'Add Photo',
    'sell.cover': 'Cover',
    'sell.item_title': 'Title',
    'sell.item_title_ph': 'e.g. White COS T-shirt',
    'sell.description': 'Description',
    'sell.description_ph': 'Describe your item in detail (brand, condition, defects...)',
    'sell.category': 'Category',
    'sell.select_category': 'Select a category',
    'sell.brand': 'Brand',
    'sell.brand_ph': 'e.g. Nike',
    'sell.condition': 'Condition',
    'sell.select_condition': 'Select condition',
    'sell.price': 'Price',
    'sell.submit': 'Upload Item',
    'sell.submitting': 'Publishing...',
    'sell.uploading': 'Uploading...',

    // Validation
    'val.required': 'Required',

    // Logout
    'nav.logout_title': 'Log out?',
    'nav.logout_msg': 'Are you sure you want to log out of your account?',
    'nav.logout_confirm': 'Log out',
  },
  FR: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.sell': 'Vendre',
    'nav.login': 'Connexion',
    'nav.signup': "S'inscrire",
    'nav.catalog': 'Catalogue',
    'nav.search': 'Rechercher...',
    'nav.profile': 'Mon Profil',
    'nav.orders': 'Mes Commandes',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Se déconnecter',
    'nav.admin': 'Tableau de bord Admin',
    'nav.messages': 'Messages',
    'nav.wishlist': 'Favoris',
    'nav.browse': 'Tout parcourir',

    // Hero Section
    'hero.title': 'Prêt à faire du tri ?',
    'hero.subtitle': 'Rejoignez la plus grande marketplace du Congo. Vendez simplement, achetez en toute sécurité.',
    'hero.btn_sell': 'Commencer à vendre',
    'hero.btn_shop': 'Acheter maintenant',

    // Categories
    'cat.women': 'Femmes',
    'cat.men': 'Hommes',
    'cat.kids': 'Enfants',
    'cat.home': 'Maison & Jardin',
    'cat.tech': 'Électronique',
    'cat.entertainment': 'Divertissement',
    'cat.beauty': 'Beauté & Santé',
    'cat.sports': 'Sports',

    // Common
    'common.currency': 'FCFA',
    'common.new': 'Neuf',
    'common.used': 'Occasion',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.close': 'Fermer',

    // Cart
    'cart.title': 'Panier',
    'cart.empty': 'Votre panier est vide',
    'cart.start': 'Commencez à ajouter des articles !',
    'cart.items': 'articles',
    'cart.item': 'article',
    'cart.clear': 'Vider le panier',
    'cart.subtotal': 'Sous-total',
    'cart.shipping': 'Livraison',
    'cart.free': 'GRATUIT',
    'cart.proceed': 'Passer à la caisse',
    'cart.continue': 'Continuer vos achats',
    'cart.secure': 'Paiement sécurisé par Nelo',
    'cart.login_view': 'Veuillez vous connecter pour voir votre panier',

    // Checkout
    'checkout.title': 'Paiement',
    'checkout.summary': 'Résumé de la commande',
    'checkout.shipping': 'Adresse de livraison',
    'checkout.payment': 'Moyen de paiement',
    'checkout.subtotal': 'Sous-total',
    'checkout.total': 'Total',
    'checkout.pay': 'Payer maintenant',
    'checkout.card': 'Carte Bancaire',
    'checkout.mobile': 'Mobile Money',
    'checkout.cash': 'Paiement à la livraison',
    'checkout.success': 'Paiement réussi !',
    'checkout.processing': 'Traitement du paiement...',
    'checkout.no_items': 'Aucun article à payer.',
    'checkout.browse_catalog': 'Parcourir le catalogue',
    'checkout.card_number': 'Numéro de carte',
    'checkout.expiry': 'Expiration',
    'checkout.cvc': 'CVC',
    'checkout.secure_ssl': 'Cryptage SSL Sécurisé',
    'checkout.buyer_protection_fee': 'Protection Acheteur',
    'checkout.secure_desc_short': 'Paiement sécurisé. Votre argent est bloqué jusqu\'à réception.',
    'checkout.thank_you': 'Merci pour votre achat.',
    'checkout.view_orders': 'Voir mes commandes',
    'checkout.change_address': 'Changer l\'adresse',

    // Seller Dashboard
    'seller.title': 'Tableau de bord Vendeur',
    'seller.subtitle': 'Gérez vos ventes, commandes et produits',
    'seller.revenue': 'Revenu Total',
    'seller.orders': 'Total Commandes',
    'seller.pending': 'Commandes en attente',
    'seller.tab_orders': 'Commandes',
    'seller.tab_products': 'Mes Produits',
    'seller.tab_overview': 'Aperçu & Paramètres',
    'seller.no_orders': 'Aucune commande trouvée.',

    // Orders
    'order.status.pending': 'En attente',
    'order.status.processing': 'En cours',
    'order.status.shipped': 'Expédié',
    'order.status.delivered': 'Livré',
    'order.status.cancelled': 'Annulé',
    'order.id': 'ID Commande',
    'order.date': 'Date',
    'order.sold_by': 'Vendu par',
    'order.ordered_by': 'Commandé par',

    // Reviews
    'review.write_title': 'Écrire un avis',
    'review.rating_label': 'Note',
    'review.comment_label': 'Commentaire',
    'review.comment_placeholder': 'Partagez votre expérience avec ce produit...',
    'review.submit': 'Soumettre l\'avis',
    'review.error_rating': 'Veuillez sélectionner une note',
    'review.no_reviews': 'Aucun avis pour le moment. Soyez le premier !',
    'review.customer_reviews': 'Avis Clients',
    'review.write_btn': 'Écrire un avis',

    // Home
    'home.shop_category': 'Parcourir par Catégorie',
    'home.fresh': 'Recommandations récentes',
    'home.see_all': 'Voir tout',
    'home.sell_simply': 'Vendez simplement',
    'home.sell_desc': 'Prenez une photo, décrivez votre article et fixez votre prix. C\'est gratuit !',
    'home.buy_securely': 'Achetez en sécurité',
    'home.buy_desc': 'Nous protégeons votre argent jusqu\'à ce que vous receviez l\'article conforme.',
    'home.ship_easily': 'Expédiez facilement',
    'home.ship_desc': 'Utilisez nos partenaires de livraison pour une expédition sans tracas au Congo.',

    // Product
    'product.buy_now': 'Acheter',
    'product.add_cart': 'Ajouter au Panier',
    'product.make_offer': 'Faire une offre',
    'product.message_seller': 'Message',
    'product.saved': 'Enregistré dans les favoris',
    'product.add_fav': 'Ajouter aux favoris',
    'product.share': 'Partager',
    'product.buyer_protection': 'Protection Acheteur',
    'product.protection_desc': 'Nous gardons votre paiement jusqu\'à confirmation de la réception conforme.',
    'product.related': 'Vous aimerez aussi',
    'product.verified_seller': 'Vérifié',
    'product.member_since': 'Membre depuis',
    'product.response_rate': 'Réponse',
    'product.location': 'Lieu',
    'product.quick_view': 'Aperçu',
    'product.link_copied': 'Lien copié',
    'product.link_copied_msg': 'Lien du produit copié dans le presse-papier.',
    'product.added_wishlist': 'Ajouté aux favoris',
    'product.added_wishlist_msg': 'a été enregistré dans vos favoris.',
    'product.likes': 'J\'aime',

    // Sell
    'sell.title': 'Vendre un article',
    'sell.photos': 'Photos',
    'sell.add_photo': 'Ajouter Photo',
    'sell.cover': 'Couverture',
    'sell.item_title': 'Titre',
    'sell.item_title_ph': 'ex: T-shirt blanc COS',
    'sell.description': 'Description',
    'sell.description_ph': 'Décrivez votre article en détail (marque, état, défauts...)',
    'sell.category': 'Catégorie',
    'sell.select_category': 'Sélectionner une catégorie',
    'sell.brand': 'Marque',
    'sell.brand_ph': 'ex: Nike',
    'sell.condition': 'État',
    'sell.select_condition': 'Sélectionner l\'état',
    'sell.price': 'Prix',
    'sell.submit': 'Publier l\'annonce',
    'sell.submitting': 'Publication...',
    'sell.uploading': 'Téléchargement...',

    // Validation
    'val.required': 'Requis',

    // User Profile
    'profile.message': 'Message',
    'profile.share': 'Partager',
    'profile.report': 'Signaler',
    'profile.about': 'À propos du vendeur',
    'profile.listings': 'Annonces actives',
    'profile.sold': 'Articles vendus',
    'profile.no_listings': 'Cet utilisateur n\'a aucune annonce active.',
    'profile.report_title': 'Signaler l\'utilisateur',
    'profile.report_msg': 'Veuillez sélectionner une raison',
    'profile.report_submit': 'Envoyer le signalement',
    'profile.report_cancel': 'Annuler',
    'profile.report_success': 'Signalement envoyé avec succès.',

    // Logout
    'nav.logout_title': 'Se déconnecter ?',
    'nav.logout_msg': 'Êtes-vous sûr de vouloir vous déconnecter ?',
    'nav.logout_confirm': 'Se déconnecter',
  },
  LN: {
    // Navigation
    'nav.home': 'Bandela',
    'nav.catalog': 'Biloko Nionso',
    'nav.sell': 'Téka sikoyo',
    'nav.login': 'Kóta',
    'nav.signup': 'Komiyokisa',
    'nav.search': 'Luka biloko...',
    'nav.profile': 'Profil na ngai',
    'nav.orders': 'Biloko na somba',
    'nav.settings': 'Bongisa',
    'nav.logout': 'Bima',
    'nav.admin': 'Admin',
    'nav.messages': 'Messages',
    'nav.wishlist': 'Biloko olingi',
    'nav.browse': 'Tala nionso',

    // Hero Section
    'hero.title': 'Olingi koteka biloko?',
    'hero.subtitle': 'Yaka na esika ya monene ya mombongo na Congo. Teka na pete, somba na kimia.',
    'hero.btn_sell': 'Banda koteka',
    'hero.btn_shop': 'Somba sikoyo',

    // Categories
    'cat.women': 'Basi',
    'cat.men': 'Mibali',
    'cat.kids': 'Bana',
    'cat.home': 'Ndako',
    'cat.tech': 'Elektroniki',
    'cat.entertainment': 'Bisengo',
    'cat.beauty': 'Kitoko',
    'cat.sports': 'Sport',

    // Common
    'common.currency': 'FCFA',
    'common.new': 'Sika',
    'common.used': 'Ya kala',
    'common.loading': 'Ezali kokanga...',
    'common.error': 'Libunga',
    'common.success': 'Malamu',
    'common.cancel': 'Tika',
    'common.confirm': 'Ndima',
    'common.save': 'Bomba',
    'common.delete': 'Longola',
    'common.edit': 'Bongola',
    'common.view': 'Tala',
    'common.close': 'Kanga',

    // Cart
    'cart.title': 'Panier na yo',
    'cart.empty': 'Panier ezali pamba',
    'cart.start': 'Banda kotia biloko!',
    'cart.items': 'biloko',
    'cart.item': 'eloko',
    'cart.clear': 'Longola nionso',
    'cart.subtotal': 'Ntalo',
    'cart.shipping': 'Kotinda',
    'cart.free': 'OFELA',
    'cart.proceed': 'Kende kofuta',
    'cart.continue': 'Tala biloko misusu',
    'cart.secure': 'Kofuta na kimia na Nelo',
    'cart.login_view': 'Kota pona komona panier na yo',

    // Checkout
    'checkout.title': 'Kofuta',
    'checkout.summary': 'Nionso ya commande',
    'checkout.shipping': 'Esika ya kotinda',
    'checkout.payment': 'Ndenge ya kofuta',
    'checkout.subtotal': 'Ntalo',
    'checkout.total': 'Nionso',
    'checkout.pay': 'Futa sikoyo',
    'checkout.card': 'Carte Bancaire',
    'checkout.mobile': 'Mobile Money',
    'checkout.cash': 'Futa na livraison',
    'checkout.success': 'Ofuti malamu!',
    'checkout.processing': 'Azali kofuta...',
    'checkout.no_items': 'Eloko te ya kofuta.',
    'checkout.browse_catalog': 'Tala biloko',
    'checkout.card_number': 'Nimero ya Carte',
    'checkout.expiry': 'Expiration',
    'checkout.cvc': 'CVC',
    'checkout.secure_ssl': 'Kimia SSL',
    'checkout.buyer_protection_fee': 'Protection ya Mosombi',
    'checkout.secure_desc_short': 'Kofuta na kimia. Mbongo na yo ebombami ti okondima.',
    'checkout.thank_you': 'Merci na bosombi na yo.',
    'checkout.view_orders': 'Tala biloko na somba',
    'checkout.change_address': 'Bongola esika',

    // Seller Dashboard
    'seller.title': 'Bureau ya Moteki',
    'seller.subtitle': 'Tala biteko, commandes, na biloko na yo',
    'seller.revenue': 'Mbongo nionso',
    'seller.orders': 'Commandes nionso',
    'seller.pending': 'Commandes ezali kozela',
    'seller.tab_orders': 'Commandes',
    'seller.tab_products': 'Biloko na ngai',
    'seller.tab_overview': 'Bongisa',
    'seller.no_orders': 'Commande moko te.',

    // Orders
    'order.status.pending': 'Ezali kozela',
    'order.status.processing': 'Bazali kosala',
    'order.status.shipped': 'Batindi',
    'order.status.delivered': 'Ekomi',
    'order.status.cancelled': 'Bawangani',
    'order.id': 'Nimero Commande',
    'order.date': 'Date',
    'order.sold_by': 'Etekiyami na',
    'order.ordered_by': 'Esombami na',

    // Reviews
    'review.write_title': 'Komisa makanisi',
    'review.rating_label': 'Note',
    'review.comment_label': 'Makanisi',
    'review.comment_placeholder': 'Lobela biso ndenge omoni eloko oyo...',
    'review.submit': 'Tinda',
    'review.error_rating': 'Poni note',
    'review.no_reviews': 'Makanisi ezali naino te. Zala wa yambo!',
    'review.customer_reviews': 'Makanisi ya ba clients',
    'review.write_btn': 'Komisa makanisi',

    // Home
    'home.shop_category': 'Somba na Categorie',
    'home.fresh': 'Biloko ya Sika',
    'home.see_all': 'Mona nionso',
    'home.sell_simply': 'Teka na Pete',
    'home.sell_desc': 'Kangisa photo, koma mwa maloba, tia ntalo. Ezali ofele!',
    'home.buy_securely': 'Somba na Kimia',
    'home.buy_desc': 'Tobombaka mbongo na yo tii okondima ete eloko ekomeli yo malamu.',
    'home.ship_easily': 'Tinda na Pete',
    'home.ship_desc': 'Salela ba livreurs na biso pona kotinda biloko bipayi nionso na Congo.',

    // Product
    'product.buy_now': 'Somba Sikoyo',
    'product.add_cart': 'Bakisa na Panier',
    'product.make_offer': 'Pesa Ntalo',
    'product.message_seller': 'Tindela Moteki',
    'product.saved': 'Ebombami',
    'product.add_fav': 'Bomba',
    'product.share': 'Kabola',
    'product.buyer_protection': 'Protection ya Mosombi',
    'product.protection_desc': 'Tobombaka mbongo na yo tii okondima ete eloko ekomeli yo malamu.',
    'product.related': 'Okosepela mpe na oyo',
    'product.verified_seller': 'Moteki ya solo',
    'product.member_since': 'Akomaki',
    'product.response_rate': 'Ayanolaka',
    'product.location': 'Esika',
    'product.quick_view': 'Tala noki',
    'product.link_copied': 'Lien ekomami',
    'product.link_copied_msg': 'Lien ya eloko ekomami.',
    'product.added_wishlist': 'Ebakisami na favoris',
    'product.added_wishlist_msg': 'ebombami na biloko olingi.',
    'product.likes': 'balingi',

    // Sell
    'sell.title': 'Teka Eloko',
    'sell.photos': 'Baphoto',
    'sell.add_photo': 'Bakisa Photo',
    'sell.cover': 'Photo ya Liboso',
    'sell.item_title': 'Kombo ya Eloko',
    'sell.item_title_ph': 'Ex: Bilamba ya sika...',
    'sell.description': 'Ndimbola',
    'sell.description_ph': 'Limbola eloko na yo (marque, ndenge ezali...)',
    'sell.category': 'Categorie',
    'sell.select_category': 'Pona categorie',
    'sell.brand': 'Marque',
    'sell.brand_ph': 'Ex: Nike, Samsung...',
    'sell.condition': 'Etat',
    'sell.select_condition': 'Pona etat',
    'sell.price': 'Ntalo',
    'sell.submit': 'Tia na Nelo',
    'sell.submitting': 'Ezali kokende...',
    'sell.uploading': 'Ezali komata...',

    // Validation/States
    // Validation/States
    'val.required': 'Esengeli otondisa awa',

    // Logout
    'nav.logout_title': 'Kobima?',
    'nav.logout_msg': 'Olingi mpenza kobima na compte na yo?',
    'nav.logout_confirm': 'Bima',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('nelo_language');
    return (saved === 'EN' || saved === 'FR' || saved === 'LN') ? saved : 'FR';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nelo_language', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};