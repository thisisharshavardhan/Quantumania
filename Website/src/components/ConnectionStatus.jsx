import React from 'react';
import { useSocket } from '../hooks/useSocket';
import socketService from '../services/socket';

const ConnectionStatus = () => {
  const { isConnected, socketId } = useSocket();

  const handleReconnect = () => {
    console.log('🔄 Manual reconnection triggered');
    socketService.disconnect();
    setTimeout(() => {
      socketService.connect();
    }, 1000);
  };

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
      {!isConnected && (
        <button 
          onClick={handleReconnect}
          className="reconnect-btn"
          style={{
            marginLeft: '10px',
            padding: '4px 8px',
            fontSize: '12px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reconnect
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
