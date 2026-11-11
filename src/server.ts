
import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { connectDB } from "./config/db.js";
import { auth } from "./config/auth.js";
import eventRoutes from "./routes/event.routes.js";

const app = express();

const PORT = process.env.PORT || 5000;

// CORS Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Better Auth Handler
app.all("/api/auth/{*any}", toNodeHandler(auth));

// JSON Middleware
app.use(express.json());

// Health Check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "KindConnect API is running!",
  });
});

// Event Routes
app.use("/api/events", eventRoutes);

// Start Server
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
