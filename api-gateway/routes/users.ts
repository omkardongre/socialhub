import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: process.env.USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { "^/api/users": "" },
});
