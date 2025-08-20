import React from 'react';
import { useBackends } from '../hooks/useApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Backends = () => {
  const { backends, loading, error, refetch } = useBackends();

  if (loading) {
    return <Loading message="Loading backends..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  const realDevices = backends.filter(backend => !backend.simulator);
  const simulators = backends.filter(backend => backend.simulator);

  return (
    <div className="backends-page">
      <header className="page-header">
        <h1>Quantum Backends</h1>
        <button className="refresh-btn" onClick={refetch}>
          Refresh
        </button>
      </header>

      {/* Summary */}
      <section className="backends-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <h3>Total Backends</h3>
            <p className="stat-value">{backends.length}</p>
          </div>
          <div className="summary-stat">
            <h3>Real Devices</h3>
            <p className="stat-value">{realDevices.length}</p>
          </div>
          <div className="summary-stat">
            <h3>Simulators</h3>
            <p className="stat-value">{simulators.length}</p>
          </div>
          <div className="summary-stat">
            <h3>Online</h3>
            <p className="stat-value online">
              {backends.filter(b => b.status?.operational).length}
            </p>
          </div>
        </div>
      </section>

      {/* Real Devices */}
      {realDevices.length > 0 && (
        <section className="backends-section">
          <h2>🔬 Real Quantum Devices</h2>
          <div className="backends-grid">
            {realDevices.map((backend) => (
              <div key={backend.name} className="backend-card real-device">
                <div className="backend-header">
                  <h3>{backend.name}</h3>
                  <span className={`backend-status ${backend.status?.operational ? 'online' : 'offline'}`}>
                    {backend.status?.operational ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </div>
                
                <div className="backend-details">
                  <div className="detail-row">
                    <span className="detail-label">Qubits:</span>
                    <span className="detail-value">{backend.n_qubits || backend.num_qubits}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Pending Jobs:</span>
                    <span className="detail-value">{backend.pending_jobs || 0}</span>
                  </div>
                  {backend.basis_gates && (
                    <div className="detail-row">
                      <span className="detail-label">Basis Gates:</span>
                      <span className="detail-value gates">
                        {backend.basis_gates.slice(0, 5).join(', ')}
                        {backend.basis_gates.length > 5 && '...'}
                      </span>
                    </div>
                  )}
                  {backend.status?.message && (
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">{backend.status.message}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Simulators */}
      {simulators.length > 0 && (
        <section className="backends-section">
          <h2>💻 Quantum Simulators</h2>
          <div className="backends-grid">
            {simulators.map((backend) => (
              <div key={backend.name} className="backend-card simulator">
                <div className="backend-header">
                  <h3>{backend.name}</h3>
                  <span className="backend-type">Simulator</span>
                </div>
                
                <div className="backend-details">
                  <div className="detail-row">
                    <span className="detail-label">Qubits:</span>
                    <span className="detail-value">{backend.n_qubits || backend.num_qubits}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Pending Jobs:</span>
                    <span className="detail-value">{backend.pending_jobs || 0}</span>
                  </div>
                  {backend.basis_gates && (
                    <div className="detail-row">
                      <span className="detail-label">Basis Gates:</span>
                      <span className="detail-value gates">
                        {backend.basis_gates.slice(0, 5).join(', ')}
                        {backend.basis_gates.length > 5 && '...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {backends.length === 0 && (
        <div className="no-data">
          <p>No backends available</p>
        </div>
      )}
    </div>
  );
};

export default Backends;
