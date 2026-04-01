import Notification from "../models/notification.js";
import User from "../models/user.js";

let io;

export const initNotifications = (socketIo) => {
  io = socketIo;
};

// Global map to track user sockets
const userSockets = new Map();

export const registerUserSocket = (userId, socketId) => {
  userSockets.set(userId.toString(), socketId);
};

export const unregisterUserSocket = (socketId) => {
  for (const [userId, curSocketId] of userSockets.entries()) {
    if (curSocketId === socketId) {
      userSockets.delete(userId);
      break;
    }
  }
};

/**
 * Creates a notification in the DB and emits it via socket if user is online
 */
export const createNotification = async ({ userId, type, message, taskId, projectId }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      message,
      taskId,
      projectId
    });

    const socketId = userSockets.get(userId.toString());
    if (socketId && io) {
      io.to(socketId).emit("new_notification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

/**
 * Scans text for @Name mentions and notifies mentioned users
 */
export const handleMentions = async (text, currentUserId, taskId, projectId, messagePrefix) => {
  const mentionRegex = /@([a-zA-Z0-9 ]+)/g;
  const matches = [...text.matchAll(mentionRegex)];
  
  for (const match of matches) {
    const name = match[1].trim();
    const mentionedUser = await User.findOne({ name: new RegExp(`^${name}$`, "i") });
    
    if (mentionedUser && mentionedUser._id.toString() !== currentUserId.toString()) {
      await createNotification({
        userId: mentionedUser._id,
        type: "mention",
        message: `${messagePrefix} mentioned you: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
        taskId,
        projectId
      });
    }
  }
};
