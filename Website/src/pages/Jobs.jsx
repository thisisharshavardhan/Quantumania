import React, { useState } from 'react';
import { useJobs } from '../hooks/useApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Jobs = () => {
  const [filters, setFilters] = useState({
    limit: 50,
    offset: 0,
    status: '',
    backend: ''
  });

  const { jobs, loading, error, refetch } = useJobs(filters);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset pagination when filters change
    }));
  };

  const statusOptions = ['', 'RUNNING', 'QUEUED', 'COMPLETED', 'ERROR', 'CANCELLED'];

  if (loading && !jobs.length) {
    return <Loading message="Loading jobs..." />;
  }

  if (error && !jobs.length) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  return (
    <div className="jobs-page">
      <header className="page-header">
        <h1>Quantum Jobs</h1>
        <button className="refresh-btn" onClick={refetch}>
          Refresh
        </button>
      </header>

      {/* Filters */}
      <section className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status || 'All Statuses'}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="limit-filter">Limit:</label>
            <select
              id="limit-filter"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="jobs-section">
        {jobs.length > 0 ? (
          <>
            <div className="jobs-count">
              Showing {jobs.length} jobs
            </div>
            <div className="jobs-grid">
              {jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <h3>{job.name || `Job ${job.id}`}</h3>
                    <span className={`job-status ${job.status?.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="job-details">
                    <div className="detail-row">
                      <span className="detail-label">ID:</span>
                      <span className="detail-value">{job.id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Backend:</span>
                      <span className="detail-value">{job.backend}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Shots:</span>
                      <span className="detail-value">{job.shots?.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Qubits:</span>
                      <span className="detail-value">{job.qubits}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">
                        {job.creation_date ? new Date(job.creation_date).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    {job.queue_position && (
                      <div className="detail-row">
                        <span className="detail-label">Queue Position:</span>
                        <span className="detail-value">{job.queue_position}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={filters.offset === 0}
                onClick={() => handleFilterChange('offset', Math.max(0, filters.offset - filters.limit))}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {Math.floor(filters.offset / filters.limit) + 1}
              </span>
              <button
                className="pagination-btn"
                disabled={jobs.length < filters.limit}
                onClick={() => handleFilterChange('offset', filters.offset + filters.limit)}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="no-data">
            <p>No jobs found with current filters</p>
            <button className="clear-filters-btn" onClick={() => setFilters({
              limit: 50,
              offset: 0,
              status: '',
              backend: ''
            })}>
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Jobs;
