/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["gravatar.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:3001/auth/:path*", // Proxy to Auth Service
      },
      {
        source: "/api/user/:path*",
        destination: "http://localhost:3002/user/:path*", // Proxy to User Service
      },
      {
        source: "/api/profile/:path*",
        destination: "http://localhost:3002/profile/:path*",
      },
      {
        source: "/api/users/:path*",
        destination: "http://localhost:3002/users/:path*",
      },
      {
        source: "/api/posts/:path*",
        destination: "http://localhost:3003/posts/:path*", // Proxy to Post Service
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:3004/:path*", // Proxy to Notification Service
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:3005/:path*", // Proxy to Chat Service
      },
    ];
  },
};

module.exports = nextConfig;
