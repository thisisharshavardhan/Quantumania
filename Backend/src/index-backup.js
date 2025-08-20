import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import routes and services
import quantumRoutes from './routers/quantumRoutes.js';
import dashboardRoutes from './routers/dashboardRoutes.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startJobMonitoring } from './services/jobMonitor.js';

dotenv.config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3849;
const isProduction = process.env.NODE_ENV === 'production';

// Enhanced CORS configuration - more permissive for development
const corsOptions = {
  origin: isProduction 
    ? (process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'])
    : true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Enhanced rate limiting for production
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    });
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(cors(corsOptions));
app.use('/api', limiter);
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint (before rate limiting)
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: process.memoryUsage(),
    pid: process.pid
  };
  
  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error.message;
    res.status(503).json(healthcheck);
  }
});

// Routes
app.use('/api/quantum', quantumRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Quantumania - IBM Quantum Computing Dashboard API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      quantum: '/api/quantum',
      dashboard: '/api/dashboard',
      health: '/health',
      docs: '/api-docs'
    },
    features: [
      'Real-time quantum job monitoring',
      'IBM Quantum device status',
      'Queue analytics',
      'WebSocket real-time updates'
    ],
    documentation: 'https://github.com/thisisharshavardhan/Quantumania'
  });
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    title: 'Quantumania API Documentation',
    version: '1.0.0',
    description: 'IBM Quantum Computing Dashboard API',
    baseUrl: `${req.protocol}://${req.get('host')}`,
    endpoints: {
      quantum: {
        base: '/api/quantum',
        jobs: {
          'GET /jobs': 'Get all quantum jobs',
          'GET /jobs/:jobId': 'Get specific job details',
          'GET /jobs/status/:status': 'Get jobs by status'
        },
        backends: {
          'GET /backends': 'Get all quantum backends',
          'GET /backends/:backendName': 'Get specific backend details',
          'GET /backends/:backendName/queue': 'Get backend queue status'
        },
        statistics: {
          'GET /stats': 'Get system statistics',
          'GET /stats/live': 'Get live statistics'
        }
      },
      dashboard: {
        base: '/api/dashboard',
        'GET /overview': 'Get dashboard overview',
        'GET /analytics': 'Get analytics data',
        'GET /realtime': 'Get real-time data'
      }
    }
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    available_endpoints: ['/api/quantum', '/api/dashboard', '/health', '/api-docs'],
    requested: req.originalUrl
  });
});

// Socket.io connection handling with enhanced error handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id} from ${socket.handshake.address}`);
  
  socket.on('join-room', (room) => {
    if (typeof room === 'string' && room.length < 50) {
      socket.join(room);
      logger.info(`Client ${socket.id} joined room: ${room}`);
    } else {
      logger.warn(`Invalid room name from ${socket.id}: ${room}`);
    }
  });

  socket.on('leave-room', (room) => {
    if (typeof room === 'string') {
      socket.leave(room);
      logger.info(`Client ${socket.id} left room: ${room}`);
    }
  });

  socket.on('error', (error) => {
    logger.error(`Socket error from ${socket.id}:`, error);
  });
  
  socket.on('disconnect', (reason) => {
    logger.info(`Client disconnected: ${socket.id} - Reason: ${reason}`);
  });
});

// Start job monitoring
(async () => {
  try {
    logger.info('Starting job monitoring...');
    startJobMonitoring(io);
    logger.info('Job monitoring started successfully');
  } catch (error) {
    logger.error('Failed to start job monitoring:', error.message);
    logger.error('Stack trace:', error.stack);
  }
})();

// Start server
server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
  logger.info(`🚀 Quantumania Backend Server started on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`� Dashboard API: http://localhost:${PORT}`);
  logger.info(`⚛️ Quantum API: http://localhost:${PORT}/api/quantum`);
  logger.info(`💓 Health Check: http://localhost:${PORT}/health`);
  logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close Socket.IO server
    io.close(() => {
      logger.info('Socket.IO server closed');
      
      // Exit process
      logger.info('Graceful shutdown completed');
      process.exit(0);
    });
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

export { app, io };
