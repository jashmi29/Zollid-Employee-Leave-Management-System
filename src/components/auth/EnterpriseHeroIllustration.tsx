import React from 'react';
import { Sparkles, Calendar, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';

export const EnterpriseHeroIllustration: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="w-full flex flex-col justify-between h-full space-y-4 lg:space-y-6 select-none py-1">
      
      {/* Product Title & Short Description */}
      <div className="space-y-3.5 lg:space-y-4 max-w-2xl">
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border text-xs font-semibold tracking-wide transition-colors duration-200 ${
          isDark 
            ? 'bg-[#1C1A18] border-[#38342E] text-stone-200' 
            : 'bg-[#FAF8F5] border-[#DECFC0] text-stone-800'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Enterprise Leave Workspace</span>
        </div>

        <h1 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-black tracking-tight leading-[1.1] transition-colors duration-200 ${
          isDark ? 'text-stone-100' : 'text-stone-900'
        }`}>
          Manage Employee Leave,{' '}
          <span className="text-blue-600 dark:text-blue-400 inline-block">
            Effortlessly.
          </span>
        </h1>

        <p className={`text-xs sm:text-sm lg:text-base font-medium leading-relaxed max-w-xl transition-colors duration-200 ${
          isDark ? 'text-stone-400' : 'text-stone-600'
        }`}>
          A secure and intelligent leave management platform that simplifies employee requests, manager approvals, and workforce planning.
        </p>
      </div>

      {/* Hero Illustration Canvas Placeholder */}
      <div className={`relative w-full flex-1 min-h-[220px] max-h-[380px] aspect-[16/10] rounded-2xl border flex flex-col items-center justify-center p-6 sm:p-8 transition-all duration-200 overflow-hidden ${
        isDark
          ? 'bg-[#1C1A18] border-[#36322D]'
          : 'bg-[#FAF8F5] border-[#E0D9CB]'
      }`}>

        {/* Minimal Grid Pattern */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            isDark ? 'opacity-[0.1]' : 'opacity-[0.2]'
          }`}
          style={{
            backgroundImage: `radial-gradient(${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(100, 90, 80, 0.2)'} 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Central Clean Artwork Badge */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-3 max-w-sm">
          <div className="w-13 h-13 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Calendar className="w-6 h-6" />
          </div>
          
          <div className="space-y-1">
            <span className={`inline-flex items-center space-x-2 text-xs font-bold px-3 py-1 rounded-lg border ${
              isDark
                ? 'text-stone-200 bg-[#242220] border-[#3A3631]'
                : 'text-stone-800 bg-white border-[#DCD5C8]'
            }`}>
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Hero Illustration Canvas</span>
            </span>
            <p className={`text-xs font-medium ${
              isDark ? 'text-stone-400' : 'text-stone-600'
            }`}>
              Placeholder area for custom 3D artwork or brand graphics
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
