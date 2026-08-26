import express from 'express';
import { getOwnerDashboard, createOrUpdateStore } from '../controllers/ownerController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Owner only routes
router.use(authenticateToken, authorizeRoles('STORE_OWNER', 'ADMIN'));

router.get('/dashboard', getOwnerDashboard);
router.post('/store', createOrUpdateStore);

export default router;
