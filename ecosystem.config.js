module.exports = {
  apps: [
    {
      name: 'jj-hub-api',
      cwd: './apps/api',
      script: 'node_modules/.bin/tsx',
      args: 'src/index.ts',
      env: {
        NODE_ENV: 'production',
        PORT: 4491,
        HOST: '0.0.0.0',
      },
      node_args: '--max-old-space-size=1536',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1500M',
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,
    },
    {
      name: 'jj-hub-web',
      cwd: './apps/web',
      script: 'node',
      args: '.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 4490,
        NITRO_PORT: 4490,
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};

