import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { useTheme } from '../../hooks/useTheme.js';
import { ZollidLogo } from './ZollidLogo.js';
import {
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  Menu,
  CheckCheck,
  Sparkles,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';
import { LeaveStatusBadge } from './LeaveStatusBadge.js';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar
}) => {
  const location = useLocation();
  const { user, logout, role } = useAuth();
  const { unreadNotifications, unreadCount, markAllAsRead } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine page title & breadcrumbs
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/dashboard') return { portal: 'Employee', title: 'Dashboard Overview' };
    if (path === '/apply-leave') return { portal: 'Employee', title: 'Apply Leave' };
    if (path === '/leave-history') return { portal: 'Employee', title: 'Leave History' };
    if (path === '/manager/dashboard') return { portal: 'Manager', title: 'Dashboard Overview' };
    if (path === '/manager/employees') return { portal: 'Manager', title: 'Employee Directory' };
    if (path === '/manager/leave-requests') return { portal: 'Manager', title: 'Leave Requests' };
    return { portal: role === 'manager' ? 'Manager' : 'Employee', title: 'Workspace' };
  };

  const pageInfo = getPageInfo();

  return (
    <header
      className={`sticky top-0 z-30 h-16 backdrop-blur-md border-b px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-300 ${
        isDark
          ? 'bg-[#292623]/90 border-[#3D3833] text-stone-100'
          : 'bg-[#FAF7F2]/95 border-[#E8E2D8] text-stone-800 shadow-sm'
      }`}
    >
      {/* Left section: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Toggle */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className={`p-2 rounded-xl transition-colors md:hidden border ${
              isDark
                ? 'text-stone-400 hover:text-stone-100 hover:bg-[#33302C] border-transparent hover:border-[#3F3B37]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#F2ECE1] border-transparent hover:border-[#E2DBD0]'
            }`}
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Mobile Logo Brand */}
        <div className="flex items-center space-x-2 md:hidden">
          <ZollidLogo iconOnly className="h-7" />
        </div>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:flex items-center space-x-2 text-xs">
          <span className={`font-semibold ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            {pageInfo.portal}
          </span>
          <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
          <span className={`font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
            {pageInfo.title}
          </span>
        </div>
      </div>

      {/* Right section: Role badge, Theme Toggle, Notifications, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Role Badge */}
        <div
          className={`hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-xs font-semibold ${
            isDark
              ? 'bg-[#302D2A] border-[#3F3B37] text-stone-200'
              : 'bg-[#F5F0E6] border-[#E2DBD0] text-stone-700'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-blue-500" />
          <span className="capitalize">{role} Authorized</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
            isDark
              ? 'bg-[#302D2A] text-amber-400 border-[#3F3B37] hover:bg-[#383430] hover:border-amber-400/30'
              : 'bg-[#F5F0E6] text-stone-700 border-[#E2DBD0] hover:bg-[#EBE3D3] hover:text-blue-600'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown (Employees only) */}
        {role === 'employee' && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-xl border transition-all ${
                isDark
                  ? 'text-stone-300 hover:text-white hover:bg-[#33302C] border-transparent hover:border-[#3F3B37]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#F2ECE1] border-transparent hover:border-[#E2DBD0]'
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#22201E] animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  isDark
                    ? 'bg-[#2B2825] border-[#3F3B37] text-stone-100'
                    : 'bg-[#FFFDF9] border-[#E8E2D8] text-stone-900'
                }`}
              >
                <div
                  className={`p-3.5 border-b flex items-center justify-between ${
                    isDark ? 'border-[#3F3B37] bg-[#22201D]' : 'border-[#E8E2D8] bg-[#F8F4EC]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isDark ? 'text-stone-200' : 'text-slate-700'
                      }`}
                    >
                      Leave Status Updates {unreadCount > 0 && `(${unreadCount})`}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-blue-500 hover:text-blue-600 flex items-center space-x-1 transition-colors px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div
                  className={`max-h-80 overflow-y-auto divide-y ${
                    isDark ? 'divide-[#383430]' : 'divide-slate-100'
                  }`}
                >
                  {unreadNotifications.length === 0 ? (
                    <div className="p-8 text-center text-xs space-y-1">
                      <p className={`font-semibold ${isDark ? 'text-stone-300' : 'text-slate-700'}`}>
                        All caught up!
                      </p>
                      <p className={isDark ? 'text-stone-400' : 'text-slate-500'}>
                        No unread leave status updates at the moment.
                      </p>
                    </div>
                  ) : (
                    unreadNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 transition-colors ${
                          isDark ? 'hover:bg-[#33302C]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <LeaveStatusBadge status={notif.status} size="sm" />
                          <span
                            className={`text-[10px] font-mono ${
                              isDark ? 'text-stone-400' : 'text-slate-500'
                            }`}
                          >
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p
                          className={`text-xs font-medium line-clamp-1 mb-1 ${
                            isDark ? 'text-stone-200' : 'text-slate-800'
                          }`}
                        >
                          {notif.leave_reason}
                        </p>
                        {notif.remarks && (
                          <p
                            className={`text-[11px] p-2 rounded-lg border ${
                              isDark
                                ? 'text-stone-300 bg-[#201E1C] border-[#3F3B37]'
                                : 'text-slate-700 bg-slate-100 border-slate-200'
                            }`}
                          >
                            <span className="font-semibold">Manager Remarks:</span> "{notif.remarks}"
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          {(() => {
            const rawUsername = user?.username || 'User';
            const cleanUsername = rawUsername.includes('@') ? rawUsername.split('@')[0] : rawUsername;
            const displayName = role === 'employee' ? cleanUsername : (user?.fullName && !user.fullName.includes('@') ? user.fullName : cleanUsername);
            const initials = cleanUsername.substring(0, 2).toUpperCase() || 'U';

            return (
              <>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center space-x-2.5 p-1.5 rounded-xl border transition-all ${
                    isDark
                      ? 'hover:bg-[#33302C] border-transparent hover:border-[#3F3B37]'
                      : 'hover:bg-slate-100 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20 ring-2 ring-blue-500/30">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p
                      className={`text-xs font-bold truncate max-w-[140px] ${
                        isDark ? 'text-stone-200' : 'text-slate-800'
                      }`}
                    >
                      {displayName}
                    </p>
                    <p
                      className={`text-[10px] uppercase tracking-wider font-semibold ${
                        isDark ? 'text-stone-400' : 'text-slate-500'
                      }`}
                    >
                      {role}
                    </p>
                  </div>
                </button>

                {showProfileMenu && (
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                      isDark
                        ? 'bg-[#2B2825] border-[#3F3B37] text-stone-100'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div
                      className={`px-3 py-2.5 border-b mb-1 rounded-xl ${
                        isDark ? 'border-[#3F3B37] bg-[#22201D]' : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <p className={`text-xs font-bold truncate ${isDark ? 'text-stone-100' : 'text-slate-800'}`}>
                        {displayName}
                      </p>
                      {user?.companyEmail && (
                        <p className={`text-[11px] truncate ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                          {user.companyEmail}
                        </p>
                      )}
                      <p
                        className={`text-[10px] uppercase tracking-wider font-semibold mt-1 ${
                          isDark ? 'text-stone-400' : 'text-slate-500'
                        }`}
                      >
                        {role} Portal Account
                      </p>
                    </div>

                    <div className="py-1 space-y-1">
                      <div
                        className={`px-3 py-2 text-xs flex items-center space-x-2 rounded-lg border ${
                          isDark
                            ? 'bg-[#201E1C] border-[#3F3B37] text-stone-300'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <UserIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate font-mono">ID: #{user?.id}</span>
                      </div>
                    </div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-2 px-3 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </header>
  );
};
