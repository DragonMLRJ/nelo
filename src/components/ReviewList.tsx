import React, { useEffect, useState } from 'react';
import StarRating from './StarRating';
import { User, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Review {
    id: number;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface ReviewListProps {
    productId: number;
    refreshTrigger: number; // Used to trigger refetch
}

const ReviewList: React.FC<ReviewListProps> = ({ productId, refreshTrigger }) => {
    const { t } = useLanguage();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Ensure productId is valid
                if (!productId) return;

                // TODO: Implement Supabase Reviews
                // const response = await fetch(`http://localhost:8000/api/reviews...`);
                const response = { json: async () => ({ success: true, reviews: [] }) };
                const data = await response.json();
                if (data.success) {
                    setReviews(data.reviews);
                } else {
                    // If fail, just set empty to avoid breaking UI
                    setReviews([]);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId, refreshTrigger]);

    if (loading) {
        return <div className="py-8 text-center text-gray-500">{t('common.loading')}</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('review.no_reviews') || 'No reviews yet. Be the first to review!'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-gray-900">{review.user_name}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="mb-2">
                        <StarRating rating={review.rating} size={14} readonly />
                    </div>
                    {review.comment && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {review.comment}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
