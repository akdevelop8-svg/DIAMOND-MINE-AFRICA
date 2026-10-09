import React, { useState } from 'react';
import { MINERAL_IMAGES, MINERAL_IMAGE_FILENAMES } from '../data/mineralImages';

interface MineralGraphicProps {
  type: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  glow?: boolean;
  preferImage?: boolean;
}

export const MineralGraphic: React.FC<MineralGraphicProps> = ({
  type,
  size = 'md',
  className = '',
  glow = true,
  preferImage = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    xs: 'w-10 h-10',
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    hero: 'w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80',
  };

  const normalized = type.toLowerCase();
  const imageSrc = MINERAL_IMAGES[normalized] || `/assets/minerals/${MINERAL_IMAGE_FILENAMES[normalized] || `${normalized}.png`}`;
  const filename = MINERAL_IMAGE_FILENAMES[normalized] || `${normalized}.png`;

  const glowColors: Record<string, string> = {
    uranium: 'rgba(234, 179, 8, 0.45)',
    lithium: 'rgba(56, 189, 248, 0.45)',
    iron: 'rgba(148, 163, 184, 0.45)',
    copper: 'rgba(249, 115, 22, 0.45)',
    sapphire: 'rgba(59, 130, 246, 0.45)',
    ruby: 'rgba(239, 68, 68, 0.45)',
    emerald: 'rgba(16, 185, 129, 0.45)',
    platinum: 'rgba(203, 213, 225, 0.45)',
    gold: 'rgba(245, 158, 11, 0.45)',
    diamond: 'rgba(56, 189, 248, 0.55)',
  };

  const currentGlow = glowColors[normalized] || 'rgba(56, 189, 248, 0.4)';
  const formattedTitle = `${type.charAt(0).toUpperCase() + type.slice(1)} mineral`;

  // Render authentic mineral image file
  if (preferImage && !imageError && imageSrc) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
        {glow && (
          <div
            className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-opacity duration-300"
            style={{ backgroundColor: currentGlow }}
          />
        )}
        <img
          src={imageSrc}
          alt={formattedTitle}
          title={`${formattedTitle} (${filename})`}
          onError={() => setImageError(true)}
          className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
    );
  }

  // Graceful SVG Fallback
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none"
          style={{ backgroundColor: currentGlow }}
        />
      )}
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <polygon points="50,15 85,35 85,75 50,90 15,75 15,35" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="2" />
        <polygon points="50,15 85,35 50,55 15,35" fill="#38bdf8" opacity="0.6" />
        <polygon points="15,35 50,55 50,90 15,75" fill="#0284c7" opacity="0.8" />
        <polygon points="85,35 50,55 50,90 85,75" fill="#0369a1" opacity="0.9" />
      </svg>
    </div>
  );
};
