import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    
    console.log('🔐 Auth check:', {
      hasAuthHeader: !!authHeader,
      authHeader: authHeader ? authHeader.substring(0, 30) + '...' : 'none',
      jwtSecret: jwtSecret.substring(0, 20) + '...'
    });

    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.warn('❌ No token provided');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
      role: string;
    };

    console.log('✅ Token decoded:', { userId: decoded.id, email: decoded.email });

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      console.warn('❌ User not found or inactive:', decoded.id);
      res.status(401).json({ message: 'User not found or inactive' });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    console.log('✅ User authenticated:', { email: user.email, role: user.role });
    next();
  } catch (error: any) {
    console.error('❌ Auth middleware error:', error.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
};

