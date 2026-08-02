import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'employee-leave-management-system-secret-key-2026';

export interface AuthenticatedUser {
  id: number;
  username: string;
  role: 'employee' | 'manager';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token is missing or invalid.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token. Please log in again.' });
  }
};

export const requireRole = (role: 'employee' | 'manager') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized access. Please log in.' });
    }

    if (role === 'manager') {
      if (req.user.role !== 'manager') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. Manager Portal routes are accessible only to manager accounts.'
        });
      }
    } else if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This action requires ${role} privileges.`
      });
    }

    next();
  };
};

export const generateToken = (user: AuthenticatedUser): string => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};
