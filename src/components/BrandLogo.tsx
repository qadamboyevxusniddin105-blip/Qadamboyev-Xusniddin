import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showBackground = true,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-11 sm:h-11',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 select-none ${sizeClasses[size]} ${className}`}
    >
      {/* Dark Cyber/Matrix-Themed Card Container */}
      <div
        className={`w-full h-full rounded-xl overflow-hidden relative flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${
          showBackground
            ? 'bg-[#090d14] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,242,254,0.18)]'
            : ''
        }`}
      >
        {/* Subtle Matrix Glow in Background */}
        {showBackground && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/20 via-blue-600/10 to-transparent pointer-events-none" />
        )}

        {/* Vector SVG Emblem faithfully replicating the user's uploaded logo */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full p-1 relative z-10 drop-shadow-[0_2px_8px_rgba(0,242,254,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Linear Gradient for Left and Bottom Ribbon (Electric Cyan to Royal Blue) */}
            <linearGradient id="cyberLoopGrad" x1="15%" y1="15%" x2="65%" y2="85%">
              <stop offset="0%" stopColor="#4df6fe" />
              <stop offset="35%" stopColor="#00d2ff" />
              <stop offset="70%" stopColor="#0072ff" />
              <stop offset="100%" stopColor="#004cd8" />
            </linearGradient>

            {/* Linear Gradient for Sharp Top Roof Spike (Mint to Cyan) */}
            <linearGradient id="cyberSpikeGrad" x1="10%" y1="0%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#e0fff9" />
              <stop offset="25%" stopColor="#3bf0e4" />
              <stop offset="60%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#00b0ff" />
            </linearGradient>

            {/* Inner Bridge Accent Gradient */}
            <linearGradient id="cyberInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#0052d4" />
            </linearGradient>
          </defs>

          {/* Left Ribbon & Bottom Loop */}
          <path
            d="M 182 78
               L 76 184
               C 70 190, 70 200, 76 206
               L 158 288
               C 164 294, 174 294, 180 288
               L 242 226
               L 198 182
               L 168 212
               C 164 216, 158 216, 154 212
               L 126 184
               L 182 128
               Z"
            fill="url(#cyberLoopGrad)"
          />

          {/* Top Roof & Extended Needle-Sharp Spike (Xusniddin Webcraft Roof) */}
          <path
            d="M 182 78
               L 214 80
               L 348 198
               L 246 144
               L 212 118
               L 182 78
               Z"
            fill="url(#cyberSpikeGrad)"
          />

          {/* Inner Geometric Diagonal Facet */}
          <path
            d="M 212 118
               L 246 144
               L 188 202
               L 156 170
               Z"
            fill="url(#cyberInnerGrad)"
            opacity="0.9"
          />
        </svg>
      </div>
    </div>
  );
};
