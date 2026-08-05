import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth.js';
import { leaveService } from '../services/leaveService.js';
import { LeaveRequest, LeaveStatus } from '../types.js';
import { formatDate } from '../utils/formatters.js';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  remarks?: string | null;
  timestamp: string;
  status?: LeaveStatus;
  created_at?: string;
}

const DISMISSED_KEY = 'zollid_dismissed_notifications_v1';

const getDismissedIds = (): number[] => {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setDismissedIdsInStorage = (ids: number[]) => {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save dismissed notifications:', err);
  }
};

export const useNotifications = () => {
  const { role, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>(getDismissedIds());

  const parseReason = (fullReason: string) => {
    if (!fullReason) return '';
    const match = fullReason.match(/^\[(.*?)\]\s*(.*)$/);
    return match ? match[2] || fullReason : fullReason;
  };

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      if (role === 'employee') {
        const data = await leaveService.getUnreadNotifications();
        if (data.success && data.notifications) {
          const list: AppNotification[] = data.notifications.map((notif: LeaveRequest) => {
            const isApproved = notif.status === 'Approved';
            const isPartial = notif.status === 'Partially Approved';
            
            let title = 'Leave Status Update';
            if (isApproved) title = 'Leave Application Approved';
            else if (isPartial) title = 'Leave Partially Approved';
            else if (notif.status === 'Rejected') title = 'Leave Application Rejected';

            const cleanReason = parseReason(notif.leave_reason);

            return {
              id: notif.id,
              title,
              message: `Your request for "${cleanReason}" (${formatDate(notif.start_date)} - ${formatDate(notif.end_date)}) was marked as ${notif.status}.`,
              remarks: notif.remarks,
              timestamp: notif.created_at ? formatDate(notif.created_at) : 'Recently',
              status: notif.status
            };
          });

          setNotifications(list);
        }
      } else if (role === 'manager') {
        // Manager sees pending leave applications requiring action
        const data = await leaveService.getAllLeaves({ status: 'Pending' });
        if (data.success && data.leaves) {
          const list: AppNotification[] = data.leaves.map((leave: LeaveRequest) => {
            const cleanEmp = leave.employee_name || leave.employee_username || 'Employee';
            const cleanReason = parseReason(leave.leave_reason);

            return {
              id: leave.id,
              title: 'Pending Leave Application',
              message: `${cleanEmp} submitted a leave request for "${cleanReason}" (${formatDate(leave.start_date)} to ${formatDate(leave.end_date)}).`,
              remarks: leave.remarks,
              timestamp: leave.created_at ? formatDate(leave.created_at) : 'Pending Review',
              status: 'Pending'
            };
          });

          setNotifications(list);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter out dismissed notifications
  const visibleNotifications = notifications.filter((n) => !dismissedIds.includes(n.id));

  const dismissNotification = (id: number) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    setDismissedIdsInStorage(updated);
  };

  const markAllAsRead = async () => {
    if (role === 'employee') {
      try {
        await leaveService.markNotificationsRead();
      } catch (err) {
        console.error(err);
      }
    }
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...dismissedIds, ...allIds]));
    setDismissedIds(updated);
    setDismissedIdsInStorage(updated);
  };

  const clearAll = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...dismissedIds, ...allIds]));
    setDismissedIds(updated);
    setDismissedIdsInStorage(updated);
  };

  return {
    notifications: visibleNotifications,
    unreadNotifications: visibleNotifications,
    unreadCount: visibleNotifications.length,
    fetchUnreadNotifications: fetchNotifications,
    dismissNotification,
    markAllAsRead,
    clearAll
  };
};
