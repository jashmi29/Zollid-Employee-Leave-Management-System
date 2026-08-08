import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { toast } from 'react-hot-toast';
import {
  User as UserIcon,
  Mail,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  Edit3,
  X,
  Check,
  Building2,
  AlertCircle
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { isDark } = useTheme();

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Sync profile fields from user
  useEffect(() => {
    if (user) {
      const rawUsername = user.username || '';
      const cleanUsername = rawUsername.includes('@') ? rawUsername.split('@')[0] : rawUsername;
      setFullName(user.fullName || cleanUsername);
      setUsername(cleanUsername);
      setCompanyEmail(user.companyEmail || '');
    }
  }, [user]);

  const resetProfileFields = () => {
    if (user) {
      const rawUsername = user.username || '';
      const cleanUsername = rawUsername.includes('@') ? rawUsername.split('@')[0] : rawUsername;
      setFullName(user.fullName || cleanUsername);
      setUsername(cleanUsername);
      setCompanyEmail(user.companyEmail || '');
    }
  };

  const initials = (() => {
    if (!user) return 'U';
    const name = user.fullName || user.username || 'User';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  })();

  const handleCancelEdit = () => {
    resetProfileFields();
    setIsEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !username.trim() || !companyEmail.trim()) {
      toast.error('Full Name, Username, and Email Address are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(companyEmail.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await updateProfile(fullName.trim(), username.trim(), companyEmail.trim());
      if (res.success) {
        toast.success(res.message || 'Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred while updating profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }

    if (!newPassword) {
      toast.error('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success(res.message || 'Password changed successfully!');
        handleClosePasswordModal();
      } else {
        toast.error(res.message || 'Failed to change password.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred while changing password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
          <UserIcon className="w-7 h-7 text-blue-500" />
          <span>Profile</span>
        </h1>
        <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
          Manage your user account details and password settings.
        </p>
      </div>

      {/* Single Profile Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-sm transition-all duration-300 relative overflow-hidden ${
          isDark
            ? 'bg-[#292623] border-[#3D3833] text-stone-100'
            : 'bg-[#FAF7F2] border-[#E8E2D8] text-stone-900'
        }`}
      >
        {/* Top Bar: Avatar & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 mb-6 border-b border-stone-500/10">
          <div className="flex items-center space-x-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/20">
                {initials}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 p-1 rounded-full border shadow-sm ${
                  isDark ? 'bg-[#201E1C] border-[#3F3B37]' : 'bg-white border-slate-200'
                }`}
                title={`${user?.role || 'User'} Role`}
              >
                <Shield className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold truncate">
                  {user?.fullName || user?.username || 'User'}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    user?.role === 'manager'
                      ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                      : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>{user?.role || 'Employee'}</span>
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                @{user?.username}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/15 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenPasswordModal}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#201E1C] hover:bg-[#33302C] border-[#3F3B37] text-stone-200'
                      : 'bg-white hover:bg-stone-50 border-[#E2DBD0] text-stone-800'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reset Password</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isUpdatingProfile}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#201E1C] hover:bg-[#33302C] border-[#3F3B37] text-stone-300'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  form="profile-card-form"
                  disabled={isUpdatingProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/15 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Card Fields Form */}
        <form id="profile-card-form" onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                Full Name
              </label>
              {isEditing ? (
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                      isDark
                        ? 'bg-[#201E1C] border-[#3F3B37] text-stone-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        : 'bg-white border-[#E2DBD0] text-stone-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                </div>
              ) : (
                <div
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium ${
                    isDark ? 'bg-[#201E1C]/60 border-[#3D3833] text-stone-200' : 'bg-white/80 border-[#E8E2D8] text-stone-800'
                  }`}
                >
                  {user?.fullName || user?.username || '—'}
                </div>
              )}
            </div>

            {/* Username */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                Username
              </label>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose username"
                    required
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                      isDark
                        ? 'bg-[#201E1C] border-[#3F3B37] text-stone-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        : 'bg-white border-[#E2DBD0] text-stone-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                </div>
              ) : (
                <div
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium ${
                    isDark ? 'bg-[#201E1C]/60 border-[#3D3833] text-stone-200' : 'bg-white/80 border-[#E8E2D8] text-stone-800'
                  }`}
                >
                  @{user?.username || '—'}
                </div>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                Email Address
              </label>
              {isEditing ? (
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="name@company.in"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                      isDark
                        ? 'bg-[#201E1C] border-[#3F3B37] text-stone-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        : 'bg-white border-[#E2DBD0] text-stone-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                </div>
              ) : (
                <div
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
                    isDark ? 'bg-[#201E1C]/60 border-[#3D3833] text-stone-200' : 'bg-white/80 border-[#E8E2D8] text-stone-800'
                  }`}
                >
                  <span className="truncate">{user?.companyEmail || '—'}</span>
                </div>
              )}
            </div>

            {/* Role (Always Read Only) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-bold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  Role
                </label>
                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Read Only</span>
                </span>
              </div>
              <div
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-between opacity-80 ${
                  isDark ? 'bg-[#181716] border-[#33302D] text-stone-400' : 'bg-stone-100 border-stone-200 text-stone-500'
                }`}
              >
                <span>{user?.role ? user.role.toUpperCase() : 'EMPLOYEE'}</span>
                <Shield className="w-3.5 h-3.5 text-stone-400" />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Reset Password Centered Modal / Dialog */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
              isDark
                ? 'bg-[#25221F] border-[#3D3833] text-stone-100'
                : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-stone-500/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">Reset Password</h3>
                  <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Update your account credentials safely.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePasswordModal}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-[#33302C] text-stone-400' : 'hover:bg-stone-100 text-stone-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {/* Current Password */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                      isDark
                        ? 'bg-[#1C1A18] border-[#3F3B37] text-stone-100 focus:border-amber-500'
                        : 'bg-stone-50 border-[#E2DBD0] text-stone-900 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-1"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                      isDark
                        ? 'bg-[#1C1A18] border-[#3F3B37] text-stone-100 focus:border-amber-500'
                        : 'bg-stone-50 border-[#E2DBD0] text-stone-900 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium border transition-all outline-none ${
                      isDark
                        ? 'bg-[#1C1A18] border-[#3F3B37] text-stone-100 focus:border-amber-500'
                        : 'bg-stone-50 border-[#E2DBD0] text-stone-900 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-stone-500/10">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  disabled={isUpdatingPassword}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#1C1A18] hover:bg-[#33302C] border-[#3F3B37] text-stone-300'
                      : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdatingPassword ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
