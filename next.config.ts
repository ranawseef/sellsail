import type { NextConfig } from "next";

// Hostinger caps the number of processes per account, so keep the build to
// one worker and avoid Turbopack (it spawns extra Node processes for CSS).
const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: true,
    webpackBuildWorker: false,
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
  },
};

export default nextConfig;
