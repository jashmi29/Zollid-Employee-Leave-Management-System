import React from 'react';
import { LeaveStatus } from '../../types.js';
import { Clock, CheckCircle2, XCircle, Edit3 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';

interface Props {
  status: LeaveStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LeaveStatusBadge: React.FC<Props> = ({ status, showIcon = true, size = 'md' }) => {
  const { isDark } = useTheme();

  let badgeStyle = '';
  let dotColor = '';
  let Icon = Clock;

  switch (status) {
    case 'Approved':
      badgeStyle = isDark
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-950/20'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      dotColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]';
      Icon = CheckCircle2;
      break;
    case 'Partially Approved':
      badgeStyle = isDark
        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-950/20'
        : 'bg-blue-50 text-blue-700 border-blue-200/80';
      dotColor = 'bg-blue-500 shadow-[0_0_8px_rgba(96,165,250,0.6)]';
      Icon = Edit3;
      break;
    case 'Rejected':
      badgeStyle = isDark
        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-950/20'
        : 'bg-rose-50 text-rose-700 border-rose-200/80';
      dotColor = 'bg-rose-500 shadow-[0_0_8px_rgba(251,113,133,0.6)]';
      Icon = XCircle;
      break;
    case 'Pending':
    default:
      badgeStyle = isDark
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-950/20'
        : 'bg-amber-50 text-amber-800 border-amber-200/80';
      dotColor = 'bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse';
      Icon = Clock;
      break;
  }

  const sizeClasses = {
    sm: 'text-[10px] font-semibold px-2 py-0.5 space-x-1.5 rounded-md',
    md: 'text-xs font-semibold px-2.5 py-1 space-x-1.5 rounded-lg',
    lg: 'text-xs font-bold px-3 py-1.5 space-x-2 rounded-xl'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-lg border tracking-wide whitespace-nowrap transition-all duration-200 ${badgeStyle} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{status}</span>
    </span>
  );
};

