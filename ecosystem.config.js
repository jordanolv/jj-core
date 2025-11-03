module.exports = {
  apps: [
    {
      name: 'jj-core',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 4490
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    }
  ]
};
