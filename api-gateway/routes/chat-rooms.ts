import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: process.env.CHAT_ROOMS_SERVICE_URL, // Chat Service
  changeOrigin: true,
  pathRewrite: { "^/api/chat-rooms": "" },
});
