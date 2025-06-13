// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  images: {
    domains: ["gravatar.com", "socialhub-test.s3.us-east-1.amazonaws.com"],
  },
  // add any other config options here
};

module.exports = withBundleAnalyzer(nextConfig);
