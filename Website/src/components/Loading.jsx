import React from 'react';

const Loading = ({ message = 'Loading...', size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default Loading;
