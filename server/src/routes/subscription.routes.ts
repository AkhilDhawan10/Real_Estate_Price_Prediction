import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getSubscription,
  getPlans,
  createTestSubscription,
} from '../controllers/subscription.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/plans', getPlans);
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/status', getSubscription);
// Dev test route to create subscription without Razorpay
router.post('/create-test', createTestSubscription);

export default router;

