import { createProxyMiddleware } from "http-proxy-middleware";

export default createProxyMiddleware({
  target: "http://localhost:3003/posts",
  changeOrigin: true,
  pathRewrite: { "^/api/posts": "" },
});
