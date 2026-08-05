import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { AuthLayout } from '../layouts/AuthLayout.js';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  ShieldAlert,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ResetPasswordModal } from '../components/ResetPasswordModal.js';

export const Login: React.FC = () => {
  const { login, logout, isAuthenticated, role } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [selectedRole, setSelectedRole] = useState<'employee' | 'manager'>('employee');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  // Extract destination if user was redirected from a protected route or url parameter
  const searchParamsRedirect = searchParams.get('redirect');
  const locationStateFrom = (location.state as { from?: { pathname?: string } | string })?.from;
  const fromPath = typeof locationStateFrom === 'string' ? locationStateFrom : locationStateFrom?.pathname;
  const targetDestination = searchParamsRedirect || fromPath;

  const resolveRedirectPath = (userRole: string | null) => {
    const defaultHome = userRole === 'manager' ? '/manager/dashboard' : '/dashboard';
    if (!targetDestination || !targetDestination.startsWith('/') || targetDestination === '/login' || targetDestination === '/register') {
      return defaultHome;
    }

    const isManagerRoute = targetDestination.startsWith('/manager');
    if (userRole === 'manager' && isManagerRoute) {
      return targetDestination;
    } else if (userRole === 'employee' && !isManagerRoute) {
      return targetDestination;
    }
    return defaultHome;
  };

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      setSessionExpiredNotice(true);
    }
  }, [searchParams]);

  if (isAuthenticated) {
    return <Navigate to={resolveRedirectPath(role)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSessionExpiredNotice(false);

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(username.trim(), password);
    setIsLoading(false);

    if (result.success) {
      const userStr = localStorage.getItem('leave_app_user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userRole = userObj?.role || role || 'employee';

      // Enforce strict tab role validation
      if (selectedRole === 'manager' && userRole !== 'manager') {
        logout();
        setError('Access denied. This account is registered as an Employee. Please switch to the Employee Sign In tab.');
        return;
      }

      if (selectedRole === 'employee' && userRole === 'manager') {
        logout();
        setError('Access denied. Manager accounts must sign in using the Manager Sign In tab.');
        return;
      }

      if (userRole === 'manager') {
        toast.success(`Welcome back, Manager ${userObj?.fullName || userObj?.username || ''}!`);
      } else {
        toast.success(`Signed in successfully! Welcome, ${userObj?.fullName || userObj?.username || ''}.`);
      }

      const finalPath = resolveRedirectPath(userRole);
      navigate(finalPath, { replace: true });
    } else {
      setError(result.message || 'Invalid username or password credentials.');
    }
  };

  return (
    <AuthLayout
      title={selectedRole === 'manager' ? 'Manager Sign In' : 'Employee Sign In'}
      subtitle={selectedRole === 'manager' ? 'Access your manager administration portal' : 'Access your employee leave portal'}
    >
      {/* Compact Role Selection Bar */}
      <div className={`p-1 rounded-2xl flex items-center mb-5 transition-colors duration-200 ${
        isDark ? 'bg-[#1D1B19] border border-[#3D3833]' : 'bg-[#F2ECE1] border border-[#E0D7C6]'
      }`}>
        <button
          type="button"
          onClick={() => { setSelectedRole('employee'); setError(null); }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer ${
            selectedRole === 'employee'
              ? (isDark ? 'bg-[#33302C] text-white shadow-sm border border-[#48433D]' : 'bg-white text-stone-900 shadow-sm border border-[#D8CFBF]')
              : (isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900')
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Employee Sign In</span>
        </button>
        <button
          type="button"
          onClick={() => { setSelectedRole('manager'); setError(null); }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer ${
            selectedRole === 'manager'
              ? (isDark ? 'bg-[#33302C] text-white shadow-sm border border-[#48433D]' : 'bg-white text-stone-900 shadow-sm border border-[#D8CFBF]')
              : (isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900')
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Manager Sign In</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {sessionExpiredNotice && (
          <div className={`p-4 border rounded-2xl flex items-start space-x-3 text-xs sm:text-sm animate-in fade-in transition-colors duration-300 ${
            isDark
              ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

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

        {/* Username Field */}
        <div>
          <label className={`block text-xs sm:text-sm font-semibold mb-2.5 transition-colors duration-300 ${
            isDark ? 'text-slate-200' : 'text-[#111827]'
          }`}>
            Username or Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none transition-colors duration-300 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              className={`w-full rounded-2xl pl-12 pr-4 py-4 text-sm sm:text-base transition-all focus:outline-none shadow-sm ${
                isDark
                  ? 'bg-[#1D1B19] border border-[#3D3833] focus:bg-[#24221F] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-stone-100 placeholder-stone-500'
                  : 'bg-[#FAF7F2] border border-[#E2DBD0] focus:bg-[#FFFDF9] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 text-[#111827] placeholder-stone-400'
              }`}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className={`block text-xs sm:text-sm font-semibold mb-2.5 transition-colors duration-300 ${
            isDark ? 'text-slate-200' : 'text-[#111827]'
          }`}>
            Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none transition-colors duration-300 ${
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
              className={`w-full rounded-2xl pl-12 pr-12 py-4 text-sm sm:text-base transition-all focus:outline-none shadow-sm ${
                isDark
                  ? 'bg-[#1D1B19] border border-[#3D3833] focus:bg-[#24221F] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-stone-100 placeholder-stone-500'
                  : 'bg-[#FAF7F2] border border-[#E2DBD0] focus:bg-[#FFFDF9] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 text-[#111827] placeholder-stone-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
                isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1 text-xs sm:text-sm">
          <label className="flex items-center space-x-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4.5 h-4.5 rounded border-slate-300 text-[#2563EB] focus:ring-blue-500/20 focus:ring-offset-0 transition-colors cursor-pointer"
            />
            <span className={`font-medium transition-colors ${
              isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-[#6B7280] group-hover:text-[#111827]'
            }`}>
              Remember me
            </span>
          </label>

          {selectedRole === 'employee' && (
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className={`font-semibold transition-colors ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-[#2563EB] hover:text-[#1D4ED8]'
              }`}
            >
              Forgot password?
            </button>
          )}
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group w-full py-4.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-600 hover:to-blue-800 text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-200 active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50 !mt-7 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <LogIn className="w-5 h-5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        {/* Register Prompt (Available only for employees) */}
        {selectedRole === 'employee' ? (
          <div className={`pt-5 text-center border-t transition-colors duration-300 ${
            isDark ? 'border-slate-800/80' : 'border-slate-100'
          }`}>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-[#6B7280]'}`}>
              Don't have an account?{' '}
              <Link to="/register" className={`font-bold transition-colors underline decoration-blue-500/30 underline-offset-4 ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-[#2563EB] hover:text-[#1D4ED8]'
              }`}>
                Create account
              </Link>
            </p>
          </div>
        ) : (
          <div className={`pt-5 text-center border-t transition-colors duration-300 ${
            isDark ? 'border-slate-800/80' : 'border-slate-100'
          }`}>
            <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Manager portal access is restricted to company-issued accounts. Valid credentials automatically log into your assigned role portal.
            </p>
          </div>
        )}
      </form>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSuccess={(resetUsername) => {
          if (resetUsername) {
            setUsername(resetUsername);
          }
        }}
      />
    </AuthLayout>
  );
};
