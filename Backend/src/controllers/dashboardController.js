import ibmQuantumService from '../services/ibmQuantumService.js';
import { getJobCache, getLastUpdate, getMonitoringStatus } from '../services/jobMonitor.js';
import { logger } from '../utils/logger.js';

class DashboardController {
  
  async getOverview(req, res) {
    try {
      const [systemStats, monitoringStatus] = await Promise.all([
        ibmQuantumService.getSystemStats(),
        Promise.resolve(getMonitoringStatus())
      ]);

      const cachedJobs = getJobCache();
      const recentJobs = cachedJobs.slice(0, 10);
      const backends = await ibmQuantumService.getBackends();

      const overview = {
        summary: {
          totalJobs: systemStats.totalJobs,
          runningJobs: systemStats.runningJobs,
          queuedJobs: systemStats.queuedJobs,
          completedJobs: systemStats.completedJobs,
          errorJobs: systemStats.errorJobs,
          totalBackends: systemStats.totalBackends,
          onlineBackends: systemStats.onlineBackends,
          lastUpdate: getLastUpdate()
        },
        recentJobs: recentJobs.map(job => ({
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
        monitoring: monitoringStatus,
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      logger.error('Error in dashboard overview:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard overview',
        message: error.message
      });
    }
  }

  async getAnalytics(req, res) {
    try {
      const { timeRange = '24h' } = req.query;
      const cachedJobs = getJobCache();
      
      // Calculate time boundaries
      const now = new Date();
      let timeLimit;
      
      switch (timeRange) {
        case '1h':
          timeLimit = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '6h':
          timeLimit = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
        default:
          timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
      }

      // Filter jobs by time range
      const recentJobs = cachedJobs.filter(job => {
        const jobDate = new Date(job.creation_date || job.created_at);
        return jobDate >= timeLimit;
      });

      // Job status distribution
      const statusDistribution = cachedJobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {});

      // Backend usage distribution
      const backendUsage = cachedJobs.reduce((acc, job) => {
        const backend = job.backend || 'unknown';
        acc[backend] = (acc[backend] || 0) + 1;
        return acc;
      }, {});

      // Jobs timeline (hourly breakdown)
      const timeline = this.generateJobsTimeline(recentJobs, timeRange);

      // Queue length trends
      const queueTrends = await this.getQueueTrends();

      // Performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(cachedJobs);

      const analytics = {
        timeRange,
        summary: {
          totalJobs: cachedJobs.length,
          recentJobs: recentJobs.length,
          avgJobsPerHour: Math.round((recentJobs.length / this.getHoursInRange(timeRange)) * 10) / 10
        },
        statusDistribution,
        backendUsage,
        timeline,
        queueTrends,
        performanceMetrics,
        insights: this.generateInsights(cachedJobs, recentJobs),
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error in dashboard analytics:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics',
        message: error.message
      });
    }
  }

  async getRealtimeData(req, res) {
    try {
      const monitoringStatus = getMonitoringStatus();
      const cachedJobs = getJobCache();
      const systemStats = await ibmQuantumService.getSystemStats();

      // Current system load
      const currentLoad = {
        runningJobs: cachedJobs.filter(j => j.status === 'RUNNING').length,
        queuedJobs: cachedJobs.filter(j => j.status === 'QUEUED').length,
        totalActiveJobs: cachedJobs.filter(j => ['RUNNING', 'QUEUED'].includes(j.status)).length
      };

      // Recent activity (last 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentActivity = cachedJobs.filter(job => {
        const jobDate = new Date(job.creation_date || job.created_at);
        return jobDate >= tenMinutesAgo;
      });

      const realtimeData = {
        monitoring: monitoringStatus,
        currentLoad,
        recentActivity: {
          count: recentActivity.length,
          jobs: recentActivity.slice(0, 5).map(job => ({
            id: job.id,
            status: job.status,
            backend: job.backend,
            timestamp: job.creation_date || job.created_at
          }))
        },
        systemHealth: {
          totalBackends: systemStats.totalBackends,
          onlineBackends: systemStats.onlineBackends,
          healthPercentage: Math.round((systemStats.onlineBackends / systemStats.totalBackends) * 100)
        },
        lastUpdate: getLastUpdate(),
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: realtimeData
      });
    } catch (error) {
      logger.error('Error in realtime data:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch realtime data',
        message: error.message
      });
    }
  }

  // Helper methods
  generateJobsTimeline(jobs, timeRange) {
    const buckets = this.getTimeBuckets(timeRange);
    const timeline = buckets.map(bucket => ({ time: bucket, count: 0 }));

    jobs.forEach(job => {
      const jobTime = new Date(job.creation_date || job.created_at);
      const bucketIndex = this.findTimeBucket(jobTime, buckets);
      if (bucketIndex !== -1) {
        timeline[bucketIndex].count++;
      }
    });

    return timeline;
  }

  getTimeBuckets(timeRange) {
    const now = new Date();
    const buckets = [];
    let interval, count;

    switch (timeRange) {
      case '1h':
        interval = 5 * 60 * 1000; // 5-minute intervals
        count = 12;
        break;
      case '6h':
        interval = 30 * 60 * 1000; // 30-minute intervals  
        count = 12;
        break;
      case '24h':
      default:
        interval = 60 * 60 * 1000; // 1-hour intervals
        count = 24;
        break;
      case '7d':
        interval = 24 * 60 * 60 * 1000; // 1-day intervals
        count = 7;
        break;
    }

    for (let i = count - 1; i >= 0; i--) {
      buckets.push(new Date(now.getTime() - i * interval));
    }

    return buckets;
  }

  findTimeBucket(jobTime, buckets) {
    for (let i = 0; i < buckets.length - 1; i++) {
      if (jobTime >= buckets[i] && jobTime < buckets[i + 1]) {
        return i;
      }
    }
    return buckets.length - 1; // Last bucket
  }

  getHoursInRange(timeRange) {
    switch (timeRange) {
      case '1h': return 1;
      case '6h': return 6;
      case '24h': return 24;
      case '7d': return 168;
      default: return 24;
    }
  }

  async getQueueTrends() {
    try {
      const backends = await ibmQuantumService.getBackends();
      const activeBackends = backends.filter(b => !b.simulator && b.status?.operational);
      
      const trends = [];
      for (const backend of activeBackends.slice(0, 5)) {
        try {
          const queueStatus = await ibmQuantumService.getQueueStatus(backend.name);
          trends.push({
            backend: backend.name,
            queueLength: queueStatus.length || 0,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          // Skip if queue status unavailable
        }
      }
      
      return trends;
    } catch (error) {
      logger.warn('Error fetching queue trends:', error.message);
      return [];
    }
  }

  calculatePerformanceMetrics(jobs) {
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED');
    const errorJobs = jobs.filter(j => j.status === 'ERROR');
    
    return {
      successRate: jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0,
      errorRate: jobs.length > 0 ? Math.round((errorJobs.length / jobs.length) * 100) : 0,
      totalShots: jobs.reduce((sum, job) => sum + (job.shots || 0), 0),
      avgShotsPerJob: jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => sum + (job.shots || 0), 0) / jobs.length) : 0
    };
  }

  generateInsights(allJobs, recentJobs) {
    const insights = [];
    
    // Most active backend
    const backendUsage = allJobs.reduce((acc, job) => {
      acc[job.backend] = (acc[job.backend] || 0) + 1;
      return acc;
    }, {});
    
    const mostActiveBackend = Object.entries(backendUsage)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostActiveBackend) {
      insights.push({
        type: 'info',
        title: 'Most Active Backend',
        message: `${mostActiveBackend[0]} has processed ${mostActiveBackend[1]} jobs`
      });
    }

    // Recent activity trend
    if (recentJobs.length > 0) {
      insights.push({
        type: 'success',
        title: 'Recent Activity',
        message: `${recentJobs.length} jobs submitted recently`
      });
    }

    // System health
    const errorJobs = allJobs.filter(j => j.status === 'ERROR');
    if (errorJobs.length > allJobs.length * 0.1) {
      insights.push({
        type: 'warning',
        title: 'High Error Rate',
        message: `${errorJobs.length} jobs failed (${Math.round((errorJobs.length / allJobs.length) * 100)}%)`
      });
    }

    return insights;
  }
}

export default new DashboardController();
