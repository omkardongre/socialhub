import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: "http://localhost:3002/users",
  changeOrigin: true,
  pathRewrite: { "^/api/users": "" },
});
