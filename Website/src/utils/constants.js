// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3849',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};

// Job Status Constants
export const JOB_STATUS = {
  RUNNING: 'RUNNING',
  QUEUED: 'QUEUED',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
  CANCELLED: 'CANCELLED'
};

// Job Status Colors
export const JOB_STATUS_COLORS = {
  [JOB_STATUS.RUNNING]: '#059669',
  [JOB_STATUS.QUEUED]: '#d97706',
  [JOB_STATUS.COMPLETED]: '#3b82f6',
  [JOB_STATUS.ERROR]: '#dc2626',
  [JOB_STATUS.CANCELLED]: '#6b7280'
};

// Backend Status
export const BACKEND_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};

// WebSocket Events
export const SOCKET_EVENTS = {
  DASHBOARD_UPDATE: 'dashboard-update',
  JOB_STATUS_CHANGE: 'job-status-change',
  NEW_JOBS: 'new-jobs',
  QUEUE_UPDATE: 'queue-update',
  SYSTEM_STATS_UPDATE: 'system-stats-update',
  MONITOR_ERROR: 'monitor-error'
};

// Time Ranges for Analytics
export const TIME_RANGES = {
  '1h': '1 Hour',
  '6h': '6 Hours',
  '24h': '24 Hours',
  '7d': '7 Days'
};

// Default Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  DEFAULT_OFFSET: 0,
  LIMITS: [20, 50, 100]
};

// Feature Flags
export const FEATURES = {
  REAL_TIME_ENABLED: import.meta.env.VITE_ENABLE_REAL_TIME === 'true',
  DEBUG_LOGS_ENABLED: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true'
};

// Format helpers
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

export const formatNumber = (number) => {
  if (typeof number !== 'number') return '0';
  return number.toLocaleString();
};

export const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};
