import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartBadge: React.FC = () => {
    const { itemCount } = useCart();
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/cart')}
            className="relative p-2 text-gray-700 hover:text-teal-600 transition-colors"
            aria-label="Shopping Cart"
        >
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {itemCount > 9 ? '9+' : itemCount}
                </span>
            )}
        </button>
    );
};

export default CartBadge;
