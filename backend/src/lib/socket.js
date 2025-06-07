import { Server } from "socket.io";
import http from "http";
import express from "express";

const userSocketMap = {}; // Store userId: socketId mappings

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chatty-fj4v.onrender.com", // Replace with your deployed frontend
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", socket.id, "UserID:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.join(userId);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    for (let uid in userSocketMap) {
      if (userSocketMap[uid] === socket.id) {
        delete userSocketMap[uid];
        break;
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app };
