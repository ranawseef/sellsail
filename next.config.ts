import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/guides", destination: "/blog", permanent: true }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    // CSV uploads in the dashboard are up to 5 MB (the default limit is 1 MB).
    serverActions: { bodySizeLimit: "6mb" },
    // Hostinger caps the number of processes per account, so keep the build
    // to one worker and avoid Turbopack (it spawns extra Node processes for CSS).
    cpus: 1,
    workerThreads: true,
    webpackBuildWorker: false,
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
  },
};

export default nextConfig;
