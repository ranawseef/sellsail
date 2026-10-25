import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/guides", destination: "/blog", permanent: true },
      // The beta list became the free trial at launch.
      { source: "/beta", destination: "/signup", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    serverActions: {
      // CSV uploads in the dashboard are up to 5 MB (the default limit is 1 MB).
      bodySizeLimit: "6mb",
      // Next rejects a server action whose Origin doesn't match the Host it
      // sees; name the live domains in case Hostinger's proxy rewrites Host.
      allowedOrigins: ["sellsail.io", "www.sellsail.io"],
    },
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
