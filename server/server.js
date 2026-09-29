import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Attach io instance for controller access
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);

// Base Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Mini Billing System Backend",
    timestamp: new Date().toISOString(),
    socketClients: io.engine.clientsCount
  });
});

// Socket.io Connection & Event Handling
io.on("connection", (socket) => {
  console.log(`⚡ Client connected via Socket.IO: ${socket.id}`);

  // Welcome ping
  socket.emit("connected", {
    message: "Connected to Real-Time Billing & Alert Server",
    socketId: socket.id,
    time: new Date().toISOString()
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// Start Server & Connect MongoDB
server.listen(PORT, async () => {
  console.log(`🚀 Mini Billing System Server running on http://localhost:${PORT}`);
  await connectDB();
});
