# Quantumania Backend API

A comprehensive Dashboard to display all the live/publicly available quantum computers from IBM Quantum Network with real-time job monitoring and analytics.

## 🚀 Features

- **Real-time Quantum Job Monitoring** - Track quantum jobs with live updates
- **IBM Quantum Device Status** - Monitor all available quantum backends
- **Queue Analytics** - Real-time queue status and statistics
- **WebSocket Real-time Updates** - Live dashboard updates via Socket.IO
- **Comprehensive API** - RESTful endpoints for all quantum data
- **Mock Development Mode** - Development with realistic mock data

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- IBM Quantum API Key (optional - runs in mock mode without it)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/thisisharshavardhan/Quantumania.git
cd Quantumania/Backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.sample .env
# Edit .env with your configuration
```

4. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## 🌐 Server Information

- **Default Port**: 3849
- **Base URL**: `http://localhost:3849`
- **Environment**: Development (with mock data) / Production (with IBM Quantum API)

## 📚 API Endpoints

### 🏠 Root Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Welcome message and API overview |
| `/health` | GET | Health check and server status |

### ⚛️ Quantum API (`/api/quantum`)

#### Jobs
| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/api/quantum` | GET | API information and available endpoints | - |
| `/api/quantum/jobs` | GET | Get all quantum jobs | `limit`, `offset`, `status`, `backend`, `cached` |
| `/api/quantum/jobs/status/:status` | GET | Get jobs by status | - |
| `/api/quantum/jobs/:jobId` | GET | Get specific job details | - |

**Status Values**: `RUNNING`, `QUEUED`, `COMPLETED`, `ERROR`, `CANCELLED`

#### Backends
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/quantum/backends` | GET | Get all quantum backends |
| `/api/quantum/backends/:backendName` | GET | Get specific backend details |
| `/api/quantum/backends/:backendName/queue` | GET | Get backend queue status |

#### Statistics
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/quantum/stats` | GET | Get system statistics |
| `/api/quantum/stats/live` | GET | Get live statistics |

#### Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/quantum/update` | POST | Trigger manual data update |
| `/api/quantum/cache/clear` | POST | Clear system cache |

### 📊 Dashboard API (`/api/dashboard`)

| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/api/dashboard/overview` | GET | Complete dashboard overview | - |
| `/api/dashboard/analytics` | GET | Analytics and metrics | `timeRange` (1h, 6h, 24h, 7d) |
| `/api/dashboard/realtime` | GET | Real-time dashboard data | - |

## 🔄 WebSocket Events (Socket.IO)

Connect to the WebSocket server for real-time updates:

```javascript
const socket = io('http://localhost:3849');

// Join specific rooms
socket.emit('join-room', 'dashboard');
socket.emit('join-room', 'quantum-jobs');
```

### Available Events

| Event | Description | Data |
|-------|-------------|------|
| `dashboard-update` | Complete dashboard data update | Dashboard overview |
| `job-status-change` | Job status changes | Array of status change objects |
| `new-jobs` | New jobs detected | Array of new job objects |
| `queue-update` | Backend queue updates | Queue status updates |
| `system-stats-update` | System statistics update | System stats object |
| `monitor-error` | Monitoring error occurred | Error information |

## 📝 Request/Response Examples

### Get All Jobs
```bash
curl "http://localhost:3849/api/quantum/jobs?limit=10&status=RUNNING"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "job_123",
      "name": "Quantum Circuit Job",
      "status": "RUNNING",
      "backend": "ibmq_manila",
      "creation_date": "2025-08-20T09:00:00Z",
      "shots": 1024,
      "qubits": 5
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 150
  },
  "timestamp": "2025-08-20T09:15:30Z"
}
```

### Get Dashboard Overview
```bash
curl "http://localhost:3849/api/dashboard/overview"
```

Response:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalJobs": 150,
      "runningJobs": 25,
      "queuedJobs": 45,
      "completedJobs": 75,
      "totalBackends": 20,
      "onlineBackends": 18
    },
    "recentJobs": [...],
    "backends": [...],
    "monitoring": {
      "isActive": true,
      "lastUpdate": "2025-08-20T09:15:30Z"
    }
  }
}
```

### Get Backend Details
```bash
curl "http://localhost:3849/api/quantum/backends/ibmq_manila"
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3849 |
| `IBM_QUANTUM_API` | IBM Quantum API key | - |
| `NODE_ENV` | Environment mode | development |
| `LOG_LEVEL` | Logging level | info |

### Development Mode

When running without an IBM Quantum API key or with `NODE_ENV=development`, the server runs in mock mode with realistic sample data.

## 🔧 Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Start production server |
| Development | `npm run dev` | Start with nodemon (auto-reload) |
| Test | `npm test` | Run tests (not implemented yet) |

## 📁 Project Structure

```
Backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── quantumController.js
│   │   └── dashboardController.js
│   ├── middleware/           # Custom middleware
│   │   └── errorHandler.js
│   ├── routers/             # Route definitions
│   │   ├── quantumRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/            # Business logic
│   │   ├── ibmQuantumService.js
│   │   └── jobMonitor.js
│   ├── utils/               # Utilities
│   │   └── logger.js
│   └── index.js             # Main server file
├── logs/                    # Application logs
├── package.json
├── .env                     # Environment configuration
└── README.md
```

## 🔐 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting (100 requests per 15 minutes)
- **Input Validation** - Request validation with express-validator
- **Error Handling** - Comprehensive error handling and logging

## 📊 Monitoring Features

- **Automatic Job Monitoring** - Updates every 60 seconds
- **Deep System Scans** - Every 10 minutes
- **Real-time WebSocket Updates** - Live dashboard updates
- **Comprehensive Logging** - Winston-based logging system
- **Health Checks** - Server health monitoring

## 🐛 Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-20T09:15:30Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License

## 🆘 Support

For issues and questions:
- Check the logs in the `logs/` directory
- Review the `ERROR_RESOLUTION.md` file
- Create an issue on GitHub

---

**Made with ❤️ for the Quantum Computing Community**
