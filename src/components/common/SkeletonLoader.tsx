import React from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export const CardSkeleton: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <div className={`border rounded-2xl p-5 animate-pulse ${
      isDark ? 'bg-[#282522] border-[#3F3B37]' : 'bg-[#FCFAF7] border-[#E8E2D8]'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`h-4 w-28 rounded-md ${isDark ? 'bg-[#3F3B37]' : 'bg-[#EAE2D3]'}`} />
        <div className={`h-8 w-8 rounded-lg ${isDark ? 'bg-[#3F3B37]' : 'bg-[#EAE2D3]'}`} />
      </div>
      <div className={`h-8 w-16 rounded-lg mb-2 ${isDark ? 'bg-[#3F3B37]' : 'bg-[#EAE2D3]'}`} />
      <div className={`h-3 w-36 rounded-md ${isDark ? 'bg-[#302D2A]' : 'bg-[#F2ECE1]'}`} />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  const { isDark } = useTheme();
  return (
    <div className={`border rounded-2xl overflow-hidden animate-pulse ${
      isDark ? 'bg-[#282522] border-[#3F3B37]' : 'bg-[#FCFAF7] border-[#E8E2D8]'
    }`}>
      <div className={`p-4 border-b flex justify-between ${
        isDark ? 'bg-[#22201E] border-[#3F3B37]' : 'bg-[#F8F4EC] border-[#E8E2D8]'
      }`}>
        <div className={`h-4 w-32 rounded-md ${isDark ? 'bg-[#3F3B37]' : 'bg-[#EAE2D3]'}`} />
        <div className={`h-4 w-24 rounded-md ${isDark ? 'bg-[#3F3B37]' : 'bg-[#EAE2D3]'}`} />
      </div>
      <div className={`divide-y p-4 space-y-4 ${isDark ? 'divide-[#383430]' : 'divide-[#E8E2D8]'}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="space-y-2 flex-1 mr-4">
              <div className={`h-4 w-1/3 rounded-md ${isDark ? 'bg-[#3F3B37]' : 'bg-[#EAE2D3]'}`} />
              <div className={`h-3 w-1/2 rounded-md ${isDark ? 'bg-[#302D2A]' : 'bg-[#F2ECE1]'}`} />
            </div>
            <div className={`h-6 w-20 rounded-full ${isDark ? 'bg-[#3F3B37]' : 'bg-[#EAE2D3]'}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

