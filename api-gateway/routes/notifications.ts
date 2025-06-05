import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: "http://localhost:3004", // Notification Service
  changeOrigin: true,
  pathRewrite: { "^/api/notifications": "" },
});
