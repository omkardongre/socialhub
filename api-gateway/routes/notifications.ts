import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL, // Notification Service
  changeOrigin: true,
  pathRewrite: { "^/api/notifications": "" },
});
