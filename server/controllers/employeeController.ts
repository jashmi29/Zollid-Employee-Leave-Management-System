import { Response } from 'express';
import { getAllEmployeesWithStats } from '../config/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getAllEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;

    const employees = await getAllEmployeesWithStats(search as string);

    return res.json({
      success: true,
      employees
    });
  } catch (error: any) {
    console.error('Get employees error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
