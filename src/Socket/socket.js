import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const connectedUsers = new Map(); // To keep track of connected users
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity; adjust as needed
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  },
  transports: ['websocket', 'polling'], // Use WebSocket and polling transports
});
io.on('connection', (socket) => {
 

  // Listen for user registration
  socket.on('register', (userId) => {
    console.log(`User registered: ${userId}`);
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });
  socket.on("send-location", (coords) => {
    // Broadcast to all clients
    // console.log(`Location received from user: ${coords}`);
    
    socket.broadcast.emit("receive-location", coords);
  });


  // Handle disconnect
  socket.on('disconnect', () => {
    for (const [userId, sockId] of connectedUsers.entries()) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });

  // Send alert from sender to receiver
  socket.on('send_alert', ({ senderId, receiverId, message }) => {
    // Log all connected users
    console.log("----- Connected Users -----");
    connectedUsers.forEach((socketId, userId) => {
      console.log(`User ${userId} is connected with socket ID ${socketId}`);
    });
    console.log("---------------------------");

    // Get the target socket ID using receiverId
    let targetSocketId = connectedUsers.get(receiverId);

    console.log(`Sending alert from ${senderId} to ${receiverId}`);
    console.log(`Target socket ID: ${targetSocketId}`);

    // Send alert to receiver if connected
    if (targetSocketId) {
      io.to(targetSocketId).emit('receive_alert', {
        from: senderId,
        message,
      });
    } else {
      console.log(`User ${receiverId} is not connected or not registered.`);
    }
  });

});


export { app, server, io };