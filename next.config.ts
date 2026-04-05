import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // Turbopack filesystem cache can occasionally corrupt on Windows dev setups.
    // Keep Turbopack enabled but disable on-disk cache for stability.
    turbopackFileSystemCacheForDev: false,
  },
  typescript: {
    // `tsc --noEmit` runs in the build script so builds stay type-safe
    // without relying on Next's worker process on this Windows setup.
    ignoreBuildErrors: true,
  },
  images: {
    qualities: [75, 85, 90, 92, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
