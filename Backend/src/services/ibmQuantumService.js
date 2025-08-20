import axios from 'axios';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

// Load environment variables
dotenv.config();

class IBMQuantumService {
  constructor() {
    this.baseURL = 'https://api.quantum-computing.ibm.com/api';
    this.apiKey = process.env.IBM_QUANTUM_API;
    
    if (!this.apiKey) {
      logger.warn('IBM_QUANTUM_API key not found, using mock data mode');
      this.mockMode = true;
    } else {
      this.mockMode = false;
    }

    if (!this.mockMode) {
      this.client = axios.create({
        baseURL: this.baseURL,
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      this.setupInterceptors();
    }

    this.cache = new Map();
  }

  setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`Making request to: ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info(`Response received from: ${response.config.url}`);
        return response;
      },
      async (error) => {
        if (error.response?.status === 429) {
          logger.warn('Rate limit hit, waiting before retry...');
          await this.sleep(2000);
          return this.client.request(error.config);
        }
        
        if (error.response?.status === 401) {
          logger.error('Unauthorized - check your IBM Quantum API key');
        }
        
        logger.error('Response interceptor error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCacheKey(endpoint, params = {}) {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  setCache(key, data, ttl = 30000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  async getBackends() {
    try {
      if (this.mockMode) {
        return this.getMockBackends();
      }

      const cacheKey = this.getCacheKey('backends');
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await this.client.get('/Network/devices/v/1');
      const backends = response.data;
      
      this.setCache(cacheKey, backends, 60000); // Cache for 1 minute
      logger.info(`Fetched ${backends.length} backends from IBM Quantum`);
      
      return backends;
    } catch (error) {
      logger.error('Error fetching backends:', error.message);
      return this.getMockBackends();
    }
  }

  async getJobs(limit = 50, offset = 0, status = null) {
    try {
      if (this.mockMode) {
        return this.getMockJobs();
      }

      const params = { limit, offset };
      if (status) params.status = status;
      
      const cacheKey = this.getCacheKey('jobs', params);
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await this.client.get('/Network/jobs', { params });
      const jobs = response.data;
      
      this.setCache(cacheKey, jobs, 15000); // Cache for 15 seconds
      logger.info(`Fetched ${jobs.length} jobs from IBM Quantum`);
      
      return jobs;
    } catch (error) {
      logger.error('Error fetching jobs:', error.message);
      // Return mock data if API fails
      return this.getMockJobs();
    }
  }

  async getJobById(jobId) {
    try {
      const cacheKey = this.getCacheKey('job', { jobId });
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await this.client.get(`/Network/jobs/${jobId}`);
      const job = response.data;
      
      this.setCache(cacheKey, job, 10000); // Cache for 10 seconds
      return job;
    } catch (error) {
      logger.error(`Error fetching job ${jobId}:`, error.message);
      throw new Error(`Failed to fetch job: ${error.response?.data?.message || error.message}`);
    }
  }

  async getQueueStatus(backendName) {
    try {
      const cacheKey = this.getCacheKey('queue', { backendName });
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await this.client.get(`/Network/devices/v/1/${backendName}/queue/status`);
      const queueStatus = response.data;
      
      this.setCache(cacheKey, queueStatus, 5000); // Cache for 5 seconds
      return queueStatus;
    } catch (error) {
      logger.error(`Error fetching queue status for ${backendName}:`, error.message);
      return { length: 0, status: 'unknown' };
    }
  }

  async getSystemStats() {
    try {
      const backends = await this.getBackends();
      const jobs = await this.getJobs(100);
      
      const stats = {
        totalBackends: backends.length,
        onlineBackends: backends.filter(b => b.status?.operational === true).length,
        simulators: backends.filter(b => b.simulator === true).length,
        realDevices: backends.filter(b => b.simulator === false).length,
        totalJobs: jobs.length,
        runningJobs: jobs.filter(j => j.status === 'RUNNING').length,
        queuedJobs: jobs.filter(j => j.status === 'QUEUED').length,
        completedJobs: jobs.filter(j => j.status === 'COMPLETED').length,
        errorJobs: jobs.filter(j => j.status === 'ERROR').length,
        lastUpdate: new Date().toISOString()
      };
      
      return stats;
    } catch (error) {
      logger.error('Error fetching system stats:', error.message);
      return this.getMockStats();
    }
  }

  // Mock data for development/fallback
  getMockBackends() {
    return [
      {
        name: 'ibm_brisbane',
        status: { operational: true },
        n_qubits: 127,
        simulator: false,
        pending_jobs: 15,
        basis_gates: ['cx', 'id', 'rz', 'sx', 'x']
      },
      {
        name: 'ibm_kyoto',
        status: { operational: true },
        n_qubits: 127,
        simulator: false,
        pending_jobs: 23,
        basis_gates: ['cx', 'id', 'rz', 'sx', 'x']
      },
      {
        name: 'ibm_sherbrooke',
        status: { operational: false },
        n_qubits: 127,
        simulator: false,
        pending_jobs: 0,
        basis_gates: ['cx', 'id', 'rz', 'sx', 'x']
      },
      {
        name: 'ibmq_qasm_simulator',
        status: { operational: true },
        n_qubits: 32,
        simulator: true,
        pending_jobs: 5,
        basis_gates: ['u1', 'u2', 'u3', 'cx', 'id']
      }
    ];
  }

  getMockJobs() {
    const statuses = ['RUNNING', 'QUEUED', 'COMPLETED', 'ERROR', 'CANCELLED'];
    const backends = ['ibmq_qasm_simulator', 'ibm_brisbane', 'ibm_kyoto', 'ibm_sherbrooke'];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: `mock_job_${Date.now()}_${i}`,
      name: `Quantum Job ${i + 1}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      backend: backends[Math.floor(Math.random() * backends.length)],
      shots: Math.floor(Math.random() * 8192) + 1,
      qubits: Math.floor(Math.random() * 127) + 1,
      creation_date: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      queue_position: statuses.includes('QUEUED') ? Math.floor(Math.random() * 100) : null,
      estimated_completion_time: new Date(Date.now() + Math.random() * 3600000).toISOString()
    }));
  }

  getMockStats() {
    return {
      totalBackends: 12,
      onlineBackends: 8,
      simulators: 4,
      realDevices: 8,
      totalJobs: 150,
      runningJobs: 12,
      queuedJobs: 45,
      completedJobs: 88,
      errorJobs: 5,
      lastUpdate: new Date().toISOString()
    };
  }

  clearCache() {
    this.cache.clear();
    logger.info('Service cache cleared');
  }
}

export default new IBMQuantumService();
