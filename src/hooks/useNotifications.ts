import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth.js';
import { leaveService } from '../services/leaveService.js';
import { LeaveRequest } from '../types.js';

export const useNotifications = () => {
  const { user, role, isAuthenticated } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState<LeaveRequest[]>([]);
  const [hasCheckedOnLogin, setHasCheckedOnLogin] = useState(false);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!isAuthenticated || role !== 'employee') return;

    try {
      const data = await leaveService.getUnreadNotifications();
      if (data.success && data.notifications) {
        setUnreadNotifications(data.notifications);

        // If newly logged in or newly fetched unread items, pop up toast notifications
        if (data.notifications.length > 0 && !hasCheckedOnLogin) {
          data.notifications.forEach((notif) => {
            const isApproved = notif.status === 'Approved';
            const message = isApproved
              ? `Your leave request for "${notif.leave_reason}" was APPROVED!`
              : `Your leave request for "${notif.leave_reason}" was REJECTED.`;

            const remarksMsg = notif.remarks ? ` Remarks: "${notif.remarks}"` : '';

            if (isApproved) {
              toast.success(`${message}${remarksMsg}`, { duration: 6000 });
            } else {
              toast.error(`${message}${remarksMsg}`, { duration: 6000 });
            }
          });
          setHasCheckedOnLogin(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
    }
  }, [isAuthenticated, role, hasCheckedOnLogin]);

  useEffect(() => {
    fetchUnreadNotifications();
  }, [fetchUnreadNotifications]);

  const markAllAsRead = async () => {
    if (!isAuthenticated || role !== 'employee') return;
    try {
      await leaveService.markNotificationsRead();
      setUnreadNotifications([]);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  return {
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    fetchUnreadNotifications,
    markAllAsRead
  };
};
