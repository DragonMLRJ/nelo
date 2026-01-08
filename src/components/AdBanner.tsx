import React from 'react';
import { AdProps } from '../types';

import { AD_CONFIG } from '../constants';

const AdBanner: React.FC<AdProps> = ({ format = 'horizontal', slot, className = '' }) => {
  const adContext = slot ? AD_CONFIG[slot] : null;

  if (!adContext) {
    // Optionally return null to hide if no ad is configured
    // return null; 
    // keeping placeholder for layout stability in demo
  }

  const baseStyles = "flex items-center justify-center overflow-hidden relative group rounded-xl shadow-sm transition-transform hover:scale-[1.01]";

  const sizeStyles = format === 'horizontal'
    ? 'w-full h-32 md:h-48'
    : format === 'vertical'
      ? 'w-full h-[600px]'
      : 'w-[300px] h-[250px]';

  return (
    <div className={`my-8 ${className}`}>
      {adContext ? (
        <a href={adContext.link} className={`${baseStyles} ${sizeStyles} block`}>
          <img
            src={adContext.image}
            alt={adContext.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
          <span className="absolute top-2 right-2 bg-white/90 text-[10px] px-2 py-0.5 rounded text-gray-500 font-medium uppercase tracking-wider shadow-sm">
            Sponsorisé
          </span>
          <div className="absolute bottom-4 left-4 text-white text-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="font-bold text-lg">{adContext.title}</p>
          </div>
        </a>
      ) : (
        // Fallback Placeholder
        <div className={`${baseStyles} ${sizeStyles} bg-gray-100 border-2 border-dashed border-gray-300`}>
          <span className="text-gray-400 font-medium">Espace Publicitaire ({slot})</span>
        </div>
      )}
    </div>
  );
};

export default AdBanner;
