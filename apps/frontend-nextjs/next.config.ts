import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'socialhub-media-bucket-1.s3.us-east-1.amazonaws.com',
    ],
  },
};

export default nextConfig;
