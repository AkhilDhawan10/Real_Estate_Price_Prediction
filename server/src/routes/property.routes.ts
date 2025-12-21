import { Router } from 'express';
import {
  searchProperties,
  getPropertyById,
  getPropertyStats,
} from '../controllers/property.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireActiveSubscription } from '../middlewares/subscription.middleware';

const router = Router();

// All routes require authentication and active subscription
router.use(authenticate);
router.use(requireActiveSubscription);

router.get('/search', searchProperties);
router.get('/stats', getPropertyStats);
router.get('/:id', getPropertyById);

export default router;

