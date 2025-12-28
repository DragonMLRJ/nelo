import React, { useState } from 'react';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface ReviewFormProps {
    productId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess, onCancel }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError(t('review.error_rating') || 'Please select a rating');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/reviews/index.php?action=create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: productId,
                    user_id: user?.id,
                    rating,
                    comment
                }),
            });

            const data = await response.json();

            if (data.success) {
                setRating(0);
                setComment('');
                onSuccess();
            } else {
                setError(data.message || 'Failed to submit review');
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-bold text-lg mb-4">{t('review.write_title') || 'Write a Review'}</h3>

            {error && (
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('review.rating_label') || 'Rating'}
                </label>
                <StarRating rating={rating} onRatingChange={setRating} size={24} />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('review.comment_label') || 'Comment'}
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    rows={4}
                    placeholder={t('review.comment_placeholder') || 'Share your experience with this product...'}
                />
            </div>

            <div className="flex gap-3 justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        t('review.submit') || 'Submit Review'
                    )}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
