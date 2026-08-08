import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { useTheme } from '../../hooks/useTheme.js';
import { ZollidLogo } from './ZollidLogo.js';
import { NotificationPanel } from './NotificationPanel.js';
import {
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  Menu,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar
}) => {
  const location = useLocation();
  const { user, logout, role } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
    if (path === '/calendar') return { portal: 'Employee', title: 'Leave Calendar' };
    if (path === '/profile') return { portal: 'Employee', title: 'Account Profile' };
    if (path === '/manager/dashboard') return { portal: 'Manager', title: 'Dashboard Overview' };
    if (path === '/manager/employees') return { portal: 'Manager', title: 'Employee Directory' };
    if (path === '/manager/calendar') return { portal: 'Manager', title: 'Leave Calendar' };
    if (path === '/manager/leave-requests') return { portal: 'Manager', title: 'Leave Requests' };
    if (path === '/manager/profile') return { portal: 'Manager', title: 'Account Profile' };
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

        {/* Notification Bell Button (Employee & Manager) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
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

          <NotificationPanel
            isOpen={showNotificationPanel}
            onClose={() => setShowNotificationPanel(false)}
          />
        </div>

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
                      <Link
                        to={role === 'manager' ? '/manager/profile' : '/profile'}
                        onClick={() => setShowProfileMenu(false)}
                        className={`px-3 py-2 text-xs flex items-center space-x-2 rounded-xl border transition-colors ${
                          isDark
                            ? 'bg-[#201E1C] hover:bg-[#33302C] border-[#3F3B37] text-stone-200'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <UserIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-semibold">Manage Profile</span>
                      </Link>
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
