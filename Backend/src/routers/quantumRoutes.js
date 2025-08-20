import express from 'express';
import { query, param } from 'express-validator';
import quantumController from '../controllers/quantumController.js';

const router = express.Router();

// Validation middleware
const validateJobsQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Limit must be between 1 and 200'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative'),
  query('status')
    .optional()
    .isIn(['RUNNING', 'QUEUED', 'COMPLETED', 'ERROR', 'CANCELLED'])
    .withMessage('Invalid status'),
  query('cached')
    .optional()
    .isBoolean()
    .withMessage('Cached must be a boolean')
];

const validateJobId = [
  param('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Job ID length invalid')
];

const validateBackendName = [
  param('backendName')
    .notEmpty()
    .withMessage('Backend name is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Invalid backend name format')
];

const validateStatus = [
  param('status')
    .isIn(['RUNNING', 'QUEUED', 'COMPLETED', 'ERROR', 'CANCELLED'])
    .withMessage('Invalid status')
];

// Job routes
router.get('/jobs', validateJobsQuery, quantumController.getJobs);
router.get('/jobs/status/:status', validateStatus, quantumController.getJobsByStatus);
router.get('/jobs/:jobId', validateJobId, quantumController.getJobById);

// Backend routes
router.get('/backends', quantumController.getBackends);
router.get('/backends/:backendName', validateBackendName, quantumController.getBackendDetails);
router.get('/backends/:backendName/queue', validateBackendName, quantumController.getQueueStatus);

// Statistics routes
router.get('/stats', quantumController.getSystemStats);
router.get('/stats/live', quantumController.getLiveStats);

// Management routes
router.post('/update', quantumController.triggerUpdate);
router.post('/cache/clear', quantumController.clearCache);

export default router;
