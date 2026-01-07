import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rounded',
    width,
    height
}) => {
    const baseClasses = "animate-pulse bg-gray-200";

    const variantClasses = {
        text: "rounded",
        circular: "rounded-full",
        rectangular: "rounded-none",
        rounded: "rounded-lg"
    };

    const style: React.CSSProperties = {};
    if (width) style.width = width;
    if (height) style.height = height;

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
};
