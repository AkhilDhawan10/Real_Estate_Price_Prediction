import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User.model';
import { generateToken, generateRefreshToken } from '../utils/jwt.util';
import { appendUserToExcel } from '../utils/excel.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { fullName, phoneNumber, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      res.status(400).json({
        message: 'User with this email or phone number already exists',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      phoneNumber,
      email,
      password: hashedPassword,
      role: 'broker',
    });

    // Append to Excel file
    try {
      await appendUserToExcel({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (excelError) {
      console.error('Error appending to Excel:', excelError);
      // Don't fail registration if Excel write fails
    }

    // Generate tokens
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering user',
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({ message: 'Account is inactive' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate tokens
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: error.message,
    });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token required' });
      return;
    }

    const { verifyRefreshToken } = await import('../utils/jwt.util');
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const newToken = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.json({
      token: newToken,
    });
  } catch (error: any) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

