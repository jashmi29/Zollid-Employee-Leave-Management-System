import { Router } from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  getUnreadNotifications,
  markNotificationsRead,
  deleteLeave,
  getLeaveTypes,
  getLeaveBalances,
  getCompanyHolidays,
  getCompanyPolicies
} from '../controllers/leaveController.js';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware.js';
import { uploadDocument } from '../middleware/uploadMiddleware.js';

const router = Router();

// Shared public metadata routes (authenticated)
router.get('/types', authenticateJWT, getLeaveTypes);
router.get('/balances', authenticateJWT, getLeaveBalances);
router.get('/holidays', authenticateJWT, getCompanyHolidays);
router.get('/policies', authenticateJWT, getCompanyPolicies);

// Employee routes
router.post('/', authenticateJWT, requireRole('employee'), uploadDocument.single('document'), applyLeave);
router.get('/my', authenticateJWT, requireRole('employee'), getMyLeaves);
router.get('/notifications/unread', authenticateJWT, requireRole('employee'), getUnreadNotifications);
router.put('/notifications/read', authenticateJWT, requireRole('employee'), markNotificationsRead);

// Manager routes
router.get('/', authenticateJWT, requireRole('manager'), getAllLeaves);
router.put('/:id/status', authenticateJWT, requireRole('manager'), updateLeaveStatus);

// Shared/delete route
router.delete('/:id', authenticateJWT, deleteLeave);

export default router;

