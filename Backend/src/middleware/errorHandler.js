import { logger } from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error in ${req.method} ${req.originalUrl}:`, {
    error: err.message,
    stack: err.stack,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Default error
  let error = {
    success: false,
    error: 'Internal Server Error',
    message: 'Something went wrong on our end',
    timestamp: new Date().toISOString()
  };

  let statusCode = 500;

  // Validation errors from express-validator
  if (err.name === 'ValidationError' || err.type === 'validation') {
    statusCode = 400;
    error = {
      success: false,
      error: 'Validation Error',
      message: 'Invalid input data',
      details: err.details || err.message,
      timestamp: new Date().toISOString()
    };
  }

  // MongoDB/Database errors
  if (err.name === 'MongoError' || err.name === 'CastError') {
    statusCode = 400;
    error = {
      success: false,
      error: 'Database Error',
      message: 'Invalid data format',
      timestamp: new Date().toISOString()
    };
  }

  // JWT/Authentication errors
  if (err.name === 'JsonWebTokenError' || err.name === 'UnauthorizedError') {
    statusCode = 401;
    error = {
      success: false,
      error: 'Authentication Error',
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString()
    };
  }

  // Rate limiting errors
  if (err.type === 'rate-limit') {
    statusCode = 429;
    error = {
      success: false,
      error: 'Rate Limit Exceeded',
      message: 'Too many requests, please try again later',
      retryAfter: err.retryAfter || 60,
      timestamp: new Date().toISOString()
    };
  }

  // Axios/HTTP errors from external APIs
  if (err.isAxiosError) {
    statusCode = err.response?.status || 502;
    error = {
      success: false,
      error: 'External API Error',
      message: 'Failed to communicate with external service',
      details: process.env.NODE_ENV === 'development' ? err.response?.data : undefined,
      timestamp: new Date().toISOString()
    };
  }

  // Custom application errors
  if (err.isOperational) {
    statusCode = err.statusCode || 400;
    error = {
      success: false,
      error: err.name || 'Application Error',
      message: err.message,
      timestamp: new Date().toISOString()
    };
  }

  // Add more details in development mode
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.details = {
      ...error.details,
      originalError: err.message
    };
  }

  // Send error response
  res.status(statusCode).json(error);
};

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400);
    this.details = details;
    this.type = 'validation';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Rate limit exceeded', 429);
    this.retryAfter = retryAfter;
    this.type = 'rate-limit';
  }
}

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export {
  errorHandler,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  asyncHandler
};
