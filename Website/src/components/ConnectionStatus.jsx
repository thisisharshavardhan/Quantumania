import React from 'react';
import { useSocket } from '../hooks/useSocket';

const ConnectionStatus = () => {
  const { isConnected, socketId } = useSocket();

  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      <div className="status-indicator"></div>
      <span className="status-text">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </span>
      {socketId && (
        <span className="socket-id" title={`Socket ID: ${socketId}`}>
          ({socketId.slice(0, 8)}...)
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;
