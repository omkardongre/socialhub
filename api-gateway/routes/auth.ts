import { createProxyMiddleware } from "http-proxy-middleware";

// const onProxyReq = (proxyReq: any, req: any, res: any) => {
//   // Log outgoing proxy requests
//   const host = proxyReq.getHeader("host") || "localhost:3001";
//   const path = proxyReq.path;
//   console.log(`[PROXY OUT] ${req.method} http://${host}${path}`);
// };

// const onProxyRes = (proxyRes: any, req: any, res: any) => {
//   // Log incoming proxy responses
//   const host = proxyRes.req?.getHeader
//     ? proxyRes.req.getHeader("host")
//     : "localhost:3001";
//   const path = proxyRes.req?.path || "";
//   console.log(
//     `[PROXY IN] Response from ${host}${path} - Status: ${proxyRes.statusCode}`
//   );
// };

export default createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL, // Auth Service
  changeOrigin: true,
  pathRewrite: { "^/api/auth": "" },
  cookieDomainRewrite: "localhost",
  // on: {
  //   proxyReq: onProxyReq,
  //   proxyRes: onProxyRes,
  // },
});
