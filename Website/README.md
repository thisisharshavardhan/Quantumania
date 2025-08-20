# Quantumania Frontend

A modern React dashboard for monitoring IBM Quantum Computing jobs and backends in real-time.

## 🚀 Features

- **Real-time Dashboard** - Live updates via WebSocket connections
- **Quantum Job Monitoring** - Browse and filter quantum computing jobs
- **Backend Management** - Monitor all IBM Quantum devices and simulators
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Modern UI** - Clean, intuitive interface with minimal styling

## 🛠️ Tech Stack

- **React 19** - Latest React with concurrent features
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Socket.IO Client** - Real-time WebSocket communication
- **Vanilla CSS** - Minimal, custom styling (ready for enhancement)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Quantumania Backend running on port 3849

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Edit .env file if needed
   VITE_API_URL=http://localhost:3849
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ConnectionStatus.jsx
│   ├── ErrorMessage.jsx
│   ├── Loading.jsx
│   └── Navigation.jsx
├── pages/              # Main page components
│   ├── Dashboard.jsx
│   ├── Jobs.jsx
│   └── Backends.jsx
├── hooks/              # Custom React hooks
│   ├── useApi.js
│   └── useSocket.js
├── services/           # API and WebSocket services
│   ├── api.js
│   └── socket.js
├── utils/              # Utility functions and constants
│   └── constants.js
├── App.jsx             # Main app component
├── App.css             # Main styles
├── index.css           # Global styles
└── main.jsx            # React entry point
```

## 🔗 API Integration

The frontend connects to the Quantumania backend running on port 3849:

### REST API Endpoints
- `GET /api/quantum/jobs` - Fetch quantum jobs
- `GET /api/quantum/backends` - Fetch quantum backends
- `GET /api/dashboard/overview` - Dashboard data

### WebSocket Events
- `dashboard-update` - Real-time dashboard updates
- `job-status-change` - Job status change notifications
- `new-jobs` - New job alerts

## 🎨 Styling

The project uses minimal vanilla CSS that's ready for customization:

- **Modern Design System** - Consistent colors, spacing, and typography
- **Responsive Layout** - Mobile-first approach
- **Component-based Styles** - Organized by component functionality
- **CSS Variables** - Easy theming and customization

### Key Style Features
- Clean navigation sidebar
- Card-based layouts
- Status indicators with colors
- Loading and error states
- Responsive grid systems

## 🔧 Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm start` | Alias for `npm run dev` |

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3849` |
| `VITE_ENABLE_REAL_TIME` | Enable WebSocket updates | `true` |
| `VITE_ENABLE_DEBUG_LOGS` | Enable debug logging | `true` |

## 📱 Pages Overview

### Dashboard (`/`)
- System overview with key metrics
- Recent jobs display
- Backend status summary
- Real-time updates and notifications

### Jobs (`/jobs`)
- Complete job listing with pagination
- Status filtering and search
- Detailed job information cards
- Real-time job status updates

### Backends (`/backends`)
- All quantum backends and simulators
- Device specifications and status
- Real vs. simulator categorization
- Queue status monitoring

## 🔄 Real-time Features

The frontend automatically connects to the backend's WebSocket server for:

- **Live Dashboard Updates** - Automatic data refresh
- **Job Status Changes** - Instant notifications when jobs change status
- **New Job Alerts** - Notifications for newly submitted jobs
- **Connection Status** - Visual indicator of WebSocket connection

## 🎯 Key Components

### `useApi` Hook
Custom hook for API data fetching with loading and error states:
```jsx
const { data, loading, error, refetch } = useJobs({ limit: 50 });
```

### `useSocket` Hook
WebSocket management with automatic reconnection:
```jsx
const { isConnected, on, off } = useSocket();
```

### Navigation Component
Responsive sidebar navigation with active state management.

### Loading & Error Components
Reusable components for handling loading and error states.

## 🚀 Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview the build**
   ```bash
   npm run preview
   ```

3. **Deploy** the `dist/` folder to your web server

## 🔧 Customization

The minimal CSS design makes it easy to:

- **Add your own styling framework** (Tailwind, Bootstrap, etc.)
- **Customize the color scheme** using CSS variables
- **Add animations and transitions**
- **Implement your own component library**
- **Add data visualization libraries** (Chart.js, D3, etc.)

## 🐛 Troubleshooting

### Common Issues

**WebSocket connection fails:**
- Ensure backend is running on port 3849
- Check CORS configuration in backend
- Verify `VITE_API_URL` environment variable

**API calls fail:**
- Confirm backend server is accessible
- Check network connectivity
- Review browser developer tools for errors

**Build errors:**
- Clear node_modules and reinstall dependencies
- Check Node.js version compatibility
- Verify all imports are correct

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License

---

**Ready to extend with your favorite styling framework and additional features!**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
