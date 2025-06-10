import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: "http://localhost:3004/media", // Media Service
  changeOrigin: true,
  pathRewrite: { "^/api/media": "" },
});
