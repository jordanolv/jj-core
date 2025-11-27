module.exports = {
  apps: [
    {
      name: "jj-web",
      cwd: ".",
      script: "npm",
      args: "run dev:web",
      env: {
        NODE_ENV: "development",
        HOST: "0.0.0.0",
        PORT: 4490,
        NITRO_PORT: 4490,
      },
      watch: false,
      autorestart: true,
    },
    {
      name: "jj-api",
      cwd: ".",
      script: "npm",
      args: "run dev:api",
      env: {
        NODE_ENV: "development",
        PORT: 4491,
        HOST: "0.0.0.0",
      },
      watch: false,
      autorestart: true,
    },
  ],
};

