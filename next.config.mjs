/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable the telemetry
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
