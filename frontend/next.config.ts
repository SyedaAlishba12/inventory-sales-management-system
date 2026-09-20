import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      // Proxy API requests to FastAPI
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },

      // Proxy uploaded product images to FastAPI
      {
        source: "/uploads/:path*",
        destination: "http://localhost:8000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;