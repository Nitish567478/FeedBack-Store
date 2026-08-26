import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health Check & Root
app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'Roxiler backend running' });
});
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FeedBack Store API'
  });
});

import { getStoresForUser, submitRating } from './controllers/storeController.js';
import { authenticateToken } from './middleware/authMiddleware.js';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/owner', ownerRoutes);

// Compatibility aliases for /api/user
app.get('/api/user/stores', (req, res, next) => {
  getStoresForUser(req, res, next);
});
app.post('/api/user/ratings', authenticateToken, (req, res, next) => {
  req.params.storeId = req.body.store_id || req.body.storeId;
  submitRating(req, res, next);
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FeedBack Store API server running on http://localhost:${PORT}`);
});

export default app;
