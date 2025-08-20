import ibmQuantumService from '../services/ibmQuantumService.js';
import { getJobCache, getLastUpdate, triggerManualUpdate, getMonitoringStatus } from '../services/jobMonitor.js';
import { logger } from '../utils/logger.js';
import { validationResult } from 'express-validator';

class QuantumController {
  
  async getJobs(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { 
        limit = 50, 
        offset = 0, 
        status, 
        backend,
        cached = false 
      } = req.query;
      
      let jobs;
      
      if (cached === 'true') {
        // Return cached jobs from monitoring service
        jobs = getJobCache();
        
        // Apply filters to cached data
        if (status) {
          jobs = jobs.filter(job => job.status === status.toUpperCase());
        }
        if (backend) {
          jobs = jobs.filter(job => job.backend === backend);
        }
        
        // Apply pagination
        const start = parseInt(offset);
        const end = start + parseInt(limit);
        jobs = jobs.slice(start, end);
      } else {
        // Fetch fresh data from IBM Quantum
        jobs = await ibmQuantumService.getJobs(parseInt(limit), parseInt(offset), status);
        
        if (backend) {
          jobs = jobs.filter(job => job.backend === backend);
        }
      }

      res.json({
        success: true,
        data: jobs,
        meta: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: jobs.length,
          cached: cached === 'true',
          lastUpdate: getLastUpdate(),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error in getJobs:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch quantum jobs',
        message: error.message
      });
    }
  }

  async getJobById(req, res) {
    try {
      const { jobId } = req.params;
      
      // First check cache
      const cachedJobs = getJobCache();
      const cachedJob = cachedJobs.find(job => job.id === jobId);
      
      if (cachedJob) {
        return res.json({
          success: true,
          data: cachedJob,
          source: 'cache',
          timestamp: new Date().toISOString()
        });
      }
      
      // If not in cache, fetch from API
      const job = await ibmQuantumService.getJobById(jobId);
      
      res.json({
        success: true,
        data: job,
        source: 'api',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error in getJobById for ${req.params.jobId}:`, error.message);
      res.status(404).json({
        success: false,
        error: 'Job not found',
        message: error.message
      });
    }
  }

  async getBackends(req, res) {
    try {
      const { includeSimulators = true, onlyOperational = false } = req.query;
      
      let backends = await ibmQuantumService.getBackends();
      
      // Apply filters
      if (includeSimulators === 'false') {
        backends = backends.filter(backend => !backend.simulator);
      }
      
      if (onlyOperational === 'true') {
        backends = backends.filter(backend => backend.status?.operational === true);
      }

      res.json({
        success: true,
        data: backends,
        meta: {
          total: backends.length,
          filters: {
            includeSimulators: includeSimulators !== 'false',
            onlyOperational: onlyOperational === 'true'
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error in getBackends:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch backends',
        message: error.message
      });
    }
  }

  async getBackendDetails(req, res) {
    try {
      const { backendName } = req.params;
      const backends = await ibmQuantumService.getBackends();
      const backend = backends.find(b => b.name === backendName);
      
      if (!backend) {
        return res.status(404).json({
          success: false,
          error: 'Backend not found'
        });
      }

      // Get queue status for this backend
      try {
        const queueStatus = await ibmQuantumService.getQueueStatus(backendName);
        backend.queueStatus = queueStatus;
      } catch (queueError) {
        logger.warn(`Could not fetch queue status for ${backendName}:`, queueError.message);
        backend.queueStatus = { length: 0, status: 'unknown' };
      }

      res.json({
        success: true,
        data: backend,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error in getBackendDetails for ${req.params.backendName}:`, error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch backend details',
        message: error.message
      });
    }
  }

  async getQueueStatus(req, res) {
    try {
      const { backendName } = req.params;
      const queueStatus = await ibmQuantumService.getQueueStatus(backendName);

      res.json({
        success: true,
        data: queueStatus,
        backend: backendName,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error in getQueueStatus for ${req.params.backendName}:`, error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch queue status',
        message: error.message
      });
    }
  }

  async getSystemStats(req, res) {
    try {
      const stats = await ibmQuantumService.getSystemStats();

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in getSystemStats:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system statistics',
        message: error.message
      });
    }
  }

  async getLiveStats(req, res) {
    try {
      const [systemStats, monitoringStatus] = await Promise.all([
        ibmQuantumService.getSystemStats(),
        Promise.resolve(getMonitoringStatus())
      ]);

      const cachedJobs = getJobCache();
      
      const liveStats = {
        ...systemStats,
        monitoring: monitoringStatus,
        realTimeData: {
          cachedJobs: cachedJobs.length,
          lastJobUpdate: getLastUpdate(),
          activeConnections: req.io ? req.io.engine.clientsCount : 0
        }
      };

      res.json({
        success: true,
        data: liveStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in getLiveStats:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch live statistics',
        message: error.message
      });
    }
  }

  async triggerUpdate(req, res) {
    try {
      const result = await triggerManualUpdate();
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in triggerUpdate:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger manual update',
        message: error.message
      });
    }
  }

  async clearCache(req, res) {
    try {
      ibmQuantumService.clearCache();
      
      res.json({
        success: true,
        message: 'Service cache cleared successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in clearCache:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache',
        message: error.message
      });
    }
  }

  async getJobsByStatus(req, res) {
    try {
      const { status } = req.params;
      const validStatuses = ['RUNNING', 'QUEUED', 'COMPLETED', 'ERROR', 'CANCELLED'];
      
      if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status',
          validStatuses
        });
      }

      const cachedJobs = getJobCache();
      const filteredJobs = cachedJobs.filter(job => job.status === status.toUpperCase());

      res.json({
        success: true,
        data: filteredJobs,
        meta: {
          status: status.toUpperCase(),
          count: filteredJobs.length,
          lastUpdate: getLastUpdate(),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error(`Error in getJobsByStatus for ${req.params.status}:`, error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch jobs by status',
        message: error.message
      });
    }
  }
}

export default new QuantumController();
