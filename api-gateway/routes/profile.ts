import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: "http://localhost:3002/profile",
  changeOrigin: true,
  pathRewrite: { "^/api/profile": "" },
});
