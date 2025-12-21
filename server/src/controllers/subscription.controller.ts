import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Subscription from '../models/Subscription.model';
import { AuthRequest } from '../middlewares/auth.middleware';

// Initialize Razorpay only if keys are provided
const getRazorpayInstance = (): Razorpay | null => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret || keyId.trim() === '' || keySecret.trim() === '') {
    return null;
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const razorpay = getRazorpayInstance();

const PLAN_PRICES = {
  monthly: 999, // ₹999 per month
  quarterly: 2499, // ₹2499 per quarter (discounted)
};

export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { planType } = req.body;

    if (!planType || !['monthly', 'quarterly'].includes(planType)) {
      res.status(400).json({ message: 'Invalid plan type' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const amount = PLAN_PRICES[planType as keyof typeof PLAN_PRICES] * 100; // Convert to paise

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: req.user.id,
      isActive: true,
    });

    if (existingSubscription && new Date() < existingSubscription.expiryDate) {
      res.status(400).json({
        message: 'You already have an active subscription',
        subscription: existingSubscription,
      });
      return;
    }

    // Check if Razorpay is configured
    if (!razorpay) {
      res.status(503).json({
        message: 'Payment service is not configured. Please contact administrator.',
      });
      return;
    }

    // Create Razorpay order
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${req.user.id}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        planType,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planType,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({
      message: 'Error creating payment order',
      error: error.message,
    });
  }
};

export const verifyPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { orderId, paymentId, signature, planType } = req.body;

    if (!orderId || !paymentId || !signature || !planType) {
      res.status(400).json({ message: 'Missing payment details' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Verify signature
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(text)
      .digest('hex');

    if (generatedSignature !== signature) {
      res.status(400).json({ message: 'Invalid payment signature' });
      return;
    }

    // Calculate expiry date
    const startDate = new Date();
    const expiryDate = new Date();
    if (planType === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (planType === 'quarterly') {
      expiryDate.setMonth(expiryDate.getMonth() + 3);
    }

    // Deactivate old subscriptions
    await Subscription.updateMany(
      { user: req.user.id, isActive: true },
      { isActive: false }
    );

    // Create new subscription
    const subscription = await Subscription.create({
      user: req.user.id,
      planType,
      paymentId: `pay_${paymentId}`,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      amount: PLAN_PRICES[planType as keyof typeof PLAN_PRICES],
      startDate,
      expiryDate,
      isActive: true,
    });

    res.json({
      message: 'Payment verified and subscription activated',
      subscription: {
        id: subscription._id,
        planType: subscription.planType,
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
        isActive: subscription.isActive,
      },
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};

export const getSubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const subscription = await Subscription.findOne({
      user: req.user.id,
      isActive: true,
    }).populate('user', 'fullName email');

    if (!subscription) {
      res.status(404).json({
        message: 'No active subscription found',
        hasSubscription: false,
      });
      return;
    }

    // Check if expired
    const isExpired = new Date() > subscription.expiryDate;
    if (isExpired) {
      await Subscription.updateOne(
        { _id: subscription._id },
        { isActive: false }
      );
      res.status(404).json({
        message: 'Subscription has expired',
        hasSubscription: false,
      });
      return;
    }

    res.json({
      subscription: {
        id: subscription._id,
        planType: subscription.planType,
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
        isActive: subscription.isActive,
        daysRemaining: Math.ceil(
          (subscription.expiryDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
      hasSubscription: true,
    });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      message: 'Error fetching subscription',
      error: error.message,
    });
  }
};

export const getPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    plans: [
      {
        type: 'monthly',
        name: 'Monthly Plan',
        price: PLAN_PRICES.monthly,
        duration: '1 month',
        features: ['Access to all properties', 'Monthly updates', 'Email support'],
      },
      {
        type: 'quarterly',
        name: 'Quarterly Plan',
        price: PLAN_PRICES.quarterly,
        duration: '3 months',
        savings: PLAN_PRICES.monthly * 3 - PLAN_PRICES.quarterly,
        features: [
          'Access to all properties',
          'Monthly updates',
          'Priority support',
          'Save ₹498',
        ],
      },
    ],
  });
};

// Dev helper: create a subscription without Razorpay (only allowed outside production)
export const createTestSubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ message: 'Not allowed in production' });
      return;
    }

    const { planType } = req.body;
    if (!planType || !['monthly', 'quarterly'].includes(planType)) {
      res.status(400).json({ message: 'Invalid plan type' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Deactivate old subscriptions
    await Subscription.updateMany({ user: req.user.id, isActive: true }, { isActive: false });

    const startDate = new Date();
    const expiryDate = new Date(startDate);
    if (planType === 'monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
    else expiryDate.setMonth(expiryDate.getMonth() + 3);

    const subscription = await Subscription.create({
      user: req.user.id,
      planType,
      paymentId: `test_${Date.now()}`,
      amount: PLAN_PRICES[planType as keyof typeof PLAN_PRICES],
      startDate,
      expiryDate,
      isActive: true,
    });

    res.json({ message: 'Test subscription created', subscription: {
      id: subscription._id,
      planType: subscription.planType,
      startDate: subscription.startDate,
      expiryDate: subscription.expiryDate,
      isActive: subscription.isActive,
    }});
  } catch (error: any) {
    console.error('Create test subscription error:', error);
    res.status(500).json({ message: 'Error creating test subscription', error: error.message });
  }
};

