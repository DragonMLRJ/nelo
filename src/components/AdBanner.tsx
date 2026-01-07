import React from 'react';
import { AdProps } from '../types';

const AdBanner: React.FC<AdProps> = ({ format = 'horizontal', slot, className = '' }) => {
  // In a real app, this would integrate with Google AdSense or another ad provider using the 'slot' ID.
  // For this demo, we style it as a placeholder.
  
  const baseStyles = "bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-sm font-medium uppercase tracking-widest overflow-hidden relative group";
  
  const sizeStyles = format === 'horizontal' 
    ? 'w-full h-24' 
    : format === 'vertical' 
      ? 'w-full h-[600px]' 
      : 'w-[300px] h-[250px]';

  return (
    <div className={`my-6 ${className}`}>
      <div className={`${baseStyles} ${sizeStyles}`}>
        <span className="z-10 bg-white/80 px-2 py-1 rounded">Advertisement</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
      </div>
      <p className="text-xs text-gray-400 text-center mt-1">Sponsored Content</p>
    </div>
  );
};

export default AdBanner;
