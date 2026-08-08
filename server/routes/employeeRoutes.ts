import { Router } from 'express';
import { getAllEmployees, getDepartments } from '../controllers/employeeController.js';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/departments', authenticateJWT, getDepartments);
router.get('/', authenticateJWT, requireRole('manager'), getAllEmployees);

export default router;

