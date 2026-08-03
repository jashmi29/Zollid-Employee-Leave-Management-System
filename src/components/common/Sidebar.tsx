import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../hooks/useTheme.js';
import { ZollidLogo } from './ZollidLogo.js';
import {
  LayoutDashboard,
  FilePlus2,
  History,
  Users,
  ClipboardList,
  Calendar,
  LogOut,
  X,
  Shield,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { role, logout, user } = useAuth();
  const { isDark } = useTheme();

  // Desktop sidebar collapse state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('zollid_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('zollid_sidebar_collapsed', String(next));
      return next;
    });
  };

  const rawUsername = user?.username || 'User';
  const displayUsername = rawUsername.includes('@') ? rawUsername.split('@')[0] : rawUsername;

  const employeeLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Apply Leave', path: '/apply-leave', icon: FilePlus2 },
    { name: 'Leave History', path: '/leave-history', icon: History },
    { name: 'Leave Calendar', path: '/calendar', icon: Calendar }
  ];

  const managerLinks = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Employee Directory', path: '/manager/employees', icon: Users },
    { name: 'Leave Requests', path: '/manager/leave-requests', icon: ClipboardList },
    { name: 'Leave Calendar', path: '/calendar', icon: Calendar }
  ];

  const links = role === 'manager' ? managerLinks : employeeLinks;

  // Desktop Content (Supports Collapsed & Expanded)
  const renderDesktopSidebar = () => (
    <div
      className={`flex flex-col h-full w-full border-r shadow-lg transition-all duration-300 ${
        isCollapsed ? 'overflow-visible' : 'overflow-hidden'
      } ${
        isDark
          ? 'bg-[#292623] border-[#3D3833] text-stone-100'
          : 'bg-[#FAF7F2] border-[#E8E2D8] text-stone-800'
      }`}
    >
      {/* Brand Header */}
      {isCollapsed ? (
        <div
          className={`py-3.5 px-2 flex flex-col items-center justify-center space-y-2.5 border-b shrink-0 ${
            isDark ? 'border-[#383430]' : 'border-[#E8E2D8]'
          }`}
        >
          {/* Top: Compact full ZOLLID wordmark scaled proportionally so it fits within narrow rail */}
          <div className="flex items-center justify-center w-full px-1" title="ZOLLID Leave Management System">
            <ZollidLogo showTagline={false} className="h-3 w-auto shrink-0" />
          </div>

          {/* Below: Expand control */}
          <button
            onClick={toggleCollapse}
            className={`p-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
              isDark
                ? 'text-stone-400 hover:text-stone-100 hover:bg-[#33302C] border-[#3F3B37]'
                : 'text-stone-500 hover:text-stone-900 hover:bg-[#F2ECE1] border-[#E2DBD0]'
            }`}
            title="Expand Sidebar"
            aria-label="Expand Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`py-4 px-4 flex items-center justify-between border-b shrink-0 ${
            isDark ? 'border-[#383430]' : 'border-[#E8E2D8]'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-1 text-center min-w-0 flex-1 pr-1">
            <ZollidLogo className="h-7 sm:h-8" showTagline={false} />
            <p
              className={`text-xs font-semibold tracking-tight text-center transition-colors duration-200 ${
                isDark ? 'text-stone-300' : 'text-stone-700'
              }`}
            >
              Leave Management System
            </p>
          </div>
          <button
            onClick={toggleCollapse}
            className={`p-1.5 rounded-xl border transition-all duration-200 shrink-0 cursor-pointer ${
              isDark
                ? 'text-stone-400 hover:text-stone-100 hover:bg-[#33302C] border-transparent hover:border-[#3F3B37]'
                : 'text-stone-500 hover:text-stone-900 hover:bg-[#F2ECE1] border-transparent hover:border-[#E2DBD0]'
            }`}
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4.5 h-4.5" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className={`flex-1 py-4 space-y-1.5 ${isCollapsed ? 'px-2 overflow-visible' : 'px-3 overflow-y-auto'}`}>
        {!isCollapsed ? (
          <div className="px-2 mb-2 flex items-center justify-between">
            <p
              className={`text-[10px] uppercase tracking-widest font-bold ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Navigation
            </p>
            <span
              className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded border ${
                isDark
                  ? 'text-stone-300 bg-[#302D29] border-[#3F3B37]'
                  : 'text-stone-700 bg-[#F5F0E6] border-[#E2DBD0]'
              }`}
            >
              {role}
            </span>
          </div>
        ) : (
          <div className="relative group flex justify-center mb-3">
            <span
              className={`p-1.5 rounded-lg border text-[10px] font-bold uppercase ${
                isDark
                  ? 'text-stone-300 bg-[#302D29] border-[#3F3B37]'
                  : 'text-stone-700 bg-[#F5F0E6] border-[#E2DBD0]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-500" />
            </span>
            {/* Tooltip */}
            <div
              className={`pointer-events-none absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-md border transition-all duration-150 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 ${
                isDark
                  ? 'bg-[#1C1B1A] text-stone-200 border-[#3F3B37]'
                  : 'bg-stone-900 text-stone-100 border-stone-800'
              }`}
            >
              <span className="capitalize">{role} Portal</span>
            </div>
          </div>
        )}

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? isDark
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'bg-[#F2ECE1] text-blue-700 border border-[#E2DBD0] shadow-sm'
                    : isDark
                      ? 'text-stone-400 hover:bg-[#33302C] hover:text-stone-100 border border-transparent'
                      : 'text-stone-600 hover:bg-[#F2ECE1] hover:text-stone-900 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator Strip */}
                  {isActive && (
                    <span
                      className={`absolute left-0 top-2 bottom-2 bg-blue-500 rounded-r-full ${
                        isCollapsed ? 'w-1' : 'w-1'
                      }`}
                    />
                  )}

                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? 'text-blue-500'
                        : isDark
                          ? 'text-stone-400 group-hover:text-stone-200'
                          : 'text-stone-500 group-hover:text-stone-800'
                    }`}
                  />

                  {!isCollapsed ? (
                    <span className="truncate">{link.name}</span>
                  ) : (
                    /* Floating Hover Tooltip in Collapsed Mode */
                    <div
                      className={`pointer-events-none absolute left-full ml-3.5 z-50 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-md border transition-all duration-150 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 ${
                        isDark
                          ? 'bg-[#1C1B1A] text-stone-200 border-[#3F3B37]'
                          : 'bg-stone-900 text-stone-100 border-stone-800'
                      }`}
                    >
                      {link.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Footer */}
      <div
        className={`border-t shrink-0 mt-auto ${isCollapsed ? 'p-2' : 'p-3'} ${
          isDark ? 'border-[#383430]' : 'border-[#E8E2D8]'
        }`}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-2.5 py-1">
            <div className="relative group flex justify-center">
              <div
                className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold text-xs shrink-0 cursor-default"
              >
                {displayUsername.substring(0, 2).toUpperCase()}
              </div>
              {/* Tooltip */}
              <div
                className={`pointer-events-none absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium shadow-md border transition-all duration-150 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 ${
                  isDark
                    ? 'bg-[#1C1B1A] text-stone-200 border-[#3F3B37]'
                    : 'bg-stone-900 text-stone-100 border-stone-800'
                }`}
              >
                <p className="font-bold">{displayUsername}</p>
                <p className="text-[10px] opacity-75 capitalize">{role} Portal</p>
              </div>
            </div>

            <div className="relative group flex justify-center">
              <button
                onClick={logout}
                aria-label="Sign Out"
                className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
              {/* Tooltip */}
              <div
                className={`pointer-events-none absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold shadow-md border transition-all duration-150 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 ${
                  isDark
                    ? 'bg-[#1C1B1A] text-stone-200 border-[#3F3B37]'
                    : 'bg-stone-900 text-stone-100 border-stone-800'
                }`}
              >
                Sign Out
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              className={`px-3 py-2 rounded-xl border flex items-center gap-2.5 ${
                isDark
                  ? 'bg-[#302D2A] border-[#3F3B37]'
                  : 'bg-[#F5F0E6]/80 border-[#E2DBD0]'
              }`}
            >
              <div className="h-7 w-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold text-xs shrink-0">
                {displayUsername.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold truncate ${isDark ? 'text-stone-200' : 'text-slate-800'}`}>
                  {displayUsername}
                </p>
                <div className={`flex items-center gap-1 text-[10px] ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                  <Shield className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="capitalize">{role} Portal</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile Overlay Content (Always expanded)
  const renderMobileSidebar = () => (
    <div
      className={`flex flex-col h-full w-64 p-4 border-r shadow-xl transition-colors duration-300 ${
        isDark
          ? 'bg-[#292623] border-[#3D3833] text-stone-100'
          : 'bg-[#FAF7F2] border-[#E8E2D8] text-stone-800'
      }`}
    >
      {/* Brand & Mobile close button */}
      <div
        className={`relative flex items-center justify-center py-5 px-4 mb-4 border-b ${
          isDark ? 'border-[#383430]' : 'border-[#E8E2D8]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-1.5 w-full text-center pr-6">
          <ZollidLogo className="h-7 sm:h-8" showTagline={false} />
          <p
            className={`text-xs font-semibold tracking-tight text-center transition-colors duration-200 ${
              isDark ? 'text-stone-300' : 'text-stone-700'
            }`}
          >
            Leave Management System
          </p>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className={`absolute right-1 top-2 p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-stone-400 hover:text-stone-100 hover:bg-[#33302C]'
                : 'text-stone-500 hover:text-stone-900 hover:bg-[#F2ECE1]'
            }`}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        <div className="px-2 mb-2 flex items-center justify-between">
          <p
            className={`text-[10px] uppercase tracking-widest font-bold ${
              isDark ? 'text-stone-400' : 'text-stone-500'
            }`}
          >
            Navigation
          </p>
          <span
            className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded border ${
              isDark
                ? 'text-stone-300 bg-[#302D29] border-[#3F3B37]'
                : 'text-stone-700 bg-[#F5F0E6] border-[#E2DBD0]'
            }`}
          >
            {role}
          </span>
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? isDark
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'bg-[#F2ECE1] text-blue-700 border border-[#E2DBD0] shadow-sm'
                    : isDark
                      ? 'text-stone-400 hover:bg-[#33302C] hover:text-stone-100 border border-transparent'
                      : 'text-stone-600 hover:bg-[#F2ECE1] hover:text-stone-900 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full" />
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? 'text-blue-500'
                        : isDark
                          ? 'text-stone-400 group-hover:text-stone-200'
                          : 'text-stone-500 group-hover:text-stone-800'
                    }`}
                  />
                  <span className="truncate">{link.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div
        className={`pt-4 border-t space-y-3 ${
          isDark ? 'border-[#383430]' : 'border-[#E8E2D8]'
        }`}
      >
        <div
          className={`px-3 py-2.5 rounded-xl border flex items-center gap-3 ${
            isDark
              ? 'bg-[#302D2A] border-[#3F3B37]'
              : 'bg-[#F5F0E6]/80 border-[#E2DBD0]'
          }`}
        >
          <div className="h-8 w-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold text-xs shrink-0">
            {displayUsername.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold truncate ${isDark ? 'text-stone-200' : 'text-slate-800'}`}>
              {displayUsername}
            </p>
            <div className={`flex items-center gap-1 text-[10px] ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
              <Shield className="w-3 h-3 text-blue-500 shrink-0" />
              <span className="capitalize">{role} Portal</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Fixed Desktop Sidebar */}
      <aside
        className={`hidden md:block h-screen sticky top-0 shrink-0 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {renderDesktopSidebar()}
      </aside>

      {/* Responsive Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className={`fixed inset-0 backdrop-blur-md transition-opacity duration-300 ${
              isDark ? 'bg-[#121110]/80' : 'bg-slate-900/40'
            }`}
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full w-64 animate-in slide-in-from-left duration-200">
            {renderMobileSidebar()}
          </div>
        </div>
      )}
    </>
  );
};
