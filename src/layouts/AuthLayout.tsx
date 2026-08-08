import React from 'react';
import { Calendar, Sun, Moon } from 'lucide-react';
import { EnterpriseHeroIllustration } from '../components/auth/EnterpriseHeroIllustration.js';
import { ZollidLogo } from '../components/common/ZollidLogo.js';
import { useTheme } from '../hooks/useTheme.js';

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  isRegister?: boolean;
}

export const AuthLayout: React.FC<Props> = ({ children, title, subtitle, badge, isRegister = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen w-full py-3 sm:py-5 lg:py-6 overflow-y-auto overflow-x-hidden relative font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white transition-colors duration-300 ${
      isDark 
        ? 'bg-[#1F1D1B] text-stone-100' 
        : 'bg-[#EAE4D8] text-[#111827]'
    }`}>
      
      {/* Subtle Grid Backdrop for Canvas Texture */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isDark ? 'opacity-[0.08]' : 'opacity-[0.25]'
        }`}
        style={{
          backgroundImage: `radial-gradient(${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(100, 90, 80, 0.2)'} 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Navbar / Header Bar */}
      <header className="relative z-20 w-full max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-10 pt-3 sm:pt-4 pb-1.5 flex items-center justify-between shrink-0">
        <div className="flex flex-col items-center space-y-1">
          {/* Official ZOLLID Logo */}
          <ZollidLogo className="h-9 sm:h-11" />
          
          {/* Below logo: Employee Leave Management System */}
          <p className={`text-xs sm:text-sm font-bold tracking-tight text-center transition-colors duration-300 ${
            isDark ? 'text-stone-300' : 'text-stone-800'
          }`}>
            Employee Leave Management System
          </p>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Theme Toggle Button (Icon-Only) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-300 active:scale-95 shadow-sm flex items-center justify-center relative overflow-hidden group ${
              isDark
                ? 'bg-[#242220] hover:bg-[#2C2926] border-[#3E3A35] text-amber-400'
                : 'bg-white hover:bg-stone-50 border-[#D6CFC2] text-indigo-600'
            }`}
          >
            <div className="relative w-4 h-4 flex items-center justify-center">
              <Sun
                className={`w-4 h-4 text-amber-400 absolute transition-all duration-300 transform ${
                  isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                }`}
              />
              <Moon
                className={`w-4 h-4 text-indigo-600 absolute transition-all duration-300 transform ${
                  isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Area: Large Floating Workspace Container Centered with Generous Margins */}
      <main className="relative z-10 w-full max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-5 my-auto flex-1 flex items-center justify-center min-h-0">
        
        {/* Floating Workspace Layout Box */}
        <div className={`w-full h-auto min-h-fit rounded-2xl sm:rounded-3xl border p-6 sm:p-8 lg:p-10 xl:p-12 transition-colors duration-200 relative flex flex-col justify-center ${
          isDark
            ? 'bg-[#292623] border-[#3D3833] shadow-[0_16px_48px_rgba(0,0,0,0.35)]'
            : 'bg-[#FFFFFF] border-[#CEC5B5] shadow-[0_12px_40px_rgba(0,0,0,0.06),0_2px_10px_rgba(0,0,0,0.03)]'
        }`}>

          {/* Workspace Grid Layout: Left ~58% (7 cols) / Right ~42% (5 cols) */}
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-center">
            
            {/* LEFT SIDE (~58% / lg:col-span-7) - Product Title, Short Description, Whitespace, Large Hero Illustration */}
            <div className="hidden lg:flex lg:col-span-7 flex-col justify-between h-full min-h-0">
              <EnterpriseHeroIllustration />
            </div>

            {/* RIGHT SIDE (~42% / lg:col-span-5) - Floating Form Card */}
            <div className="w-full lg:col-span-5 flex justify-center lg:justify-end">
              <div className={`w-full max-w-[500px] rounded-2xl p-6 sm:p-8 lg:p-9 border transition-colors duration-200 relative ${
                isDark
                  ? 'bg-[#22201D] border-[#3D3833] shadow-sm'
                  : 'bg-[#FAF8F5] border-[#E0D9CB] shadow-sm'
              }`}>
                
                {/* Form Header at Top of Floating Card */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="flex flex-col items-center">
                    <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                      isDark ? 'text-stone-100' : 'text-stone-900'
                    }`}>
                      {title}
                    </h2>
                    <div className="w-8 h-0.5 rounded-full bg-blue-600/80 mt-2 mb-1.5" />
                    <p className={`text-xs sm:text-sm font-medium leading-relaxed ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}>
                      {subtitle}
                    </p>
                  </div>
                </div>

                {/* Form Children */}
                {children}

              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};
