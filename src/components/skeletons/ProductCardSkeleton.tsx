import React from 'react';
import { Skeleton } from './Skeleton';

export const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Image Placeholder */}
            <div className="aspect-[3/4] w-full">
                <Skeleton variant="rectangular" className="w-full h-full" />
            </div>

            <div className="p-3 space-y-3">
                {/* Price & Icons line */}
                <div className="flex justify-between items-start">
                    <Skeleton variant="text" width="40%" height={24} />
                    <div className="flex gap-2">
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="circular" width={24} height={24} />
                    </div>
                </div>

                {/* Brand & Size */}
                <div className="flex gap-2">
                    <Skeleton variant="text" width="30%" height={12} />
                    <Skeleton variant="text" width="20%" height={12} />
                </div>

                {/* Seller Info */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50 mt-1">
                    <Skeleton variant="circular" width={20} height={20} />
                    <Skeleton variant="text" width="50%" height={12} />
                </div>
            </div>
        </div>
    );
};
