// eslint-disable-next-line @typescript-eslint/no-require-imports
const isProd = process.env.NODE_ENV === "production";

let withBundleAnalyzer = (config) => config;
try {
  if (!isProd) {
    withBundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: process.env.ANALYZE === "true",
    });
  }
} catch (e) {
  // Ignore if not installed
}

const nextConfig = {
  images: {
    domains: ["gravatar.com", "socialhub-test.s3.us-east-1.amazonaws.com"],
  },
  // add any other config options here
};

module.exports = withBundleAnalyzer(nextConfig);
