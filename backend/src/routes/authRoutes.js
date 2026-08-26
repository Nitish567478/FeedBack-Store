import express from 'express';
import { signup, login, updatePassword, getMe } from '../controllers/authController.js';
import { validateRegister, validateLogin, validateUpdatePassword } from '../middleware/validateInput.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', validateRegister, signup);
router.post('/login', validateLogin, login);

// Authenticated routes
router.patch('/update-password', authenticateToken, validateUpdatePassword, updatePassword);
router.get('/me', authenticateToken, getMe);

export default router;
