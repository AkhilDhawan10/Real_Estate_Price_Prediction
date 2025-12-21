import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  refreshToken,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Validation rules
const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticate, getProfile);
router.post('/refresh-token', refreshToken);

export default router;

