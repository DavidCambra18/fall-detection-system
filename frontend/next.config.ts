/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Esto permite que el Frontend use rutas relativas '/api/...'
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3000/api/:path*', 
      },
    ];
  },
};

export default nextConfig;