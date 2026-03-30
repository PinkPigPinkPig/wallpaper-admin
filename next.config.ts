import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['freshness-wallpaper.xyz'],
  },
};

export default nextConfig;
