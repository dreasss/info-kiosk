/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: [
      "385e8f19d4cf4d5cb0a3c46edf9e8d70-2e83e5f1b03f49ac99bd54813.projects.builder.codes",
    ],
  },
};

export default nextConfig;
