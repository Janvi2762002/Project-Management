import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

import userRoutes from "./src/routes/userRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import Message from "./src/models/message.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected 🚀"))
  .catch(err => console.log(err));

app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/projects", projectRoutes);
app.use("/chat", chatRoutes);

// Socket.io logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_project", (projectId) => {
    socket.join(projectId);
    console.log(`Socket ${socket.id} joined project: ${projectId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      // Save message to DB
      const newMessage = await Message.create({
        project: data.project,
        user: data.user,
        text: data.text
      });

      // Prepare broadcast data
      const broadcastData = {
        _id: newMessage._id,
        project: newMessage.project,
        user: {
          _id: newMessage.user,
          name: data.userName
        },
        text: newMessage.text,
        createdAt: newMessage.createdAt
      };

      // Broadcast to all users in the room
      io.to(data.project).emit("receive_message", broadcastData);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("join_task_comments", (taskId) => {
    socket.join(`task_${taskId}`);
    console.log(`Socket ${socket.id} joined comments for task: ${taskId}`);
  });

  socket.on("typing_comment", (data) => {
    // data: { taskId, userName }
    socket.to(`task_${data.taskId}`).emit("user_typing_comment", data);
  });

  socket.on("stop_typing_comment", (data) => {
    // data: { taskId, userName }
    socket.to(`task_${data.taskId}`).emit("user_stopped_typing_comment", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));