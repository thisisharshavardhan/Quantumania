# Production Dockerfile for Quantumania Backend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for better security and performance
RUN apk add --no-cache \
    dumb-init \
    curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S quantumania -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY --chown=quantumania:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown -R quantumania:nodejs logs

# Expose port
EXPOSE 3849

# Switch to non-root user
USER quantumania

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3849/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
