import { io } from "socket.io-client";

// Central socket instance for the entire application
export const socket = io("http://localhost:5000", {
  autoConnect: true,
});
