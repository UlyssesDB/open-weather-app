import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["tile.openweathermap.org"], // Add this line
  },
};

export default nextConfig;
