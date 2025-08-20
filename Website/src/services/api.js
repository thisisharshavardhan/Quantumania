import axios from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('Unauthorized access');
          break;
        case 403:
          console.error('Forbidden access');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 429:
          console.error('Too many requests - rate limited');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error(`HTTP Error: ${status}`, data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - server not responding');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const quantumAPI = {
  // Jobs endpoints
  getJobs: (params = {}) => api.get('/api/quantum/jobs', { params }),
  getJobById: (jobId) => api.get(`/api/quantum/jobs/${jobId}`),
  getJobsByStatus: (status) => api.get(`/api/quantum/jobs/status/${status}`),
  
  // Backends endpoints
  getBackends: () => api.get('/api/quantum/backends'),
  getBackendDetails: (backendName) => api.get(`/api/quantum/backends/${backendName}`),
  getQueueStatus: (backendName) => api.get(`/api/quantum/backends/${backendName}/queue`),
  
  // Statistics endpoints
  getStats: () => api.get('/api/quantum/stats'),
  getLiveStats: () => api.get('/api/quantum/stats/live'),
  
  // Management endpoints
  triggerUpdate: () => api.post('/api/quantum/update'),
  clearCache: () => api.post('/api/quantum/cache/clear')
};

export const dashboardAPI = {
  // Dashboard endpoints
  getOverview: () => api.get('/api/dashboard/overview'),
  getAnalytics: (timeRange = '24h') => api.get('/api/dashboard/analytics', { 
    params: { timeRange } 
  }),
  getRealtimeData: () => api.get('/api/dashboard/realtime')
};

export const systemAPI = {
  // System endpoints
  getHealth: () => api.get('/health'),
  getApiInfo: () => api.get('/'),
  getQuantumApiInfo: () => api.get('/api/quantum')
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;
