import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { findUserByUsername, findUserByEmail, findUserByEmailOrUsername, createUser, findUserById, verifyEmployeeAccount, resetEmployeePassword } from '../config/db.js';
import { generateToken, AuthRequest } from '../middleware/authMiddleware.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, username, companyEmail, email, password } = req.body;

    const trimmedFullName = (fullName || '').trim();
    const trimmedUsername = (username || '').trim().toLowerCase();
    const trimmedEmail = (companyEmail || email || '').trim().toLowerCase();

    if (!trimmedFullName || !trimmedUsername || !trimmedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Full Name, Username, Company Email, and Password) are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid company email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if trying to register as manager or manager email
    if (
      trimmedEmail === 'manager@zollid.in' ||
      trimmedEmail === 'manager@gcu.in' ||
      trimmedEmail.includes('manager') ||
      trimmedUsername.includes('manager')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Manager accounts cannot be created via public registration.'
      });
    }

    // Check duplicate username
    const existingUsername = await findUserByUsername(trimmedUsername);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: `Username '${trimmedUsername}' is already taken. Please choose another username.`
      });
    }

    // Check duplicate email
    const existingEmail = await findUserByEmail(trimmedEmail);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `An account with company email '${trimmedEmail}' already exists.`
      });
    }

    // Hash password with bcrypt
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert new employee user in DB / Supabase
    const userRecord = await createUser(trimmedUsername, trimmedFullName, trimmedEmail, hashedPassword, 'employee');

    const newUser = {
      id: userRecord.id,
      username: userRecord.username,
      fullName: userRecord.fullName,
      companyEmail: userRecord.companyEmail,
      role: 'employee' as const
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Employee account registered successfully.',
      token,
      user: newUser
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Server error during registration.'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const identifier = (username || email || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both login credential (email or username) and password.'
      });
    }

    const user = await findUserByEmailOrUsername(identifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password || '');
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    const authUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      companyEmail: user.companyEmail,
      role: user.role
    };

    const token = generateToken(authUser);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        companyEmail: user.companyEmail,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.'
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists. Please log in again.' });
    }

    return res.json({
      success: true,
      user
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmployee = async (req: Request, res: Response) => {
  try {
    const { username, companyEmail } = req.body;

    if (!username || !companyEmail) {
      return res.status(400).json({
        success: false,
        message: 'The provided information does not match any employee account.'
      });
    }

    const result = await verifyEmployeeAccount(username, companyEmail);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error('Verify employee error:', error);
    return res.status(400).json({
      success: false,
      message: 'The provided information does not match any employee account.'
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { username, companyEmail, newPassword, confirmPassword } = req.body;

    if (!username || !companyEmail || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username, Company Email, and New Password are required.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const result = await resetEmployeePassword(username, companyEmail, newPassword);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'The provided information does not match any employee account.'
    });
  }
};

