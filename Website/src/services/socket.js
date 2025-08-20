import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3849';
    
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      autoConnect: true
    });

    this.setupEventListeners();
    
    return this.socket;
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      this.joinRooms();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔥 Socket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.joinRooms();
    });

    // Quantum-specific events
    this.socket.on('dashboard-update', (data) => {
      console.log('📊 Dashboard update received:', data);
      this.emit('dashboard-update', data);
    });

    this.socket.on('job-status-change', (changes) => {
      console.log('🔄 Job status changes:', changes);
      this.emit('job-status-change', changes);
    });

    this.socket.on('new-jobs', (newJobs) => {
      console.log('🆕 New jobs detected:', newJobs);
      this.emit('new-jobs', newJobs);
    });

    this.socket.on('queue-update', (queueUpdates) => {
      console.log('📈 Queue updates:', queueUpdates);
      this.emit('queue-update', queueUpdates);
    });

    this.socket.on('system-stats-update', (stats) => {
      console.log('📊 System stats update:', stats);
      this.emit('system-stats-update', stats);
    });

    this.socket.on('monitor-error', (error) => {
      console.error('⚠️ Monitor error:', error);
      this.emit('monitor-error', error);
    });
  }

  joinRooms() {
    if (!this.socket || !this.isConnected) return;

    // Join relevant rooms for real-time updates
    this.socket.emit('join-room', 'dashboard');
    this.socket.emit('join-room', 'quantum-jobs');
    console.log('🏠 Joined dashboard and quantum-jobs rooms');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('👋 Socket disconnected');
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Status checks
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  getSocketId() {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
