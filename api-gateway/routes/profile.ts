import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: process.env.PROFILE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { "^/api/profile": "" },
});
