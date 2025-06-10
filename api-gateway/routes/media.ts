import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: process.env.MEDIA_SERVICE_URL, // Media Service
  changeOrigin: true,
  pathRewrite: { "^/api/media": "" },
});
