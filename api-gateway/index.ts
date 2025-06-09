import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";
import notificationsRouter from "./routes/notifications.js";
import chatRoomsRouter from "./routes/chat-rooms.js";

import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// --- WebSocket Proxy Middleware ---
const wsProxy = createProxyMiddleware({
  target: "http://localhost:3010",
  changeOrigin: true,
  ws: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      if (req.url && req.url.startsWith("/chat")) {
        console.log(
          `[GATEWAY][Proxy] HTTP request to /chat:`,
          req.method,
          req.url
        );
      }
    },
    proxyReqWs: (proxyReq, req, socket) => {
      console.log(`[GATEWAY][WebSocket] Upgrade request for:`, req.url);
      socket.on("error", (error) => {
        console.error(`[GATEWAY][WebSocket] Socket error:`, error.message);
      });
    },
    error: (err, req, res) => {
      console.error(`[GATEWAY][Proxy Error]`, err.message, `on`, req.url);
    },
  },
});

app.use("/socket.io", wsProxy);

// --- API Routes ---
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/chat-rooms", chatRoomsRouter);

app.use(cookieParser());
app.use(express.json());

// --- Dummy endpoint for testing ---
app.get("/api/test", (req, res) => {
  res.json({
    message: "API Gateway is working!",
    time: new Date().toISOString(),
  });
});

// --- Start server and attach WebSocket upgrade handler ---
const PORT = process.env.PORT || 8082;
const server = app.listen(PORT, () => {
  console.log(`[STARTUP] API Gateway listening on port ${PORT}`);
});

// Attach WebSocket upgrade event for proper proxying
// server.on("upgrade", wsProxy.upgrade);

// --- Focused logging for debugging WebSocket flow ---
// You will see logs for:
// - HTTP proxying to /chat
// - WebSocket upgrade attempts
// - Proxy errors
// Noisy logs and redundant request logs have been removed for clarity.
