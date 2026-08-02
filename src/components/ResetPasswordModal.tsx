import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme.js';
import { authService } from '../services/authService.js';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  KeyRound,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (username: string) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { isDark } = useTheme();

  const [step, setStep] = useState<'verify' | 'reset' | 'success'>('verify');
  const [username, setUsername] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResetState = () => {
    setStep('verify');
    setUsername('');
    setCompanyEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    const trimmedEmail = companyEmail.trim();

    if (!trimmedUsername || !trimmedEmail) {
      setError('Both Username and Company Email are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid company email address.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await authService.verifyEmployee(trimmedUsername, trimmedEmail);
      if (res.success) {
        setStep('reset');
        setError(null);
      } else {
        setError(res.message || 'The provided information does not match any employee account.');
      }
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.message;
      setError(apiMsg || 'The provided information does not match any employee account.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword(
        username.trim(),
        companyEmail.trim(),
        newPassword,
        confirmPassword
      );

      if (res.success) {
        setStep('success');
        setSuccessMessage('Your password has been updated successfully. Please sign in with your new password.');
        toast.success('Password updated successfully!');
      } else {
        setError(res.message || 'The provided information does not match any employee account.');
      }
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.message;
      setError(apiMsg || 'The provided information does not match any employee account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in transition-all duration-200">
      <div className={`border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative transition-all duration-300 ${
        isDark ? 'bg-[#151311] border-[#38332E] text-stone-100' : 'bg-white border-[#E5DDD0] text-[#111827]'
      }`}>
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetState}
          className={`absolute top-5 right-5 p-2 rounded-xl transition-colors cursor-pointer ${
            isDark ? 'text-stone-400 hover:text-stone-200 hover:bg-[#282420]' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
            step === 'success'
              ? (isDark ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
              : (isDark ? 'bg-blue-950/80 border-blue-800/80 text-blue-400' : 'bg-blue-50 border-blue-200 text-[#2563EB]')
          }`}>
            {step === 'success' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : step === 'reset' ? (
              <KeyRound className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-stone-100' : 'text-[#111827]'}`}>
              {step === 'verify' && 'Forgot Password'}
              {step === 'reset' && 'Set New Password'}
              {step === 'success' && 'Password Reset Complete'}
            </h3>
            <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              {step === 'verify' && 'Verify your employee credentials to continue'}
              {step === 'reset' && 'Create a strong new password for your account'}
              {step === 'success' && 'Your account password has been updated'}
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className={`p-4 mb-6 border rounded-2xl flex items-start space-x-3 text-xs sm:text-sm animate-in fade-in transition-colors duration-200 ${
            isDark
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: VERIFY EMPLOYEE ACCOUNT */}
        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className={`block text-xs sm:text-sm font-semibold mb-2 ${
                isDark ? 'text-stone-200' : 'text-[#111827]'
              }`}>
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                  isDark ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  <User className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your employee username"
                  className={`w-full rounded-2xl pl-10 pr-4 py-3.5 text-sm transition-all focus:outline-none shadow-sm ${
                    isDark
                      ? 'bg-[#1D1B19] border border-[#3D3833] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-100 placeholder-stone-500'
                      : 'bg-[#FAF7F2] border border-[#E2DBD0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 text-[#111827] placeholder-stone-400'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-semibold mb-2 ${
                isDark ? 'text-stone-200' : 'text-[#111827]'
              }`}>
                Company Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                  isDark ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="email"
                  required
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`w-full rounded-2xl pl-10 pr-4 py-3.5 text-sm transition-all focus:outline-none shadow-sm ${
                    isDark
                      ? 'bg-[#1D1B19] border border-[#3D3833] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-100 placeholder-stone-500'
                      : 'bg-[#FAF7F2] border border-[#E2DBD0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 text-[#111827] placeholder-stone-400'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-600 hover:to-blue-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Account</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: ENTER NEW PASSWORD */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Verified Badge */}
            <div className={`p-3 rounded-2xl border flex items-center space-x-3 text-xs ${
              isDark
                ? 'bg-blue-950/30 border-blue-800/40 text-blue-300'
                : 'bg-blue-50/80 border-blue-200/80 text-blue-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500" />
              <div className="truncate">
                <span className="font-semibold">{username}</span> ({companyEmail}) verified.
              </div>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-semibold mb-2 ${
                isDark ? 'text-stone-200' : 'text-[#111827]'
              }`}>
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                  isDark ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className={`w-full rounded-2xl pl-10 pr-10 py-3.5 text-sm transition-all focus:outline-none shadow-sm ${
                    isDark
                      ? 'bg-[#1D1B19] border border-[#3D3833] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-100 placeholder-stone-500'
                      : 'bg-[#FAF7F2] border border-[#E2DBD0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 text-[#111827] placeholder-stone-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors ${
                    isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'
                  }`}
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-semibold mb-2 ${
                isDark ? 'text-stone-200' : 'text-[#111827]'
              }`}>
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                  isDark ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full rounded-2xl pl-10 pr-10 py-3.5 text-sm transition-all focus:outline-none shadow-sm ${
                    isDark
                      ? 'bg-[#1D1B19] border border-[#3D3833] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-100 placeholder-stone-500'
                      : 'bg-[#FAF7F2] border border-[#E2DBD0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 text-[#111827] placeholder-stone-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors ${
                    isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'
                  }`}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Validation Guidance */}
            <div className="space-y-1.5 pt-1 text-xs">
              <div className={`flex items-center space-x-2 ${
                newPassword.length >= 6
                  ? 'text-emerald-500'
                  : (isDark ? 'text-stone-500' : 'text-stone-400')
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                <span>At least 6 characters long</span>
              </div>
              <div className={`flex items-center space-x-2 ${
                newPassword && confirmPassword && newPassword === confirmPassword
                  ? 'text-emerald-500'
                  : (isDark ? 'text-stone-500' : 'text-stone-400')
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                <span>Passwords match</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('verify')}
                className={`flex-1 py-3.5 font-semibold text-xs sm:text-sm rounded-2xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-[#3D3833] text-stone-300 hover:bg-[#24221F]'
                    : 'border-[#E2DBD0] text-[#111827] hover:bg-stone-100'
                }`}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-600 hover:to-blue-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.99] flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="space-y-6 text-center py-2">
            <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
              isDark
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              {successMessage || 'Your password has been updated successfully. Please sign in with your new password.'}
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSuccess) onSuccess(username);
                handleResetState();
              }}
              className="w-full py-4 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-600 hover:to-blue-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.99] cursor-pointer"
            >
              Sign In With New Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
