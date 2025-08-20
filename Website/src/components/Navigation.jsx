import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/jobs', label: 'Jobs', icon: '⚛️' },
    { path: '/backends', label: 'Backends', icon: '🔬' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>Quantumania</h2>
        <span className="nav-subtitle">Quantum Dashboard</span>
      </div>
      
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
