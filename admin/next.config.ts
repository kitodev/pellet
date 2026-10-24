import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Next from picking up the parent folder's lockfile as the workspace root.
  turbopack: { root: __dirname },
  // Product photos (5 MB each), gallery and PDF datasheet (10 MB) are sent through Server Actions.
  experimental: { serverActions: { bodySizeLimit: "40mb" } },
  serverExternalPackages: ["mysql2"],
};

export default nextConfig;
