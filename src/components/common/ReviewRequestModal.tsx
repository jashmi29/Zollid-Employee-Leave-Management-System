import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LeaveRequest, LeaveStatus } from '../../types.js';
import { useTheme } from '../../hooks/useTheme.js';
import {
  X,
  CheckCircle2,
  Edit3,
  XCircle,
  Calendar,
  FileText,
  User,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { LeaveStatusBadge } from './LeaveStatusBadge.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
  onSubmit: (data: {
    id: number;
    status: LeaveStatus;
    remarks: string;
    approved_start_date?: string;
    approved_end_date?: string;
  }) => Promise<void>;
}

type Mode = 'approve' | 'edit' | 'reject';

export const ReviewRequestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  request,
  onSubmit
}) => {
  const { isDark } = useTheme();
  const [mode, setMode] = useState<Mode>('approve');
  const [approvedStartDate, setApprovedStartDate] = useState('');
  const [approvedEndDate, setApprovedEndDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (request) {
      setMode('approve');
      setApprovedStartDate(request.approved_start_date || request.start_date);
      setApprovedEndDate(request.approved_end_date || request.end_date);
      setRemarks(request.remarks || '');
      setErrorMsg('');
    }
  }, [request, isOpen]);

  if (!isOpen || !request) return null;

  // Calculate days helper
  const calculateDays = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    const diff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const requestedDays = calculateDays(request.start_date, request.end_date);
  const approvedDays = calculateDays(approvedStartDate, approvedEndDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'edit') {
      if (!approvedStartDate || !approvedEndDate) {
        setErrorMsg('Please specify both approved start date and end date.');
        return;
      }

      if (approvedStartDate < request.start_date || approvedEndDate > request.end_date) {
        setErrorMsg(`Approved dates must be within requested range (${request.start_date} to ${request.end_date}).`);
        return;
      }

      if (approvedEndDate < approvedStartDate) {
        setErrorMsg('Approved end date cannot be earlier than start date.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let finalStatus: LeaveStatus = 'Approved';
      let finalStart: string | undefined = undefined;
      let finalEnd: string | undefined = undefined;

      if (mode === 'approve') {
        finalStatus = 'Approved';
        finalStart = request.start_date;
        finalEnd = request.end_date;
      } else if (mode === 'edit') {
        finalStatus = 'Partially Approved';
        finalStart = approvedStartDate;
        finalEnd = approvedEndDate;
      } else if (mode === 'reject') {
        finalStatus = 'Rejected';
      }

      await onSubmit({
        id: request.id,
        status: finalStatus,
        remarks: remarks.trim(),
        approved_start_date: finalStart,
        approved_end_date: finalEnd
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update leave request status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${
          isDark ? 'bg-black/75' : 'bg-stone-900/40'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
            isDark
              ? 'bg-[#292623] border-[#3D3833] text-stone-100'
              : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-2xl'
          }`}
        >
          {/* Modal Header */}
          <div
            className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'border-[#3D3833] bg-[#22201D]' : 'border-[#E8E2D8] bg-[#F8F4EC]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  Review Leave Request
                </h3>
                <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  Request #{request.id} • Submitted {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'text-stone-400 hover:text-stone-200 hover:bg-[#33302C]'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-[#EAE2D3]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Employee Info & Original Request Summary Card */}
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#F5F0E6]/70 border-[#E2DBD0]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {(request.employee_name || request.employee_username || 'E').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                      {request.employee_name || request.employee_username || 'Employee'}
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                      {request.employee_email || `@${request.employee_username}`}
                    </p>
                  </div>
                </div>
                <LeaveStatusBadge status={request.status} />
              </div>

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t text-xs ${
                  isDark ? 'border-[#3D3833]' : 'border-[#E2DBD0]'
                }`}
              >
                <div>
                  <span className={`block mb-0.5 font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                    Requested Period:
                  </span>
                  <div className={`flex items-center space-x-1.5 font-semibold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>{request.start_date}</span>
                    <ArrowRight className={`w-3 h-3 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
                    <span>{request.end_date}</span>
                  </div>
                </div>
                <div>
                  <span className={`block mb-0.5 font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                    Requested Duration:
                  </span>
                  <div className={`flex items-center space-x-1.5 font-semibold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{requestedDays} Day{requestedDays > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className={`block text-xs mb-1 font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Leave Reason:
                </span>
                <p
                  className={`text-xs italic p-2.5 rounded-lg border ${
                    isDark
                      ? 'bg-[#191816] text-stone-300 border-[#33302C]'
                      : 'bg-[#FCFAF7] text-stone-800 border-[#E2DBD0]'
                  }`}
                >
                  "{request.leave_reason}"
                </p>
              </div>

              {request.document_url && (
                <div className="pt-1">
                  <a
                    href={request.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-blue-500 hover:text-blue-600 font-semibold hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Supporting Document Attachment</span>
                  </a>
                </div>
              )}
            </div>

            {/* Decision Mode Selector (3 Options) */}
            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-stone-300' : 'text-stone-700'
                }`}
              >
                Manager Decision Action
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setMode('approve')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    mode === 'approve'
                      ? isDark
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-lg'
                        : 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                      : isDark
                      ? 'bg-[#22201D] border-[#3D3833] text-stone-400 hover:border-[#4D4740] hover:text-stone-200'
                      : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-600 hover:border-stone-300 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className={`w-4 h-4 ${mode === 'approve' ? 'text-emerald-500' : 'text-stone-400'}`} />
                    {mode === 'approve' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    )}
                  </div>
                  <div>
                    <span className={`block text-xs font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                      Approve as Requested
                    </span>
                    <span className={`text-[11px] leading-tight block mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                      Grant all {requestedDays} days requested
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    mode === 'edit'
                      ? isDark
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-300 shadow-lg'
                        : 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                      : isDark
                      ? 'bg-[#22201D] border-[#3D3833] text-stone-400 hover:border-[#4D4740] hover:text-stone-200'
                      : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-600 hover:border-stone-300 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Edit3 className={`w-4 h-4 ${mode === 'edit' ? 'text-blue-500' : 'text-stone-400'}`} />
                    {mode === 'edit' && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                    )}
                  </div>
                  <div>
                    <span className={`block text-xs font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                      Edit Duration & Approve
                    </span>
                    <span className={`text-[11px] leading-tight block mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                      Approve modified date range
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('reject')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    mode === 'reject'
                      ? isDark
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-300 shadow-lg'
                        : 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm'
                      : isDark
                      ? 'bg-[#22201D] border-[#3D3833] text-stone-400 hover:border-[#4D4740] hover:text-stone-200'
                      : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-600 hover:border-stone-300 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <XCircle className={`w-4 h-4 ${mode === 'reject' ? 'text-rose-500' : 'text-stone-400'}`} />
                    {mode === 'reject' && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(251,113,133,0.8)]" />
                    )}
                  </div>
                  <div>
                    <span className={`block text-xs font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                      Reject Request
                    </span>
                    <span className={`text-[11px] leading-tight block mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                      Decline leave for employee
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Mode-Specific Content Form */}
            {mode === 'edit' && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border space-y-4 ${
                  isDark ? 'bg-blue-950/20 border-blue-500/30' : 'bg-blue-50/80 border-blue-200'
                }`}
              >
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-500">
                  <Edit3 className="w-4 h-4" />
                  <span>Modify Approved Date Range</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Select approved start and end dates within employee's requested window ({request.start_date} to {request.end_date}).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                      Approved Start Date
                    </label>
                    <input
                      type="date"
                      min={request.start_date}
                      max={request.end_date}
                      value={approvedStartDate}
                      onChange={(e) => setApprovedStartDate(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        isDark
                          ? 'bg-[#22201D] border-[#3D3833] text-stone-100'
                          : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-900 focus:bg-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                      Approved End Date
                    </label>
                    <input
                      type="date"
                      min={approvedStartDate || request.start_date}
                      max={request.end_date}
                      value={approvedEndDate}
                      onChange={(e) => setApprovedEndDate(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        isDark
                          ? 'bg-[#22201D] border-[#3D3833] text-stone-100'
                          : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-900 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Recalculated Duration Banner */}
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                    isDark
                      ? 'bg-[#191816] border-[#3D3833]'
                      : 'bg-[#FCFAF7] border-[#E2DBD0]'
                  }`}
                >
                  <div className={isDark ? 'text-stone-400' : 'text-stone-600'}>
                    Calculated Approved Duration:
                  </div>
                  <div className="font-bold flex items-center space-x-2">
                    <span className={`line-through ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{requestedDays} Days</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-blue-500 text-sm">{approvedDays} Day{approvedDays !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Manager Remarks Input */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                Manager Remarks <span className={isDark ? 'text-stone-500' : 'text-stone-400'}>(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={
                  mode === 'edit'
                    ? 'Explain the reason for modifying approved duration...'
                    : mode === 'reject'
                    ? 'Specify reason for declining request...'
                    : 'Add optional approval notes for employee...'
                }
                className={`w-full px-3 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-colors ${
                  isDark
                    ? 'bg-[#22201D] border-[#3D3833] text-stone-100 placeholder-stone-500'
                    : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-900 placeholder-stone-400 focus:bg-white'
                }`}
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div
            className={`px-6 py-4 border-t flex items-center justify-end space-x-3 ${
              isDark ? 'border-[#3D3833] bg-[#22201D]' : 'border-[#E8E2D8] bg-[#F8F4EC]'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                isDark
                  ? 'text-stone-400 hover:text-stone-200 hover:bg-[#33302C]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#EAE2D3]'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center space-x-2 ${
                mode === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : mode === 'edit'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : (
                <>
                  {mode === 'approve' && <CheckCircle2 className="w-4 h-4" />}
                  {mode === 'edit' && <Edit3 className="w-4 h-4" />}
                  {mode === 'reject' && <XCircle className="w-4 h-4" />}
                  <span>
                    {mode === 'approve'
                      ? 'Approve Full Request'
                      : mode === 'edit'
                      ? 'Approve Modified Duration'
                      : 'Reject Leave Request'}
                  </span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
