import { Router } from 'express';
import { register, login, getMe, verifyEmployee, resetPassword } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, getMe);
router.post('/verify-employee', verifyEmployee);
router.post('/reset-password', resetPassword);

export default router;
