import { Router } from 'express';
import {
  uploadPDF,
  getUsers,
  getSubscriptions,
  getDashboardStats,
  downloadUsersReport,
  downloadSubscriptionsReport,
  upload,
} from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

router.post('/upload-pdf', upload.single('pdf'), uploadPDF);
router.get('/users', getUsers);
router.get('/subscriptions', getSubscriptions);
router.get('/dashboard/stats', getDashboardStats);
router.get('/reports/users', downloadUsersReport);
router.get('/reports/subscriptions', downloadSubscriptionsReport);

export default router;

