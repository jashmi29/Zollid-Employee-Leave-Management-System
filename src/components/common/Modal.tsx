import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../hooks/useTheme.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}) => {
  const { isDark } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 backdrop-blur-md ${
              isDark ? 'bg-[#181614]/80' : 'bg-slate-900/40'
            }`}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', duration: 0.25 }}
            className={`relative w-full ${maxWidthClasses} rounded-2xl border shadow-2xl overflow-hidden z-10 my-8 transition-colors duration-300 ${
              isDark
                ? 'bg-[#292623] border-[#3D3833] text-stone-100'
                : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900'
            }`}
          >
            {/* Header */}
            {title && (
              <div className={`flex items-center justify-between px-6 py-4 border-b ${
                isDark ? 'border-[#3D3833] bg-[#22201D]' : 'border-[#E8E2D8] bg-[#F8F4EC]'
              }`}>
                <h3 className={`text-lg font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{title}</h3>
                <button
                  onClick={onClose}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark
                      ? 'text-stone-400 hover:text-stone-100 hover:bg-[#33302C]'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-[#F2ECE1]'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
