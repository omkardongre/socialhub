import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: "http://localhost:3005/notifications", // Notification Service
  changeOrigin: true,
  pathRewrite: { "^/api/notifications": "" },
});
