import React from 'react';

interface ZollidLogoProps {
  className?: string;
  height?: number | string;
  showTagline?: boolean;
  iconOnly?: boolean;
}

export const ZollidLogo: React.FC<ZollidLogoProps> = ({
  className = 'h-9 sm:h-10 w-auto',
  height,
  showTagline = true,
  iconOnly = false
}) => {
  if (iconOnly) {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        <svg
          viewBox="0 0 88 85"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-auto h-7 sm:h-8"
          style={{ height: height || undefined }}
        >
          <defs>
            <linearGradient id="zollid-green-icon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8AC93E" />
              <stop offset="100%" stopColor="#78B833" />
            </linearGradient>
          </defs>
          <path fill="url(#zollid-green-icon)" d="M 12 18 C 12 12, 18 12, 28 12 L 62 12 C 72 12, 74 15, 62 30 L 32 64 L 66 64 C 74 64, 76 68, 76 74 C 76 80, 70 80, 60 80 L 18 80 C 10 80, 8 76, 20 62 L 50 28 L 22 28 C 14 28, 12 24, 12 18 Z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 405 85"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-auto shrink-0 ${showTagline ? 'h-7 sm:h-8' : 'h-full'}`}
        style={{ height: height || undefined }}
      >
        {/* Brand Green Color: #82C341 */}
        <defs>
          <linearGradient id="zollid-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8AC93E" />
            <stop offset="100%" stopColor="#78B833" />
          </linearGradient>
        </defs>

        <g fill="url(#zollid-green)">
          {/* Z */}
          <path d="M 12 18 C 12 12, 18 12, 28 12 L 62 12 C 72 12, 74 15, 62 30 L 32 64 L 66 64 C 74 64, 76 68, 76 74 C 76 80, 70 80, 60 80 L 18 80 C 10 80, 8 76, 20 62 L 50 28 L 22 28 C 14 28, 12 24, 12 18 Z" />

          {/* O */}
          <path d="M 86 12 L 126 12 C 140 12, 146 18, 146 46 C 146 74, 140 80, 126 80 L 86 80 C 72 80, 66 74, 66 46 C 66 18, 72 12, 86 12 Z M 96 28 L 116 28 C 124 28, 128 32, 128 46 C 128 60, 124 64, 116 64 L 96 64 C 88 64, 84 60, 84 46 C 84 32, 88 28, 96 28 Z" />

          {/* L1 */}
          <path d="M 154 12 L 172 12 C 176 12, 178 14, 178 18 L 178 64 L 204 64 C 210 64, 214 68, 214 74 C 214 80, 208 80, 198 80 L 162 80 C 156 80, 154 76, 154 68 L 154 18 C 154 14, 154 12, 154 12 Z" />

          {/* L2 */}
          <path d="M 222 12 L 240 12 C 244 12, 246 14, 246 18 L 246 64 L 272 64 C 278 64, 282 68, 282 74 C 282 80, 276 80, 266 80 L 230 80 C 224 80, 222 76, 222 68 L 222 18 C 222 14, 222 12, 222 12 Z" />

          {/* I */}
          <path d="M 290 12 L 306 12 C 310 12, 312 14, 312 18 L 312 74 C 312 78, 310 80, 306 80 L 290 80 C 286 80, 284 78, 284 74 L 284 18 C 284 14, 286 12, 290 12 Z" />

          {/* D */}
          <path d="M 320 12 L 348 12 C 368 12, 378 22, 378 46 C 378 70, 368 80, 348 80 L 320 80 C 316 80, 314 78, 314 74 L 314 18 C 314 14, 316 12, 320 12 Z M 338 28 L 344 28 C 354 28, 360 34, 360 46 C 360 58, 354 64, 344 64 L 338 64 L 338 28 Z" />

          {/* Registered Trademark ® */}
          <g transform="translate(382, 10) scale(0.75)">
            <circle cx="10" cy="10" r="9" stroke="url(#zollid-green)" strokeWidth="2" fill="none" />
            <text x="10" y="13.5" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle" fill="url(#zollid-green)">R</text>
          </g>
        </g>
      </svg>

      {/* Subtitle: IMAGINE | INVENT | INNOVATE */}
      {showTagline && (
        <div className="flex items-center space-x-1.5 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase pt-0.5">
          <span>IMAGINE</span>
          <span className="text-[#82C341] font-extrabold">|</span>
          <span>INVENT</span>
          <span className="text-[#82C341] font-extrabold">|</span>
          <span>INNOVATE</span>
        </div>
      )}
    </div>
  );
};
