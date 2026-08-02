import React, { useState } from 'react';
import { Modal } from './Modal.js';
import { useTheme } from '../../hooks/useTheme.js';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks?: string) => Promise<void> | void;
  title: string;
  description: string;
  confirmType?: 'approve' | 'reject' | 'danger';
  confirmText?: string;
  showRemarksInput?: boolean;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmType = 'approve',
  confirmText,
  showRemarksInput = false,
  isLoading = false
}) => {
  const { isDark } = useTheme();
  const [remarks, setRemarks] = useState('');

  const handleConfirm = async () => {
    await onConfirm(remarks);
    setRemarks('');
  };

  const getButtonStyles = () => {
    switch (confirmType) {
      case 'approve':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white';
      case 'reject':
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-500 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-500 text-white';
    }
  };

  const getIcon = () => {
    switch (confirmType) {
      case 'approve':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'reject':
        return <XCircle className="w-6 h-6 text-rose-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
            isDark ? 'bg-[#282522] border-[#36322E]' : 'bg-[#F2ECE1] border-[#E2DBD0]'
          }`}>
            {getIcon()}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{title}</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{description}</p>
          </div>
        </div>

        {showRemarksInput && (
          <div className="mt-4">
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
              Manager Remarks <span className={`font-normal ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>(Optional)</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter your remarks"
              rows={3}
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-colors resize-none border ${
                isDark
                  ? 'bg-[#171615] border-[#36322E] text-stone-100 placeholder-stone-500 focus:border-blue-500'
                  : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-900 placeholder-stone-400 focus:bg-[#FFFDF9] focus:border-blue-500'
              }`}
            />
          </div>
        )}

        <div className={`flex items-center justify-end space-x-3 pt-4 border-t ${
          isDark ? 'border-[#36322E]' : 'border-[#E8E2D8]'
        }`}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 ${
              isDark
                ? 'text-stone-400 hover:text-stone-200 hover:bg-[#282522]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#F2ECE1]'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center space-x-2 ${getButtonStyles()}`}
          >
            {isLoading && (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{confirmText || (confirmType === 'approve' ? 'Approve' : confirmType === 'reject' ? 'Reject' : 'Confirm')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
