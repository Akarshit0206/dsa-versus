import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { authRouter, submissionRouter, userRouter } from "./routes/index.js";
import { errorHandler } from "./middlewares/index.js";

export const app = express();
export const server = http.createServer(app);

// Enable trust proxy so secure cookies work behind Render / cloud load balancers
app.set("trust proxy", 1);

// Resolve allowed origins dynamically for CORS and Socket.io
const parseAllowedOrigins = (): string[] => {
  const envOrigins = process.env.CLIENT_URL || "";
  const list = envOrigins
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (!list.includes("http://localhost:5173")) list.push("http://localhost:5173");
  if (!list.includes("http://127.0.0.1:5173")) list.push("http://127.0.0.1:5173");
  return list;
};

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true; // allow non-browser requests (Postman, curl, health checks)
  const clean = origin.replace(/\/$/, "");
  const allowed = parseAllowedOrigins();

  if (allowed.includes(clean) || allowed.includes("*")) return true;
  // Automatically support Vercel preview and production domains
  if (clean.endsWith(".vercel.app") || clean.includes("localhost") || clean.includes("127.0.0.1")) {
    return true;
  }
  return false;
};

export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, origin || true);
      }
    },
    credentials: true,
  },
});

// middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, origin || true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Healthcheck endpoints for Render and monitoring
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/", (req, res) => {
  res.status(200).send("DSA Versus API is operational");
});

// routes
app.use("/api/auth", authRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api/user", userRouter);

// errorHandler
app.use(errorHandler);