import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';
import { CustomDatePicker } from '../../components/common/CustomDatePicker.js';
import { leaveService } from '../../services/leaveService.js';
import { validateLeaveDates, validateFile, checkLeaveOverlap } from '../../utils/validators.js';
import { calculateDurationDays, formatDate } from '../../utils/formatters.js';
import { LeaveRequest } from '../../types.js';
import {
  FilePlus2,
  Calendar,
  FileText,
  Upload,
  AlertCircle,
  X,
  Send,
  Info,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Layers,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const LEAVE_TYPES = [
  { value: 'Annual', label: 'Annual Leave', description: 'Paid time off for vacation or personal rest' },
  { value: 'Sick', label: 'Sick Leave', description: 'Medical treatment, illness, or doctor appointments' },
  { value: 'Casual', label: 'Casual Leave', description: 'Short-notice personal tasks or family matters' },
  { value: 'Emergency', label: 'Emergency Leave', description: 'Unforeseen urgent events or family emergencies' },
  { value: 'Other', label: 'Other', description: 'Special circumstances, training, or jury duty' }
] as const;

export const ApplyLeave: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing user leaves for overlap checking
  const [existingLeaves, setExistingLeaves] = useState<LeaveRequest[]>([]);

  // Form State
  const [leaveType, setLeaveType] = useState<string>('Annual');
  const [leaveReason, setLeaveReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Validation & UI State
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLeave, setSubmittedLeave] = useState<LeaveRequest | null>(null);

  // Fetch existing leaves on mount
  useEffect(() => {
    const loadLeaves = async () => {
      try {
        const res = await leaveService.getMyLeaves();
        if (res.success) {
          setExistingLeaves(res.leaves);
        }
      } catch (err) {
        console.error('Failed to load existing leaves for validation:', err);
      }
    };
    loadLeaves();
  }, []);

  // Derived values & validations
  const durationDays = calculateDurationDays(startDate, endDate);

  // Date range error
  const dateRangeError = startDate && endDate ? validateLeaveDates(startDate, endDate) : null;

  // Date overlap error
  const overlapError =
    startDate && endDate && !dateRangeError
      ? checkLeaveOverlap(startDate, endDate, existingLeaves)
      : null;

  // Form validity boolean
  const isFormValid =
    !!leaveType &&
    !!leaveReason.trim() &&
    !!startDate &&
    !!endDate &&
    !dateRangeError &&
    !overlapError &&
    !fileError;

  const handleFileSelect = (selectedFile: File) => {
    const err = validateFile(selectedFile);
    if (err) {
      setFileError(err);
      toast.error(err);
      setFile(null);
    } else {
      setFileError(null);
      setFile(selectedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!leaveType) {
      setError('Please select a leave type.');
      return;
    }

    if (!leaveReason.trim()) {
      setError('Please provide a detailed leave reason.');
      return;
    }

    const dateErr = validateLeaveDates(startDate, endDate);
    if (dateErr) {
      setError(dateErr);
      return;
    }

    if (overlapError) {
      setError(overlapError);
      return;
    }

    if (file) {
      const fErr = validateFile(file);
      if (fErr) {
        setError(fErr);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const fullReason = `[${leaveType}] ${leaveReason.trim()}`;

      const formData = new FormData();
      formData.append('leave_reason', fullReason);
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
      if (file) {
        formData.append('document', file);
      }

      const res = await leaveService.applyLeave(formData);
      if (res.success && res.leave) {
        toast.success('Leave request submitted successfully!');
        setSubmittedLeave(res.leave);
      } else {
        setError(res.message || 'Failed to submit leave request.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error submitting leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedLeave(null);
    setLeaveType('Annual');
    setLeaveReason('');
    setStartDate('');
    setEndDate('');
    setFile(null);
    setFileError(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render Success Confirmation View
  if (submittedLeave) {
    return (
      <div className="max-w-2xl mx-auto my-8">
        <div
          className={`border rounded-2xl p-6 sm:p-8 shadow-2xl transition-all ${
            isDark ? 'bg-[#292623] border-[#3D3833] text-stone-100' : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-sm'
          }`}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-black tracking-tight">Leave Application Submitted!</h2>
            <p className={`text-xs sm:text-sm max-w-md mx-auto ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              Your leave request has been logged successfully and is awaiting review by your manager.
            </p>

            {/* Submission Receipt Card */}
            <div
              className={`mt-6 p-5 rounded-2xl border text-left space-y-3 ${
                isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-500/20">
                <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Request ID</span>
                <span className="text-xs font-mono font-bold text-blue-500">#{submittedLeave.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Leave Type
                  </p>
                  <p className="font-semibold text-blue-500">{leaveType} Leave</p>
                </div>

                <div>
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Duration
                  </p>
                  <p className="font-semibold">{durationDays} {durationDays === 1 ? 'Day' : 'Days'}</p>
                </div>

                <div>
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Start Date
                  </p>
                  <p className="font-medium">{formatDate(submittedLeave.start_date)}</p>
                </div>

                <div>
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    End Date
                  </p>
                  <p className="font-medium">{formatDate(submittedLeave.end_date)}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-500/20">
                <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                  Reason
                </p>
                <p className={`text-xs line-clamp-2 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  {leaveReason}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleResetForm}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center space-x-2 ${
                  isDark
                    ? 'bg-[#33302C] border-[#3D3833] text-stone-200 hover:bg-[#3D3833]'
                    : 'bg-[#F2ECE1] border-[#E2DBD0] text-stone-800 hover:bg-[#EAE2D3]'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Submit Another Request</span>
              </button>

              <Link
                to="/leave-history"
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>View Leave History</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Main Form Container */}
      <div
        className={`border rounded-2xl p-6 sm:p-8 shadow-2xl transition-colors duration-300 ${
          isDark ? 'bg-[#292623] border-[#3D3833] text-stone-100' : 'bg-[#FCFAF7] border-[#E8E2D8] text-stone-900 shadow-sm'
        }`}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`text-xl font-extrabold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Apply for Leave</h1>
            <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Fill in the details below to submit your leave application for manager review.
            </p>
          </div>
        </div>

        {/* Form Error Banner */}
        {error && (
          <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start space-x-2.5 text-rose-500 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Leave Type Selector */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
              Leave Type <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className={`w-full appearance-none rounded-xl px-3.5 py-3 text-xs font-semibold focus:outline-none transition-colors border ${
                  isDark
                    ? 'bg-[#22201D] border-[#3D3833] text-stone-100 focus:border-blue-500/80 [color-scheme:dark]'
                    : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-900 focus:bg-[#FFFDF9] focus:border-blue-500 [color-scheme:light]'
                }`}
              >
                <option value="" disabled>Select leave type</option>
                {LEAVE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} – {type.description}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? 'text-stone-400' : 'text-stone-500'
                }`}
              />
            </div>
          </div>

          {/* Leave Reason Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`block text-xs font-semibold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                Leave Reason <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                {leaveReason.length}/500 characters
              </span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={500}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="Enter the reason for your leave"
              className={`w-full rounded-xl p-3.5 text-xs focus:outline-none transition-colors resize-none border ${
                isDark
                  ? 'bg-[#22201D] border-[#3D3833] text-stone-100 placeholder-stone-500 focus:border-blue-500/80'
                  : 'bg-[#FAF7F2] border-[#E2DBD0] text-stone-900 placeholder-stone-400 focus:bg-[#FFFDF9] focus:border-blue-500'
              }`}
            />
          </div>

          {/* Date Picker Grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <CustomDatePicker
                  value={startDate}
                  onChange={(dateStr) => setStartDate(dateStr)}
                  placeholder="Select start date"
                  hasError={!!(dateRangeError || overlapError)}
                  align="left"
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  End Date <span className="text-rose-500">*</span>
                </label>
                <CustomDatePicker
                  value={endDate}
                  onChange={(dateStr) => setEndDate(dateStr)}
                  placeholder="Select end date"
                  minDate={startDate || undefined}
                  hasError={!!(dateRangeError || overlapError)}
                  align="right"
                />
              </div>
            </div>

            {/* Date Range Error Message */}
            {dateRangeError && (
              <p className="text-xs text-rose-500 font-medium flex items-center space-x-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{dateRangeError}</span>
              </p>
            )}

            {/* Overlap Error Message */}
            {overlapError && (
              <p className="text-xs text-amber-500 font-medium flex items-start space-x-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{overlapError}</span>
              </p>
            )}
          </div>

          {/* Calculated Duration Summary Box */}
          {durationDays > 0 && !dateRangeError && (
            <div
              className={`p-3.5 rounded-xl flex items-center justify-between text-xs border animate-in fade-in ${
                isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Total Duration Calculated:</span>
              </div>
              <span className="font-black text-sm">{durationDays} {durationDays === 1 ? 'Day' : 'Days'}</span>
            </div>
          )}

          {/* Supporting Document Upload UX */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
              Supporting Document{' '}
              <span className={`font-normal ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                (Optional – PDF, JPG, PNG up to 10MB)
              </span>
            </label>

            {!file ? (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-500/10'
                    : isDark
                    ? 'border-[#3D3833] hover:border-blue-500/50 bg-[#22201D]'
                    : 'border-[#E2DBD0] hover:border-blue-500/50 bg-[#FAF7F2]'
                }`}
              >
                <Upload
                  className={`w-8 h-8 transition-colors mb-2 ${
                    isDragOver
                      ? 'text-blue-500'
                      : isDark
                      ? 'text-stone-500 group-hover:text-blue-400'
                      : 'text-stone-400 group-hover:text-blue-600'
                  }`}
                />
                <p className={`text-xs font-semibold ${isDark ? 'text-stone-300' : 'text-stone-800'}`}>
                  {isDragOver ? 'Drop your document here' : 'Click or drag file to upload'}
                </p>
                <p className={`text-[10px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                  Supported formats: PDF, PNG, JPG (Max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf, .png, .jpg, .jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-bold truncate ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                      {file.name}
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors border ${
                      isDark
                        ? 'bg-[#33302C] border-[#3D3833] text-stone-300 hover:text-white'
                        : 'bg-[#F2ECE1] border-[#E2DBD0] text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark
                        ? 'text-stone-400 hover:text-rose-400 hover:bg-[#33302C]'
                        : 'text-stone-500 hover:text-rose-600 hover:bg-[#EAE2D3]'
                    }`}
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {fileError && <p className="text-xs text-rose-500 mt-1">{fileError}</p>}
          </div>

          {/* Form Footer & Submit Button */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t ${
              isDark ? 'border-[#3D3833]' : 'border-[#E8E2D8]'
            }`}
          >
            <div className={`flex items-center space-x-1.5 text-[11px] ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>All required fields (*) must be completed to submit.</span>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Leave Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

