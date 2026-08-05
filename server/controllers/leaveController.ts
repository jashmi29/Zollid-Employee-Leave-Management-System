import { Response } from 'express';
import {
  createLeaveRequest,
  getLeavesByEmployeeId,
  getAllLeaves as dbGetAllLeaves,
  getLeaveById,
  updateLeaveStatus as dbUpdateLeaveStatus,
  getUnreadNotifications as dbGetUnreadNotifications,
  markNotificationsRead as dbMarkNotificationsRead,
  deleteLeaveRequest
} from '../config/db.js';
import { uploadAttachmentToSupabase } from '../config/storage.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const applyLeave = async (req: AuthRequest, res: Response) => {
  try {
    const { leave_reason, start_date, end_date } = req.body;
    const employee_id = req.user?.id;

    if (!employee_id) {
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    if (!leave_reason || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Leave reason, start date, and end date are required fields.'
      });
    }

    // Validate dates
    const start = new Date(start_date);
    const end = new Date(end_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided.'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be prior to the start date.'
      });
    }

    // File handling with Supabase Storage
    let document_url: string | null = null;
    if (req.file) {
      document_url = await uploadAttachmentToSupabase(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    }

    const newLeave = await createLeaveRequest({
      employee_id,
      leave_reason: leave_reason.trim(),
      start_date,
      end_date,
      document_url
    });

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully.',
      leave: newLeave
    });
  } catch (error: any) {
    console.error('Apply leave error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error submitting leave request.'
    });
  }
};

export const getMyLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const employee_id = req.user?.id;
    if (!employee_id) {
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const leaves = await getLeavesByEmployeeId(employee_id);

    return res.json({
      success: true,
      leaves
    });
  } catch (error: any) {
    console.error('Get my leaves error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;

    const leaves = await dbGetAllLeaves({
      status: status as string,
      search: search as string
    });

    return res.json({
      success: true,
      leaves
    });
  } catch (error: any) {
    console.error('Get all leaves error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remarks, approved_start_date, approved_end_date } = req.body;

    const validStatuses = ['Approved', 'Partially Approved', 'Rejected', 'Pending'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "Approved", "Partially Approved", "Rejected", or "Pending".'
      });
    }

    const leaveId = parseInt(id, 10);
    const leave = await getLeaveById(leaveId);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    // Validate approved dates if provided
    let appStart = approved_start_date || null;
    let appEnd = approved_end_date || null;

    if (status === 'Partially Approved') {
      if (!appStart || !appEnd) {
        return res.status(400).json({
          success: false,
          message: 'Approved start and end dates are required for Partial Approval.'
        });
      }
    }

    const updatedLeave = await dbUpdateLeaveStatus(leaveId, status, remarks, appStart, appEnd);

    return res.json({
      success: true,
      message: `Leave request status updated to ${status}.`,
      leave: updatedLeave
    });
  } catch (error: any) {
    console.error('Update leave status error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnreadNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const employee_id = req.user?.id;
    if (!employee_id) {
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const notifications = await dbGetUnreadNotifications(employee_id);

    return res.json({
      success: true,
      notifications
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    const employee_id = req.user?.id;
    if (!employee_id) {
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    await dbMarkNotificationsRead(employee_id);

    return res.json({
      success: true,
      message: 'Notifications marked as read.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLeave = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const leaveId = parseInt(id, 10);
    const leave = await getLeaveById(leaveId);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    // Only allow employee to delete if it's their own and Pending, OR manager can delete
    if (userRole === 'employee' && leave.employee_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this request.' });
    }

    await deleteLeaveRequest(leaveId);

    return res.json({
      success: true,
      message: 'Leave request deleted successfully.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
