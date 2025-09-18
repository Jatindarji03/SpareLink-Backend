import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

// ✅ To keep track of connected users
export const connectedUsers = new Map();

// ✅ Socket.io server
export const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins; adjust in production
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // 🔹 Register user
  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // 🔹 Send location to all other clients
  socket.on("send-location", (coords) => {
    socket.broadcast.emit("receive-location", coords);
  });

  // 🔹 Send alert from one user to another
  socket.on("send_alert", ({ senderId, receiverId, message }) => {
    const targetSocketId = connectedUsers.get(receiverId);

    if (targetSocketId) {
      io.to(targetSocketId).emit("receive_alert", { from: senderId, message });
      console.log(`Alert sent from ${senderId} to ${receiverId}`);
    } else {
      console.log(`User ${receiverId} not connected.`);
    }
  });

  // 🔹 Handle disconnect
  socket.on("disconnect", () => {
    for (const [userId, sockId] of connectedUsers.entries()) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

export { app, server };
