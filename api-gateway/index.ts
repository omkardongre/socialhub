import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { env } from "./env.js";

import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";
import notificationsRouter from "./routes/notifications.js";
import chatRoomsRouter from "./routes/chat-rooms.js";
import mediaRouter from "./routes/media.js";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

// --- Simple industry-style logger ---
function log(
  level: "INFO" | "ERROR" | "WARN" | "DEBUG",
  message: string,
  meta: Record<string, any> = {}
) {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length
    ? ` | meta: ${JSON.stringify(meta)}`
    : "";
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] [${level}] ${message}${metaString}`);
}

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://socialhub.omkard.site",
  "socialhub-bxqn183k8-omkardongres-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// --- WebSocket Proxy Middleware ---
const wsProxy = createProxyMiddleware({
  target: env.CHAT_SERVICE_WS_URL,
  changeOrigin: true,
  ws: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      if (req.url && req.url.startsWith("/chat")) {
        log("INFO", "Proxy HTTP request to /chat", {
          method: req.method,
          url: req.url,
        });
      }
    },
    proxyReqWs: (proxyReq, req, socket) => {
      log("INFO", "WebSocket upgrade request", { url: req.url });
      socket.on("error", (error) => {
        log("ERROR", "WebSocket socket error", {
          error: error.message,
          url: req.url,
        });
      });
    },
    error: (err, req, res) => {
      log("ERROR", "Proxy error", { error: err.message, url: req.url });
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
app.use("/api/media", mediaRouter);

app.use(cookieParser());
app.use(express.json());

// --- Request logging middleware ---
app.use((req, res, next) => {
  log("INFO", "Incoming HTTP request", {
    method: req.method,
    url: req.originalUrl,
  });
  next();
});

// --- Dummy endpoint for testing ---
app.get("/api/test", (req, res) => {
  res.json({
    message: "API Gateway is working!",
    time: new Date().toISOString(),
  });
});

// --- Start server and attach WebSocket upgrade handler ---
const PORT = env.PORT || 8082;
const server = app.listen(PORT, () => {
  log("INFO", "API Gateway listening", { port: PORT });
});

// Attach WebSocket upgrade event for proper proxying
// server.on("upgrade", wsProxy.upgrade);

// --- Focused logging for debugging WebSocket flow ---
// You will see logs for:
// - HTTP proxying to /chat
// - WebSocket upgrade attempts
// - Proxy errors
// Noisy logs and redundant request logs have been removed for clarity.
