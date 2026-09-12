import { io } from "../app.js";
import { registerRoomHandlers } from "./handlers/room.handler.js";
import { registerMatchHandlers } from "./handlers/match.handler.js";

io.on("connection", (socket) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("⚡ Socket connected:", socket.id);
  }

  // Register domain socket handlers
  registerRoomHandlers(io, socket);
  registerMatchHandlers(io, socket);

  socket.on("disconnect", () => {
    if (process.env.NODE_ENV !== "production") {
      console.log("🔌 Socket disconnected:", socket.id);
    }
  });
});