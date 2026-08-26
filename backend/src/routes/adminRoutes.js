import express from 'express';
import {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getStores
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateCreateUser, validateCreateStore } from '../middleware/validateInput.js';

const router = express.Router();

// Admin only routes
router.use(authenticateToken, authorizeRoles('ADMIN'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/dashboard', getDashboardStats);
router.post('/users', validateCreateUser, createUser);
router.post('/stores', validateCreateStore, createStore);
router.get('/users', getUsers);
router.get('/stores', getStores);

export default router;
