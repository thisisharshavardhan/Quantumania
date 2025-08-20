import React, { useState, useEffect } from 'react';
import { useDashboard } from '../hooks/useApi';
import { useDashboardUpdates } from '../hooks/useSocket';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConnectionStatus from '../components/ConnectionStatus';

const Dashboard = () => {
  const { dashboard, loading, error, refetch } = useDashboard();
  const { isConnected, dashboardData, jobChanges, newJobs } = useDashboardUpdates();
  const [currentData, setCurrentData] = useState(null);

  // Update current data when we receive new data
  useEffect(() => {
    if (dashboardData) {
      console.log('Updating dashboard with real-time data:', dashboardData);
      setCurrentData(dashboardData);
    } else if (dashboard && !currentData) {
      console.log('Updating dashboard with initial data:', dashboard);
      setCurrentData(dashboard);
    }
  }, [dashboard, dashboardData, currentData]);

  // Use the persisted current data
  const data = currentData;

  console.log('Dashboard render state:', {
    loading,
    error: error?.message,
    hasInitialData: !!dashboard,
    hasRealtimeData: !!dashboardData,
    hasCurrentData: !!currentData,
    isConnected,
    dataTimestamp: data?.timestamp
  });

  if (loading && !data) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error && !data) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Quantumania Dashboard</h1>
        <ConnectionStatus />
      </header>

      {data && (
        <>
          {/* Summary Stats */}
          <section className="dashboard-summary">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Jobs</h3>
                <p className="stat-value">{data.summary?.totalJobs || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Running Jobs</h3>
                <p className="stat-value running">{data.summary?.runningJobs || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Queued Jobs</h3>
                <p className="stat-value queued">{data.summary?.queuedJobs || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Completed Jobs</h3>
                <p className="stat-value completed">{data.summary?.completedJobs || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Total Backends</h3>
                <p className="stat-value">{data.summary?.totalBackends || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Online Backends</h3>
                <p className="stat-value online">{data.summary?.onlineBackends || 0}</p>
              </div>
            </div>
          </section>

          {/* Recent Jobs */}
          <section className="dashboard-section">
            <h2>Recent Jobs</h2>
            <div className="jobs-list">
              {data.recentJobs?.length > 0 ? (
                data.recentJobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h4>{job.name || `Job ${job.id}`}</h4>
                      <span className={`job-status ${job.status?.toLowerCase()}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="job-details">
                      <p><strong>Backend:</strong> {job.backend}</p>
                      <p><strong>Shots:</strong> {job.shots}</p>
                      <p><strong>Qubits:</strong> {job.qubits}</p>
                      <p><strong>Created:</strong> {new Date(job.creation_date).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No recent jobs available</p>
              )}
            </div>
          </section>

          {/* Backends */}
          <section className="dashboard-section">
            <h2>Quantum Backends</h2>
            <div className="backends-grid">
              {data.backends?.length > 0 ? (
                data.backends.map((backend) => (
                  <div key={backend.name} className="backend-card">
                    <h4>{backend.name}</h4>
                    <div className="backend-details">
                      <p><strong>Status:</strong> 
                        <span className={`backend-status ${backend.status}`}>
                          {backend.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                        </span>
                      </p>
                      <p><strong>Qubits:</strong> {backend.qubits}</p>
                      <p><strong>Type:</strong> {backend.simulator ? 'Simulator' : 'Real Device'}</p>
                      <p><strong>Pending Jobs:</strong> {backend.pending_jobs}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No backends available</p>
              )}
            </div>
          </section>

          {/* Real-time Updates */}
          {isConnected && (
            <>
              {/* Recent Job Changes */}
              {jobChanges.length > 0 && (
                <section className="dashboard-section">
                  <h2>Recent Job Status Changes</h2>
                  <div className="updates-list">
                    {jobChanges.slice(0, 5).map((change, index) => (
                      <div key={index} className="update-item">
                        <span className="update-time">
                          {new Date(change.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="update-text">
                          Job {change.jobName} changed from 
                          <span className={`status ${change.oldStatus?.toLowerCase()}`}>
                            {change.oldStatus}
                          </span> to 
                          <span className={`status ${change.newStatus?.toLowerCase()}`}>
                            {change.newStatus}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* New Jobs */}
              {newJobs.length > 0 && (
                <section className="dashboard-section">
                  <h2>New Jobs Detected</h2>
                  <div className="updates-list">
                    {newJobs.slice(0, 5).map((job, index) => (
                      <div key={index} className="update-item">
                        <span className="update-time">
                          {new Date(job.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="update-text">
                          New job: {job.name || job.id} on {job.backend}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Last Update */}
          <footer className="dashboard-footer">
            <p>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Never'}</p>
            <button className="refresh-btn" onClick={refetch}>
              Refresh Data
            </button>
          </footer>
        </>
      )}
    </div>
  );
};

export default Dashboard;
