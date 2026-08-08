import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';
import { Custom3DHeroArtwork } from './Custom3DHeroArtwork.js';

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

      {/* 3D Clay Artwork Canvas */}
      <Custom3DHeroArtwork />

    </div>
  );
};
