# Quantumania Production Deployment Guide

## 🚀 Production Features Implemented

### ✅ Backend Enhancements
- **Enhanced Security**: Helmet.js with CSP, CORS configuration, rate limiting
- **Performance**: Compression, response caching, connection pooling
- **Monitoring**: Structured logging, health checks, graceful shutdown
- **Error Handling**: Production-grade error handling and recovery
- **Process Management**: PM2 configuration for clustering
- **Container Support**: Docker with security best practices

### ✅ Frontend Enhancements  
- **Build Optimization**: Minification, tree shaking, chunk splitting
- **Performance**: Static asset caching, compression
- **Security**: CSP headers, XSS protection
- **Production Serving**: Nginx with optimized configuration

### ✅ Infrastructure
- **Container Orchestration**: Docker Compose with health checks
- **Service Monitoring**: Health check endpoints, logging
- **Database Support**: PostgreSQL and Redis integration ready
- **Observability**: Prometheus and Grafana monitoring setup

## 🔧 Quick Production Start

### Option 1: Docker Compose (Recommended)
```bash
# 1. Set environment variables
cp Backend/.env.sample Backend/.env
# Edit Backend/.env with your production values

# 2. Start all services
docker-compose -f docker-compose.prod.yml up -d

# 3. Verify deployment
curl http://localhost:3849/health
curl http://localhost:5173/health
```

### Option 2: Manual Deployment
```bash
# Backend
cd Backend
npm install
npm run start:prod

# Frontend (in new terminal)
cd Website  
npm install
npm run build
npm run preview
```

### Option 3: PM2 Process Manager
```bash
cd Backend
npm install -g pm2
npm run pm2:start
pm2 status
```

## 🛡️ Security Configuration

### Environment Variables
Copy and configure these files:
- `Backend/.env` - Production environment variables
- Set strong passwords for JWT_SECRET, REDIS_PASSWORD, etc.
- Configure CORS_ORIGIN for your domain

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection enabled
- X-Content-Type-Options: nosniff

### Rate Limiting
- API: 1000 requests per 15 minutes per IP
- Configurable via environment variables
- Automatic retry-after headers

## 📊 Monitoring & Health Checks

### Health Endpoints
- Backend: `http://localhost:3849/health`
- Frontend: `http://localhost:5173/health`

### Logging
- **Winston Logger**: Structured JSON logging
- **Log Levels**: error, warn, info, debug
- **Log Files**: 
  - `logs/combined.log` - All logs
  - `logs/error.log` - Errors only
  - `logs/exceptions.log` - Uncaught exceptions

### Monitoring Commands
```bash
# View logs in real-time
npm run logs

# Check system health
npm run health

# PM2 monitoring
npm run pm2:logs
```

## 🔄 Performance Optimizations

### Backend
- **Compression**: Gzip compression for responses
- **Caching**: In-memory caching with TTL
- **Connection Pooling**: Optimized for concurrent requests
- **Clustering**: PM2 cluster mode for multi-core utilization

### Frontend
- **Code Splitting**: Vendor, router, and API chunks
- **Minification**: Terser with console removal
- **Static Caching**: 1-year cache for assets
- **Gzip**: Nginx compression for all text assets

## 📦 Container Management

### Docker Commands
```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale backend
docker-compose -f docker-compose.prod.yml up -d --scale quantumania-backend=3

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Health Monitoring
```bash
# Check container health
docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"

# View resource usage
docker stats
```

## 🗄️ Database Integration

### PostgreSQL Setup (Optional)
```bash
# Enable in docker-compose.prod.yml
# Set database credentials in .env:
POSTGRES_DB=quantumania
POSTGRES_USER=quantumania  
POSTGRES_PASSWORD=your_secure_password
```

### Redis Caching (Optional)
```bash
# Enable in docker-compose.prod.yml
# Set Redis password in .env:
REDIS_PASSWORD=your_redis_password
```

## 📈 Production Monitoring

### Metrics Available
- **System**: CPU, Memory, Disk usage
- **Application**: Request count, response time, error rate
- **Business**: Quantum jobs, backend status, queue analytics

### Grafana Dashboards
Access at `http://localhost:3000` (admin/admin123)
- System metrics dashboard
- Application performance monitoring
- Quantum computing analytics

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3849, 5173 are available
2. **Memory issues**: Monitor with `docker stats`, increase limits if needed
3. **CORS errors**: Check CORS_ORIGIN in .env matches frontend URL
4. **Health check failures**: Verify backend is responding at /health

### Debug Commands
```bash
# Check backend logs
docker logs quantumania-backend

# Check frontend logs  
docker logs quantumania-frontend

# Test API connectivity
curl -i http://localhost:3849/api/quantum/jobs

# Test WebSocket connection
wscat -c ws://localhost:3849/socket.io/?EIO=4&transport=websocket
```

### Emergency Commands
```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Force recreate containers
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# Emergency stop
docker-compose -f docker-compose.prod.yml down --remove-orphans
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Update code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Zero-downtime PM2 restart
npm run pm2:restart
```

### Backup Procedures
```bash
# Backup logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz Backend/logs/

# Backup database (if using PostgreSQL)
docker exec quantumania-postgres pg_dump -U quantumania quantumania > backup.sql
```

## 🌐 Production Checklist

- [ ] Environment variables configured
- [ ] SSL/TLS certificates installed (for HTTPS)
- [ ] Domain name configured
- [ ] Rate limiting tested
- [ ] Health checks responding
- [ ] Logging working properly
- [ ] Error handling tested
- [ ] Performance benchmarked
- [ ] Security headers verified
- [ ] Backup procedures in place
- [ ] Monitoring alerts configured

## 📞 Support

For production issues:
1. Check logs: `npm run logs`
2. Verify health: `npm run health`
3. Review configuration in `.env` files
4. Check GitHub issues for known problems

## 🎯 Next Steps

1. **SSL/TLS**: Configure HTTPS with Let's Encrypt
2. **CDN**: Setup CloudFlare or AWS CloudFront
3. **Load Balancer**: Add nginx or HAProxy for multiple instances
4. **Database**: Migrate to persistent PostgreSQL storage
5. **Monitoring**: Setup alerts for critical metrics
6. **CI/CD**: Automate deployment with GitHub Actions
