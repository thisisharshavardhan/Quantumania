import cron from 'node-cron';
import ibmQuantumService from './ibmQuantumService.js';
import { logger } from '../utils/logger.js';

class JobMonitor {
  constructor() {
    this.jobCache = new Map();
    this.lastUpdate = null;
    this.isMonitoring = false;
    this.io = null;
    this.monitoringInterval = null;
  }

  async monitorJobs() {
    if (!this.io) {
      logger.warn('Socket.IO not initialized, skipping job monitoring');
      return;
    }

    try {
      logger.info('🔍 Monitoring quantum jobs...');
      
      // Fetch latest data
      const [jobs, backends, systemStats] = await Promise.all([
        ibmQuantumService.getJobs(50),
        ibmQuantumService.getBackends(),
        ibmQuantumService.getSystemStats()
      ]);
      
      // Check for job status changes
      const statusChanges = [];
      const newJobs = [];
      
      jobs.forEach(job => {
        const previousJob = this.jobCache.get(job.id);
        
        if (!previousJob) {
          // New job detected
          newJobs.push({
            ...job,
            isNew: true,
            timestamp: new Date().toISOString()
          });
        } else if (previousJob.status !== job.status) {
          // Status change detected
          statusChanges.push({
            jobId: job.id,
            jobName: job.name || `Job ${job.id}`,
            oldStatus: previousJob.status,
            newStatus: job.status,
            backend: job.backend,
            timestamp: new Date().toISOString()
          });
        }
        
        // Update cache
        this.jobCache.set(job.id, job);
      });

      // Prepare dashboard data in the same format as the dashboard controller
      const summary = {
        totalJobs: jobs.length,
        runningJobs: jobs.filter(job => job.status === 'RUNNING').length,
        queuedJobs: jobs.filter(job => job.status === 'QUEUED').length,
        completedJobs: jobs.filter(job => job.status === 'COMPLETED').length,
        errorJobs: jobs.filter(job => job.status === 'ERROR' || job.status === 'CANCELLED').length,
        totalBackends: backends.length,
        onlineBackends: backends.filter(backend => backend.status?.operational || backend.status === 'online').length,
        lastUpdate: new Date().toISOString()
      };

      const dashboardData = {
        summary,
        recentJobs: jobs.slice(0, 10).map(job => ({
          id: job.id,
          name: job.name || `Job ${job.id}`,
          status: job.status,
          backend: job.backend,
          creation_date: job.creation_date,
          shots: job.shots,
          qubits: job.qubits
        })),
        backends: backends.slice(0, 8).map(backend => ({
          name: backend.name,
          status: backend.status?.operational ? 'online' : 'offline',
          qubits: backend.n_qubits || backend.num_qubits,
          simulator: backend.simulator,
          pending_jobs: backend.pending_jobs || 0,
          basis_gates: backend.basis_gates?.slice(0, 5) || []
        })),
        monitoring: {
          isActive: this.isMonitoring,
          lastUpdate: this.lastUpdate,
          cachedJobs: this.jobCache.size,
          connectedClients: this.io.engine.clientsCount
        },
        timestamp: new Date().toISOString()
      };

      // Emit updates to all connected clients
      this.io.emit('dashboard-update', dashboardData);
      
      // Emit specific events for real-time notifications
      if (statusChanges.length > 0) {
        this.io.emit('job-status-change', statusChanges);
        logger.info(`📊 Job status changes detected: ${statusChanges.length}`);
      }

      if (newJobs.length > 0) {
        this.io.emit('new-jobs', newJobs);
        logger.info(`🆕 New jobs detected: ${newJobs.length}`);
      }

      // Emit queue updates for specific backends
      const queueUpdates = await this.getQueueUpdates(backends);
      if (queueUpdates.length > 0) {
        this.io.emit('queue-update', queueUpdates);
      }

      this.lastUpdate = new Date().toISOString();
      logger.info(`✅ Job monitoring completed. Total jobs: ${jobs.length}, Changes: ${statusChanges.length}, New: ${newJobs.length}`);
      
    } catch (error) {
      logger.error('❌ Error during job monitoring:', error.message);
      
      // Emit error to clients
      this.io?.emit('monitor-error', { 
        error: error.message, 
        timestamp: new Date().toISOString(),
        severity: 'warning'
      });
    }
  }

  async getQueueUpdates(backends) {
    const queueUpdates = [];
    
    // Check queue status for top 5 most active backends
    const activeBackends = backends
      .filter(b => !b.simulator && b.status?.operational)
      .slice(0, 5);

    for (const backend of activeBackends) {
      try {
        const queueStatus = await ibmQuantumService.getQueueStatus(backend.name);
        queueUpdates.push({
          backend: backend.name,
          queueLength: queueStatus.length || 0,
          estimatedWaitTime: queueStatus.estimated_wait_time,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.warn(`Failed to get queue status for ${backend.name}:`, error.message);
      }
    }

    return queueUpdates;
  }

  startMonitoring(io) {
    if (this.isMonitoring) {
      logger.warn('Job monitoring is already running');
      return;
    }

    this.io = io;
    this.isMonitoring = true;

    setTimeout(() => {
      this.monitorJobs().catch(error => {
        logger.error('Error in initial monitoring:', error);
      });
    }, 5000); // Increased delay

    // Schedule monitoring every 60 seconds
    this.monitoringInterval = cron.schedule('*/60 * * * * *', () => {
      this.monitorJobs();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    // Also run a deeper scan every 10 minutes instead of 5
    cron.schedule('*/10 * * * *', async () => {
      try {
        logger.info('🔍 Running deep system scan...');
        const stats = await ibmQuantumService.getSystemStats();
        this.io?.emit('system-stats-update', {
          stats,
          timestamp: new Date().toISOString(),
          type: 'deep-scan'
        });
      } catch (error) {
        logger.error('Error during deep scan:', error.message);
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    logger.info('🚀 Job monitoring started - updating every 60 seconds');
    logger.info('🔍 Deep system scans every 10 minutes');
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      this.monitoringInterval.destroy();
      this.monitoringInterval = null;
    }
    
    this.isMonitoring = false;
    this.io = null;
    
    logger.info('⏹️ Job monitoring stopped');
  }

  getJobCache() {
    return Array.from(this.jobCache.values());
  }

  getLastUpdate() {
    return this.lastUpdate;
  }

  getMonitoringStatus() {
    return {
      isActive: this.isMonitoring,
      lastUpdate: this.lastUpdate,
      cachedJobs: this.jobCache.size,
      connectedClients: this.io ? this.io.engine.clientsCount : 0
    };
  }

  // Manual trigger for monitoring (useful for API endpoints)
  async triggerManualUpdate() {
    if (!this.isMonitoring) {
      throw new Error('Monitoring is not active');
    }
    
    await this.monitorJobs();
    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Manual update triggered successfully'
    };
  }

  clearCache() {
    this.jobCache.clear();
    logger.info('Job cache cleared');
  }
}

const jobMonitor = new JobMonitor();

export const startJobMonitoring = (io) => jobMonitor.startMonitoring(io);
export const stopJobMonitoring = () => jobMonitor.stopMonitoring();
export const getJobCache = () => jobMonitor.getJobCache();
export const getLastUpdate = () => jobMonitor.getLastUpdate();
export const getMonitoringStatus = () => jobMonitor.getMonitoringStatus();
export const triggerManualUpdate = () => jobMonitor.triggerManualUpdate();
export const clearJobCache = () => jobMonitor.clearCache();

export default jobMonitor;
