import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:4000/api/:path*', 
      },
    ];
  },
  env: {
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
    NEXT_PUBLIC_OTHER_VAR: process.env.NEXT_PUBLIC_OTHER_VAR,
  },
};

export default nextConfig;
