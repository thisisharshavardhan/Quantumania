# Quantumania - IBM Quantum Computing Dashboard Backend

A feature-rich Node.js backend for monitoring live/public quantum computing jobs from IBM Quantum Network.

## 🚀 Features

### Real-time Monitoring
- **Live Job Tracking**: Monitor quantum jobs in real-time with WebSocket updates
- **Status Change Notifications**: Get notified when job statuses change
- **Auto-refresh**: Data updates every 30 seconds automatically
- **Deep System Scans**: Comprehensive system analysis every 5 minutes

### IBM Quantum Integration
- **Job Management**: Fetch and display quantum computing jobs
- **Device Status**: Monitor all IBM Quantum backends and simulators
- **Queue Analytics**: Track queue lengths and waiting times
- **System Statistics**: Real-time system health and performance metrics

### API Endpoints

#### Quantum Jobs API (`/api/quantum`)
- `GET /jobs` - List quantum jobs with pagination and filtering
- `GET /jobs/:jobId` - Get specific job details
- `GET /jobs/status/:status` - Filter jobs by status (RUNNING, QUEUED, COMPLETED, ERROR, CANCELLED)
- `GET /backends` - List all quantum backends and simulators
- `GET /backends/:backendName` - Get specific backend details
- `GET /backends/:backendName/queue` - Get queue status for a backend
- `GET /stats` - Get system statistics
- `GET /stats/live` - Get live statistics with monitoring info
- `POST /update` - Trigger manual data update
- `POST /cache/clear` - Clear service cache

#### Dashboard API (`/api/dashboard`)
- `GET /overview` - Complete dashboard overview with summary
- `GET /analytics` - Analytics with time-based insights (1h, 6h, 24h, 7d)
- `GET /realtime` - Real-time data for live dashboards

#### System Endpoints
- `GET /` - API information and available endpoints
- `GET /health` - Health check with system metrics

### WebSocket Events
- `dashboard-update` - Complete dashboard data update
- `job-status-change` - Job status change notifications
- `new-jobs` - New job detection alerts
- `queue-update` - Queue length updates
- `system-stats-update` - System statistics updates
- `monitor-error` - Error notifications

### Smart Fallback System
- **Mock Data Mode**: Automatic fallback to realistic mock data when IBM API is unavailable
- **Caching**: Intelligent caching system to reduce API calls
- **Error Handling**: Graceful error handling with meaningful error messages
- **Rate Limiting**: Built-in protection against rate limiting

## 🛠️ Technical Stack

- **Framework**: Express.js with ES6 modules
- **Real-time**: Socket.io for WebSocket connections
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston with file and console logging
- **Validation**: Express-validator for input validation
- **Monitoring**: Node-cron for scheduled tasks
- **HTTP Client**: Axios with interceptors and retry logic

## 📊 Data Structure

### Job Object
```json
{
  "id": "job_123",
  "name": "Quantum Job 1",
  "status": "RUNNING",
  "backend": "ibm_brisbane",
  "shots": 1024,
  "qubits": 127,
  "creation_date": "2025-08-20T06:30:00.000Z",
  "queue_position": 5,
  "estimated_completion_time": "2025-08-20T07:00:00.000Z"
}
```

### Backend Object
```json
{
  "name": "ibm_brisbane",
  "status": { "operational": true },
  "n_qubits": 127,
  "simulator": false,
  "pending_jobs": 15,
  "basis_gates": ["cx", "id", "rz", "sx", "x"]
}
```

### System Statistics
```json
{
  "totalBackends": 12,
  "onlineBackends": 8,
  "simulators": 4,
  "realDevices": 8,
  "totalJobs": 150,
  "runningJobs": 12,
  "queuedJobs": 45,
  "completedJobs": 88,
  "errorJobs": 5,
  "lastUpdate": "2025-08-20T06:30:00.000Z"
}
```

## 🔧 Configuration

### Environment Variables
```env
PORT=3849
IBM_QUANTUM_API="your_api_key_here"
LOG_LEVEL=info
NODE_ENV=development
```

### Features Configuration
- **Monitoring Interval**: 30 seconds (configurable)
- **Deep Scan Interval**: 5 minutes
- **Cache TTL**: 15-60 seconds depending on data type
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Request Timeout**: 30 seconds
- **Retry Attempts**: 3 with exponential backoff

## 🚦 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   - Copy `.env.sample` to `.env`
   - Add your IBM Quantum API key

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the API**
   - Dashboard API: `http://localhost:3849`
   - Quantum API: `http://localhost:3849/api/quantum`
   - Health Check: `http://localhost:3849/health`

## 📝 Logging

The application uses Winston for comprehensive logging:
- **Console**: Colored, human-readable logs
- **Files**: Structured JSON logs in `/logs` directory
  - `combined.log` - All logs
  - `error.log` - Error logs only
  - `exceptions.log` - Uncaught exceptions
  - `rejections.log` - Unhandled promise rejections

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: API rate limiting
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses without sensitive data exposure

## 📈 Monitoring & Analytics

### Real-time Metrics
- Live job counts by status
- Backend availability tracking
- Queue length monitoring
- System performance metrics

### Historical Analytics
- Job submission trends
- Backend usage patterns
- Success/failure rates
- Performance benchmarks

### Insights Generation
- Automatic system health insights
- Usage pattern detection
- Anomaly alerts
- Performance recommendations

## 🔄 WebSocket Integration

Connect to WebSocket for real-time updates:
```javascript
const socket = io('http://localhost:3849');

socket.on('dashboard-update', (data) => {
  console.log('Dashboard updated:', data);
});

socket.on('job-status-change', (changes) => {
  console.log('Job status changes:', changes);
});
```

## 🎯 Use Cases

1. **Quantum Research Monitoring**: Track your quantum experiments in real-time
2. **System Administration**: Monitor IBM Quantum Network health
3. **Educational Dashboards**: Visualize quantum computing activity for learning
4. **Analytics Platform**: Analyze quantum computing usage patterns
5. **Integration Hub**: Connect quantum monitoring to other systems

## 🚀 Production Ready

- Graceful shutdown handling
- Comprehensive error handling
- Performance monitoring
- Scalable architecture
- Production logging
- Health checks
- Memory usage tracking

---

**Built for the Quantumania Hackathon** - A comprehensive solution for IBM Quantum Computing monitoring and analytics.
