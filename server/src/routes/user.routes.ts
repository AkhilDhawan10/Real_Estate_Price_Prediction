import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getProfile } from '../controllers/auth.controller';

const router = Router();

router.use(authenticate);
router.get('/profile', getProfile);

export default router;

