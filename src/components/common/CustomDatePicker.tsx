import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw
} from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (dateStr: string) => void;
  placeholder?: string;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  align?: 'left' | 'right';
  id?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  hasError = false,
  disabled = false,
  className = '',
  align = 'left',
  id
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or default to today
  const parsedValueDate = value ? new Date(value + 'T00:00:00') : null;
  const initialYear = parsedValueDate && !isNaN(parsedValueDate.getTime())
    ? parsedValueDate.getFullYear()
    : new Date().getFullYear();
  const initialMonth = parsedValueDate && !isNaN(parsedValueDate.getTime())
    ? parsedValueDate.getMonth()
    : new Date().getMonth();

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  // Synchronize view month/year when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Month navigation helpers
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Date formatting helpers
  const formatYYYYMMDD = (year: number, month: number, day: number): string => {
    const yStr = year.toString();
    const mStr = (month + 1).toString().padStart(2, '0');
    const dStr = day.toString().padStart(2, '0');
    return `${yStr}-${mStr}-${dStr}`;
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  };

  // Date grid calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const daysInCurrentMonth = getDaysInMonth(viewYear, viewMonth);
  const daysInPrevMonth = getDaysInMonth(viewYear, viewMonth - 1);

  // Construct 42-day calendar grid
  const calendarDays: Array<{
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
  }> = [];

  const todayStr = formatYYYYMMDD(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );

  // Previous Month Padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dayNum = daysInPrevMonth - i;
    const dateStr = formatYYYYMMDD(prevYear, prevMonth, dayNum);

    const isDisabled =
      (!!minDate && dateStr < minDate) || (!!maxDate && dateStr > maxDate);

    calendarDays.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === value,
      isDisabled
    });
  }

  // Current Month Days
  for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
    const dateStr = formatYYYYMMDD(viewYear, viewMonth, dayNum);
    const isDisabled =
      (!!minDate && dateStr < minDate) || (!!maxDate && dateStr > maxDate);

    calendarDays.push({
      dateStr,
      dayNum,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: dateStr === value,
      isDisabled
    });
  }

  // Next Month Padding
  const remainingCells = 42 - calendarDays.length;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const dateStr = formatYYYYMMDD(nextYear, nextMonth, dayNum);
    const isDisabled =
      (!!minDate && dateStr < minDate) || (!!maxDate && dateStr > maxDate);

    calendarDays.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === value,
      isDisabled
    });
  }

  const handleSelectDate = (dateStr: string, isDisabled: boolean) => {
    if (isDisabled || disabled) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const tStr = formatYYYYMMDD(now.getFullYear(), now.getMonth(), now.getDate());
    if ((minDate && tStr < minDate) || (maxDate && tStr > maxDate)) return;
    onChange(tStr);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setIsOpen(false);
  };

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Year choices for quick selection dropdown
  const currentActualYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentActualYear - 2 + i);

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`} id={id}>
      {/* Trigger Button / Input Bar */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          hasError
            ? 'border-rose-500/80 bg-rose-500/5 text-rose-500'
            : isOpen
            ? isDark
              ? 'border-blue-500 bg-[#292623] text-stone-100 ring-2 ring-blue-500/20'
              : 'border-blue-500 bg-white text-stone-900 ring-2 ring-blue-500/20 shadow-sm'
            : isDark
            ? 'bg-[#22201D] border-[#3D3833] text-stone-100 hover:border-stone-500'
            : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-900 hover:border-stone-400 hover:bg-[#FFFDF9]'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <CalendarIcon
            className={`w-4 h-4 shrink-0 transition-colors ${
              hasError
                ? 'text-rose-500'
                : isOpen
                ? 'text-blue-500'
                : value
                ? isDark
                  ? 'text-blue-400'
                  : 'text-blue-600'
                : isDark
                ? 'text-stone-400'
                : 'text-stone-500'
            }`}
          />
          <span className={`truncate font-medium ${!value ? (isDark ? 'text-stone-500' : 'text-stone-400') : ''}`}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center space-x-1 shrink-0 ml-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClearDate}
              title="Clear date"
              className={`p-1 rounded-lg transition-colors hover:bg-rose-500/10 hover:text-rose-500 ${
                isDark ? 'text-stone-400' : 'text-stone-400'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Modern Calendar Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 z-50 w-72 sm:w-80 rounded-2xl shadow-2xl border p-4 transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            isDark
              ? 'bg-[#292623] border-[#3D3833] text-stone-100 shadow-black/60'
              : 'bg-white border-[#E2DBD0] text-stone-900 shadow-stone-300/50'
          }`}
        >
          {/* Header Navigation */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-inherit">
            <button
              type="button"
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                isDark
                  ? 'text-stone-300 hover:text-white hover:bg-[#2D2A26] border-[#383430]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border-stone-200'
              }`}
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month & Year Selectors */}
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-extrabold tracking-tight">
                {MONTH_NAMES[viewMonth]}
              </span>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className={`text-xs font-bold rounded-lg px-1.5 py-0.5 cursor-pointer outline-none transition-colors border ${
                  isDark
                    ? 'bg-[#282522] border-[#383430] text-stone-200 hover:bg-[#33302C]'
                    : 'bg-stone-100 border-stone-200 text-stone-800 hover:bg-stone-200'
                }`}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className={`p-1.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                isDark
                  ? 'text-stone-300 hover:text-white hover:bg-[#2D2A26] border-[#383430]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border-stone-200'
              }`}
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAY_NAMES.map((wd) => (
              <span
                key={wd}
                className={`text-[11px] font-bold uppercase tracking-wider py-0.5 ${
                  isDark ? 'text-stone-500' : 'text-stone-400'
                }`}
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {calendarDays.map((cell, idx) => {
              const { dayNum, isCurrentMonth, isToday, isSelected, isDisabled, dateStr } = cell;

              let cellStyle = 'text-stone-700 hover:bg-stone-100 hover:text-stone-900';
              if (isDark) {
                cellStyle = 'text-stone-300 hover:bg-[#2D2A26] hover:text-white';
              }

              if (!isCurrentMonth) {
                cellStyle = isDark
                  ? 'text-stone-600/50 hover:bg-[#242220] hover:text-stone-400'
                  : 'text-stone-300 hover:bg-stone-50 hover:text-stone-600';
              }

              if (isDisabled) {
                cellStyle = isDark
                  ? 'text-stone-700/40 cursor-not-allowed opacity-40 line-through'
                  : 'text-stone-300 cursor-not-allowed opacity-40 line-through';
              }

              if (isSelected) {
                cellStyle =
                  'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20 scale-105 rounded-xl';
              } else if (isToday) {
                cellStyle += isDark
                  ? ' font-extrabold text-blue-400 ring-1 ring-blue-500/50 bg-blue-500/10'
                  : ' font-extrabold text-blue-600 ring-1 ring-blue-500/50 bg-blue-500/10';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDate(dateStr, isDisabled)}
                  className={`h-8 w-8 sm:h-9 sm:w-9 mx-auto rounded-xl flex items-center justify-center text-xs font-semibold transition-all duration-150 cursor-pointer ${cellStyle}`}
                  title={dateStr}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="flex items-center justify-between pt-2.5 border-t border-inherit text-[11px] font-semibold">
            <button
              type="button"
              onClick={handleSelectToday}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-blue-400 hover:bg-blue-500/15'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Today</span>
            </button>

            {value ? (
              <span className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Selected: <strong className={isDark ? 'text-stone-200' : 'text-stone-800'}>{formatDisplayDate(value)}</strong>
              </span>
            ) : (
              <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                No date selected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
