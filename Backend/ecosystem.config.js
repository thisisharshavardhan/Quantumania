module.exports = {
  apps: [{
    name: 'quantumania-backend',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3849
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3849
    },
    log_file: './logs/pm2-combined.log',
    out_file: './logs/pm2-out.log',
    error_file: './logs/pm2-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_memory_restart: '500M',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    listen_timeout: 8000,
    shutdown_with_message: true,
    wait_ready: true,
    autorestart: true,
    vizion: false,
    post_update: ['npm install'],
    source_map_support: true,
    instance_var: 'INSTANCE_ID'
  }]
};
