import express from 'express';
import { query } from 'express-validator';
import dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

// Validation middleware
const validateTimeRange = [
  query('timeRange')
    .optional()
    .isIn(['1h', '6h', '24h', '7d'])
    .withMessage('Invalid time range. Use: 1h, 6h, 24h, or 7d')
];

// Dashboard routes
router.get('/overview', dashboardController.getOverview);
router.get('/analytics', validateTimeRange, dashboardController.getAnalytics);
router.get('/realtime', dashboardController.getRealtimeData);

export default router;
