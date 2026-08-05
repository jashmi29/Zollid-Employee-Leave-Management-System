import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../hooks/useTheme.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { LeaveStatusBadge } from './LeaveStatusBadge.js';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Inbox
} from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const { notifications, unreadCount, markAllAsRead, clearAll, dismissNotification } = useNotifications();

  // Escape key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Full Screen Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-out Notification Drawer Taking Right Half (w-full md:w-1/2 lg:w-[500px]) */}
      <div
        className={`fixed inset-y-0 right-0 z-[10000] w-full md:w-1/2 lg:w-[500px] h-full flex flex-col shadow-2xl border-l transition-all transform duration-300 animate-in slide-in-from-right ease-out ${
          isDark
            ? 'bg-[#22201D] border-[#3F3B37] text-stone-100'
            : 'bg-[#FCFAF7] border-[#E2DBD0] text-stone-900'
        }`}
      >
        {/* Panel Top Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-[#3F3B37] bg-[#1C1A18]' : 'border-[#E8E2D8] bg-[#F5F0E6]'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg font-black tracking-tight">Notification Center</h2>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-rose-500 text-white shadow-xs">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Real-time leave status updates & workspace requests
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
              isDark
                ? 'text-stone-400 hover:text-white bg-[#2B2825] hover:bg-[#36322E] border-[#3F3B37]'
                : 'text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border-stone-200'
            }`}
            title="Close Notification Panel (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        {notifications.length > 0 && (
          <div
            className={`px-6 py-3 border-b flex items-center justify-between shrink-0 text-xs font-semibold ${
              isDark ? 'border-[#33302C] bg-[#22201D]/80' : 'border-[#EFE9DF] bg-[#FAF6EE]'
            }`}
          >
            <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>
              Showing {notifications.length} notification{notifications.length > 1 ? 's' : ''}
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={markAllAsRead}
                className="px-3 py-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center space-x-1.5 transition-colors rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 cursor-pointer"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>

              <button
                type="button"
                onClick={clearAll}
                className={`px-3 py-1.5 text-xs font-bold flex items-center space-x-1.5 transition-colors rounded-xl border cursor-pointer ${
                  isDark
                    ? 'text-stone-400 hover:text-rose-400 bg-[#2B2825] hover:bg-rose-500/10 border-[#3F3B37] hover:border-rose-500/30'
                    : 'text-stone-600 hover:text-rose-600 bg-stone-100 hover:bg-rose-50 border-stone-200 hover:border-rose-200'
                }`}
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Notifications List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {notifications.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-stone-500/10 border border-stone-500/20 text-stone-400 flex items-center justify-center mx-auto shadow-inner">
                <Inbox className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className={`text-base font-extrabold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                  No notifications
                </h3>
                <p className={`text-xs max-w-xs mx-auto ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                  You're all caught up! New leave requests and approval updates will appear here.
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all relative group shadow-sm hover:shadow-md ${
                  isDark
                    ? 'bg-[#1C1A18] border-[#383430] hover:border-[#48433E]'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Dismiss (✕) Button */}
                <button
                  type="button"
                  onClick={() => dismissNotification(notif.id)}
                  className={`absolute top-4 right-4 p-1.5 rounded-xl transition-colors cursor-pointer ${
                    isDark
                      ? 'text-stone-500 hover:text-stone-200 hover:bg-[#2B2825]'
                      : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100'
                  }`}
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="pr-8 space-y-3">
                  {/* Status Badge & Timestamp */}
                  <div className="flex items-center justify-between gap-2">
                    {notif.status ? (
                      <LeaveStatusBadge status={notif.status} size="sm" />
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                        Notification
                      </span>
                    )}

                    <span className={`text-[11px] font-mono ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      {notif.timestamp}
                    </span>
                  </div>

                  {/* Notification Title */}
                  <h4 className={`text-sm font-extrabold leading-snug ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                    {notif.title}
                  </h4>

                  {/* Message Body */}
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                    {notif.message}
                  </p>

                  {/* Remarks Box if present */}
                  {notif.remarks && (
                    <div
                      className={`p-3 rounded-xl border text-xs italic ${
                        isDark
                          ? 'bg-[#151413] border-[#33302C] text-stone-300'
                          : 'bg-stone-50 border-stone-200 text-stone-800'
                      }`}
                    >
                      <span className="font-bold not-italic text-stone-400">Manager Remarks:</span> "{notif.remarks}"
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

