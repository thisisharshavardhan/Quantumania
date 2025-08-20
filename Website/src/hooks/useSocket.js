import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Connect to socket
    socketService.connect();

    // Update connection status
    const updateConnectionStatus = () => {
      setIsConnected(socketService.isSocketConnected());
    };

    // Listen for connection events
    socketService.on('connect', updateConnectionStatus);
    socketService.on('disconnect', updateConnectionStatus);

    // Initial status
    updateConnectionStatus();

    return () => {
      socketService.off('connect', updateConnectionStatus);
      socketService.off('disconnect', updateConnectionStatus);
      socketService.disconnect();
    };
  }, []);

  const on = useCallback((event, callback) => {
    socketService.on(event, callback);
  }, []);

  const off = useCallback((event, callback) => {
    socketService.off(event, callback);
  }, []);

  return {
    isConnected,
    lastUpdate,
    on,
    off,
    socketId: socketService.getSocketId()
  };
};

// Hook for dashboard real-time updates
export const useDashboardUpdates = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [jobChanges, setJobChanges] = useState([]);
  const [newJobs, setNewJobs] = useState([]);
  const { isConnected, on, off } = useSocket();

  useEffect(() => {
    const handleDashboardUpdate = (data) => {
      console.log('Dashboard update received:', data);
      setDashboardData(data);
    };

    const handleJobStatusChange = (changes) => {
      console.log('Job status changes received:', changes);
      setJobChanges(prev => [...changes, ...prev].slice(0, 10)); // Keep last 10 changes
    };

    const handleNewJobs = (jobs) => {
      console.log('New jobs received:', jobs);
      setNewJobs(prev => [...jobs, ...prev].slice(0, 10)); // Keep last 10 new jobs
    };

    // Only set up listeners when connected
    if (isConnected) {
      on('dashboard-update', handleDashboardUpdate);
      on('job-status-change', handleJobStatusChange);
      on('new-jobs', handleNewJobs);
    }

    return () => {
      if (isConnected) {
        off('dashboard-update', handleDashboardUpdate);
        off('job-status-change', handleJobStatusChange);
        off('new-jobs', handleNewJobs);
      }
    };
  }, [on, off, isConnected]);

  return {
    isConnected,
    dashboardData,
    jobChanges,
    newJobs
  };
};
