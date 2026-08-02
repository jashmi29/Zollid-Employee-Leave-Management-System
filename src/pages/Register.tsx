import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { AuthLayout } from '../layouts/AuthLayout.js';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const { register, isAuthenticated, role } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={role === 'manager' ? '/manager/dashboard' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedFullName = fullName.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = companyEmail.trim().toLowerCase();

    if (!trimmedFullName || !trimmedUsername || !trimmedEmail || !password || !confirmPassword) {
      setError('Please fill in all required fields (Full Name, Username, Company Email, Password, and Confirm Password).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid company email address.');
      return;
    }

    if (
      trimmedEmail === 'manager@zollid.in' ||
      trimmedEmail === 'manager@gcu.in' ||
      trimmedEmail.includes('manager') ||
      trimmedUsername.includes('manager')
    ) {
      setError('Manager accounts cannot be created via public registration.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const result = await register(trimmedFullName, trimmedUsername, trimmedEmail, password);
    setIsLoading(false);

    if (result.success) {
      toast.success('Employee account created successfully!');
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message || 'Registration failed.');
    }
  };

  return (
    <AuthLayout
      title="Employee Registration"
      subtitle="Create your employee account with your full identity details to access the portal."
      isRegister={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {error && (
          <div className={`p-4 border rounded-2xl flex items-start space-x-3 text-xs sm:text-sm animate-in fade-in transition-colors duration-300 ${
            isDark
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              : 'bg-rose-50 border-rose-200 text-rose-600'
          }`}>
            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
            <span>{error}</span>
          </div>
        )}

        {/* Full Name Field */}
        <div>
          <label className={`block text-xs sm:text-sm font-semibold mb-2 transition-colors duration-300 ${
            isDark ? 'text-slate-200' : 'text-[#111827]'
          }`}>
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className={`w-full rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base transition-all focus:outline-none shadow-sm ${
                isDark
                  ? 'bg-[#1D1B19] border border-[#3D3833] focus:bg-[#24221F] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-stone-100 placeholder-stone-500'
                  : 'bg-[#FAF7F2] border border-[#E2DBD0] focus:bg-[#FFFDF9] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 text-[#111827] placeholder-stone-400'
              }`}
            />
          </div>
        </div>

        {/* Username Field */}
        <div>
          <label className={`block text-xs sm:text-sm font-semibold mb-2 transition-colors duration-300 ${
            isDark ? 'text-slate-200' : 'text-[#111827]'
          }`}>
            Username <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <UserPlus className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className={`w-full rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base transition-all focus:outline-none shadow-sm ${
                isDark
                  ? 'bg-[#1D1B19] border border-[#3D3833] focus:bg-[#24221F] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-stone-100 placeholder-stone-500'
                  : 'bg-[#FAF7F2] border border-[#E2DBD0] focus:bg-[#FFFDF9] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 text-[#111827] placeholder-stone-400'
              }`}
            />
          </div>
        </div>

        {/* Company Email Field */}
        <div>
          <label className={`block text-xs sm:text-sm font-semibold mb-2 transition-colors duration-300 ${
            isDark ? 'text-slate-200' : 'text-[#111827]'
          }`}>
            Company Email <span className={`font-normal text-xs ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>(for login only)</span> <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              required
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder="Enter your company email"
              className={`w-full rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base transition-all focus:outline-none shadow-sm ${
                isDark
                  ? 'bg-[#1D1B19] border border-[#3D3833] focus:bg-[#24221F] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-stone-100 placeholder-stone-500'
                  : 'bg-[#FAF7F2] border border-[#E2DBD0] focus:bg-[#FFFDF9] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 text-[#111827] placeholder-stone-400'
              }`}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className={`block text-xs sm:text-sm font-semibold mb-2 transition-colors duration-300 ${
            isDark ? 'text-slate-200' : 'text-[#111827]'
          }`}>
            Password <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-[#6B7280]'}`}>(min. 6 chars)</span> <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`w-full rounded-2xl pl-11 pr-12 py-3.5 text-sm sm:text-base transition-all focus:outline-none shadow-sm ${
                isDark
                  ? 'bg-[#1D1B19] border border-[#3D3833] focus:bg-[#24221F] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-stone-100 placeholder-stone-500'
                  : 'bg-[#FAF7F2] border border-[#E2DBD0] focus:bg-[#FFFDF9] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 text-[#111827] placeholder-stone-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
                isDark ? 'text-stone-500 hover:text-stone-300' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className={`block text-xs sm:text-sm font-semibold mb-2 transition-colors duration-300 ${
            isDark ? 'text-stone-200' : 'text-[#111827]'
          }`}>
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
              isDark ? 'text-stone-500' : 'text-slate-400'
            }`}>
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className={`w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm sm:text-base transition-all focus:outline-none shadow-sm ${
                isDark
                  ? 'bg-[#1D1B19] border border-[#3D3833] focus:bg-[#24221F] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-stone-100 placeholder-stone-500'
                  : 'bg-[#FAF7F2] border border-[#E2DBD0] focus:bg-[#FFFDF9] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 text-[#111827] placeholder-stone-400'
              }`}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-600 hover:to-blue-800 text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-200 active:scale-[0.99] flex items-center justify-center space-x-2.5 disabled:opacity-50 !mt-6 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>Create Account</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </>
          )}
        </button>

        {/* Login Prompt */}
        <div className={`pt-4 text-center border-t transition-colors duration-300 ${
          isDark ? 'border-slate-800/80' : 'border-slate-100'
        }`}>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-[#6B7280]'}`}>
            Already registered?{' '}
            <Link to="/login" className={`font-bold transition-colors underline decoration-blue-500/30 underline-offset-4 ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-[#2563EB] hover:text-[#1D4ED8]'
            }`}>
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
