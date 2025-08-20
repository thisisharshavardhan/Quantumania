# 🚀 Quantumania Production Deployment Guide

## ✅ Production Readiness Checklist

### 1. **Environment Configuration**
- [x] Production environment variables configured
- [x] Security headers enabled (Helmet.js)
- [x] CORS properly configured for production domains
- [x] Rate limiting implemented
- [x] Comprehensive logging with Winston
- [x] Graceful shutdown handling
- [x] Health check endpoints

### 2. **Security Features**
- [x] Content Security Policy (CSP)
- [x] Cross-Origin Resource Policy
- [x] Rate limiting per IP
- [x] Input validation and sanitization
- [x] Secure headers
- [x] Non-root user in Docker containers

### 3. **Performance Optimizations**
- [x] Gzip compression
- [x] Response caching
- [x] Frontend bundle optimization
- [x] Static asset caching
- [x] Connection pooling
- [x] Memory management

### 4. **Monitoring & Logging**
- [x] Structured logging
- [x] Error tracking
- [x] Performance metrics
- [x] Health monitoring
- [x] Socket.IO connection tracking

## 📦 Deployment Options

### Option 1: Docker Compose (Recommended)
```bash
# Clone and setup
git clone https://github.com/thisisharshavardhan/Quantumania.git
cd Quantumania

# Configure environment
cp Backend/.env.sample Backend/.env
# Edit Backend/.env with your production values

# Build and run
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Option 2: Manual Deployment
```bash
# Backend
cd Backend
npm ci --only=production
npm run start:prod

# Frontend
cd ../Website
npm ci --only=production
npm run build
npm run preview
```

### Option 3: PM2 Process Manager
```bash
cd Backend
npm install -g pm2
npm run pm2:start
pm2 save
pm2 startup
```

## 🌐 Production Environment Variables

### Backend (.env)
```env
# Environment
NODE_ENV=production
PORT=3849

# Security
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# IBM Quantum API
IBM_QUANTUM_TOKEN=your-ibm-quantum-token
IBM_QUANTUM_HUB=your-hub
IBM_QUANTUM_GROUP=your-group
IBM_QUANTUM_PROJECT=your-project

# Monitoring
LOG_LEVEL=info
CACHE_TTL=300000
JOB_MONITOR_INTERVAL=30000

# Database (Optional)
DATABASE_URL=postgresql://user:pass@host:5432/quantumania
REDIS_URL=redis://user:pass@host:6379

# Monitoring (Optional)
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
```

### Frontend (.env)
```env
VITE_API_URL=https://api.your-domain.com
VITE_NODE_ENV=production
VITE_ENABLE_REAL_TIME=true
```

## 🔧 Production Scripts

### Backend Scripts
```bash
npm run start:prod      # Start in production mode
npm run pm2:start       # Start with PM2
npm run docker:build    # Build Docker image
npm run health          # Check health status
npm run logs           # View logs
```

### Frontend Scripts
```bash
npm run build:prod      # Production build
npm run preview:dist    # Preview production build
npm run docker:build    # Build Docker image
npm run serve          # Serve built files
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- **Backend**: `GET /health`
- **Frontend**: `GET /health` (via nginx)

### Log Locations
- Backend logs: `Backend/logs/`
- PM2 logs: `~/.pm2/logs/`
- Docker logs: `docker logs quantumania-backend`

### Monitoring Tools
- **Prometheus**: Metrics collection (port 9090)
- **Grafana**: Visualization dashboard (port 3000)
- **PM2**: Process monitoring
- **Docker**: Container health checks

## 🚀 Performance Tuning

### Backend Optimizations
- **Clustering**: PM2 cluster mode for multi-core usage
- **Memory**: Automatic restart on memory limit (500MB)
- **Caching**: In-memory caching with TTL
- **Compression**: Gzip compression for responses

### Frontend Optimizations
- **Bundle Splitting**: Vendor, router, and API chunks
- **Asset Caching**: 1-year cache for static assets
- **Compression**: Nginx gzip compression
- **CDN Ready**: Static assets optimized for CDN

## 🔒 Security Configuration

### Network Security
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;

# SSL/TLS
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
```

### Application Security
- **Input Validation**: Express-validator
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **CSRF**: SameSite cookies

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer (nginx/HAProxy)
- Multiple backend instances
- Session storage (Redis)
- Database clustering

### Vertical Scaling
- Increase container resources
- PM2 cluster mode
- Memory optimization
- CPU optimization

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**: Check CORS_ORIGIN environment variable
2. **Port Conflicts**: Ensure ports 3849, 5173 are available
3. **Memory Issues**: Monitor with `npm run pm2:logs`
4. **Socket.IO Issues**: Check WebSocket proxy configuration

### Debug Commands
```bash
# Check backend health
curl http://localhost:3849/health

# Check API response
curl http://localhost:3849/api/dashboard/overview

# View backend logs
tail -f Backend/logs/combined.log

# Check frontend build
cd Website && npm run build && ls -la dist/
```

## 📝 Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor log file sizes
- [ ] Check health endpoints
- [ ] Review security headers
- [ ] Update SSL certificates
- [ ] Backup configuration files

### Updates
```bash
# Update backend dependencies
cd Backend && npm update && npm audit fix

# Update frontend dependencies  
cd Website && npm update && npm audit fix

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🎯 Performance Metrics

### Target Benchmarks
- **API Response Time**: < 200ms (95th percentile)
- **Frontend Load Time**: < 2s (First Contentful Paint)
- **WebSocket Latency**: < 50ms
- **Memory Usage**: < 500MB per backend instance
- **CPU Usage**: < 80% under normal load

### Monitoring Queries
```sql
-- API Performance
SELECT avg(response_time) FROM api_logs WHERE timestamp > NOW() - INTERVAL '1 hour';

-- Error Rate
SELECT count(*) as errors FROM logs WHERE level = 'error' AND timestamp > NOW() - INTERVAL '1 hour';
```

---

## 🎉 Production Deployment Complete!

Your Quantumania application is now production-ready with:
- ✅ Enterprise-grade security
- ✅ High-performance optimizations  
- ✅ Comprehensive monitoring
- ✅ Scalable architecture
- ✅ Docker containerization
- ✅ Health checks and logging
- ✅ Graceful error handling

**Next Steps:**
1. Configure your domain and SSL certificate
2. Set up monitoring alerts
3. Configure automated backups
4. Set up CI/CD pipeline
5. Monitor performance metrics

For support, check the logs at `Backend/logs/` or open an issue on GitHub.
