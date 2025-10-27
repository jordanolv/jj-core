import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: true, // Désactive l'optimisation d'images pour éviter les erreurs en prod
  },
};

export default nextConfig;
