import { Response, NextFunction } from 'express';
import Subscription from '../models/Subscription.model';
import { AuthRequest } from './auth.middleware';

export const requireActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Admins don't need subscription
    if (req.user.role === 'admin') {
      next();
      return;
    }

    const subscription = await Subscription.findOne({
      user: req.user.id,
      isActive: true,
    });

    if (!subscription) {
      res.status(403).json({
        message: 'Active subscription required to access this feature',
        code: 'NO_SUBSCRIPTION',
      });
      return;
    }

    // Check if subscription is expired
    if (new Date() > subscription.expiryDate) {
      await Subscription.updateOne(
        { _id: subscription._id },
        { isActive: false }
      );
      res.status(403).json({
        message: 'Your subscription has expired. Please renew to continue.',
        code: 'SUBSCRIPTION_EXPIRED',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking subscription status' });
  }
};

