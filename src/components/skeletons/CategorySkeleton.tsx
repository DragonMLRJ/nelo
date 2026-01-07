import React from 'react';
import { Skeleton } from './Skeleton';

export const CategorySkeleton: React.FC = () => {
    return (
        <div className="flex flex-col items-center gap-3 p-4">
            <Skeleton variant="circular" width={48} height={48} />
            <Skeleton variant="text" width={60} height={12} />
        </div>
    );
};
