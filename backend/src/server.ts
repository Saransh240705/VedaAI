import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { connectDB } from "./config/db";
import { setupSocket } from "./socket";
import assignmentRoutes from "./routes/assigments.route";
import papersRoute from "./routes/papers.route";
import "./workers/generationWorker";
import uploadRoute from "./routes/upload.route";
import authRoutes from "./routes/auth.route";
import groupRoutes from "./routes/groups.route";
import templateRoutes from "./routes/templates.route";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://PrepStackai-mkhh.onrender.com",
  "https://PrepStack-ai-sage-nine.vercel.app",
];

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server, mobile apps, curl)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/papers", papersRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/groups", groupRoutes);
app.use("/api/templates", templateRoutes);

const server = http.createServer(app);

setupSocket(server);

const rawPort = process.env.PORT;
let PORT = 5001;
if (rawPort) {
  const parsed = Number(rawPort);
  if (!isNaN(parsed)) {
    PORT = parsed;
  } else {
    console.warn(
      `[PrepStackAI] WARNING: PORT environment variable ("${rawPort}") is not a valid number. Falling back to default port 5001.`,
    );
  }
}

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
