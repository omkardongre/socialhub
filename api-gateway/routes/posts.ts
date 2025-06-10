import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: process.env.POST_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { "^/api/posts": "" },
});
