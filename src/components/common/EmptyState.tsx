import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';

interface Props {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({
  title = 'No records found',
  description = 'There are currently no items matching your criteria or search filters.',
  icon: Icon = Inbox,
  action
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center border rounded-2xl ${
      isDark
        ? 'bg-[#201E1C] border-[#3F3B37]'
        : 'bg-[#FAF7F2] border-[#E2DBD0]'
    }`}>
      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 shadow-xl ${
        isDark
          ? 'bg-[#282522] border-[#3F3B37] text-stone-400'
          : 'bg-[#F2ECE1] border-[#E2DBD0] text-stone-600'
      }`}>
        <Icon className="w-7 h-7 text-blue-500" />
      </div>
      <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>{title}</h3>
      <p className={`text-xs max-w-sm mb-5 leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

