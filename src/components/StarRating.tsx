import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating?: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: number;
    showCount?: boolean;
    count?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating = 0,
    onRatingChange,
    readonly = false,
    size = 20,
    showCount = false,
    count = 0
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (index: number) => {
        if (!readonly) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    const handleClick = (index: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(index);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => handleClick(index)}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors focus:outline-none`}
                    disabled={readonly}
                >
                    <Star
                        size={size}
                        className={`
                            ${(hoverRating || rating) >= index ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            transition-colors
                        `}
                    />
                </button>
            ))}
            {showCount && count > 0 && (
                <span className="text-xs text-gray-500 ml-1">({count})</span>
            )}
        </div>
    );
};

export default StarRating;
