import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRouter from "./routes/auth.js";
import userRouter from "./routes/users.js";
import profileRouter from "./routes/profile.js";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";
import notificationsRouter from "./routes/notifications.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Mount proxy routes BEFORE body parsers to avoid issues with request body forwarding (best practice for http-proxy-middleware)
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/notifications", notificationsRouter);

app.use(cookieParser());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[GATEWAY] ${req.method} ${req.originalUrl}`);
  next();
});

// Dummy endpoint for testing
app.get("/api/test", (req, res) => {
  res.json({
    message: "API Gateway is working!",
    time: new Date().toISOString(),
  });
});

app.listen(process.env.PORT || 8082, () => {
  console.log(`API Gateway listening on port ${process.env.PORT || 8082}`);
});
