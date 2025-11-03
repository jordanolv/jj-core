import withPWA from "next-pwa";

const nextConfig = {
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Activer l'instrumentation pour les cron jobs
  experimental: {
    instrumentationHook: true,
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Désactivé en dev (on utilise sw-push.js direct)
  swSrc: "worker/index.js", // Service worker custom avec gestion des notifications push
})(nextConfig);
