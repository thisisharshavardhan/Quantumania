import { useState, useEffect } from 'react';
import { quantumAPI, dashboardAPI, handleApiError } from '../services/api';

// Hook for fetching quantum jobs
export const useJobs = (params = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await quantumAPI.getJobs(params);
      setJobs(response.data.data || []);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [JSON.stringify(params)]);

  return { jobs, loading, error, refetch: fetchJobs };
};

// Hook for fetching quantum backends
export const useBackends = () => {
  const [backends, setBackends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBackends = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await quantumAPI.getBackends();
      setBackends(response.data.data || []);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackends();
  }, []);

  return { backends, loading, error, refetch: fetchBackends };
};

// Hook for dashboard overview
export const useDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getOverview();
      setDashboard(response.data.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { dashboard, loading, error, refetch: fetchDashboard };
};

// Hook for system statistics
export const useStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await quantumAPI.getStats();
      setStats(response.data.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};

// Generic hook for API calls
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      setData(response.data.data || response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiCall) {
      fetchData();
    }
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};
