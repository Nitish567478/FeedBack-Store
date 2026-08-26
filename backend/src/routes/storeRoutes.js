import express from 'express';
import jwt from 'jsonwebtoken';
import { getStoresForUser, submitRating } from '../controllers/storeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRating } from '../middleware/validateInput.js';

const router = express.Router();

// Optional token extraction for store listing
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    const jwtSecret = process.env.JWT_SECRET || 'feedback_store_jwt_secret_key_secure_2026';
    jwt.verify(token, jwtSecret, (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
};

// List stores
router.get('/', optionalAuthenticate, getStoresForUser);

// Submit or modify rating for a store
router.post('/:storeId/rate', authenticateToken, validateRating, submitRating);

export default router;
