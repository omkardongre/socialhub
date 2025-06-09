import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: "http://localhost:3006/chat-rooms", // Chat Service
  changeOrigin: true,
  pathRewrite: { "^/api/chat-rooms": "" },
});
