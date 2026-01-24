/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@kissa/shared', '@kissa/api-client'],
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001',
  },
};

export default nextConfig;
