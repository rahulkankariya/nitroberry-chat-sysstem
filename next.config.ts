import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    // In modern Next.js, use 'position' directly inside devIndicators
    position: 'bottom-right', 
  },
};

export default nextConfig;