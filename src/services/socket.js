import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on("connect", () => {
  console.log("⚡ Connected to Socket.IO Server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔌 Disconnected from Socket.IO Server");
});

socket.on("connect_error", (error) => {
  console.warn("⚠️ Socket.IO Connection Error (backend may be starting):", error.message);
});
