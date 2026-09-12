import type { Server, Socket } from "socket.io";
import { Types } from "mongoose";
import { roomManager } from "../../rooms/RoomManager.js";
import type { CreateRoomInput } from "../../rooms/RoomManager.types.js";

interface CreateRoomSocketPayload extends CreateRoomInput {
  displayName?: string;
}

interface JoinRoomSocketPayload {
  code: string;
  displayName?: string;
}

interface SocketAckResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

function resolveUserId(socket: Socket): string {
  const authUserId = socket.handshake.auth?.userId;
  if (authUserId && Types.ObjectId.isValid(authUserId)) {
    return authUserId;
  }
  return new Types.ObjectId().toString();
}

function resolveUsername(socket: Socket, fallback: string): string {
  return socket.handshake.auth?.username || fallback;
}

export function registerRoomHandlers(io: Server, socket: Socket) {
  /**
   * 1. CREATE ROOM
   */
  socket.on(
    "room:create",
    (payload: CreateRoomSocketPayload, ack?: (res: SocketAckResponse) => void) => {
      try {
        const userId = resolveUserId(socket);
        const displayName = payload.displayName || resolveUsername(socket, "Host");

        const hostPlayer = {
          userId,
          displayName,
          socketId: socket.id,
        };

        const room = roomManager.createRoom(hostPlayer, payload);

        // Join socket channel
        socket.join(room.code);
        socket.data.roomCode = room.code;
        socket.data.userId = userId;

        if (typeof ack === "function") {
          ack({ success: true, data: room });
        }
      } catch (error: any) {
        if (typeof ack === "function") {
          ack({ success: false, error: error.message || "FAILED_TO_CREATE_ROOM" });
        }
      }
    }
  );

  /**
   * 2. JOIN ROOM
   */
  socket.on(
    "room:join",
    (payload: JoinRoomSocketPayload, ack?: (res: SocketAckResponse) => void) => {
      try {
        if (!payload?.code) {
          throw new Error("ROOM_CODE_REQUIRED");
        }

        const roomCode = payload.code.toUpperCase().trim();
        const userId = resolveUserId(socket);
        const displayName = payload.displayName || resolveUsername(socket, "Guest");

        const guestPlayer = {
          userId,
          displayName,
          socketId: socket.id,
        };

        const room = roomManager.joinRoom(roomCode, guestPlayer);

        // Join socket channel
        socket.join(room.code);
        socket.data.roomCode = room.code;
        socket.data.userId = userId;

        // Acknowledge the joining guest
        if (typeof ack === "function") {
          ack({ success: true, data: room });
        }

        // Broadcast updated room state to all players in the lobby
        io.to(room.code).emit("room:updated", room);
      } catch (error: any) {
        if (typeof ack === "function") {
          ack({ success: false, error: error.message || "FAILED_TO_JOIN_ROOM" });
        }
      }
    }
  );

  /**
   * 3. GET ROOM (For page refresh / hydration in /room/:code)
   */
  socket.on("room:get", (payload: { code: string }, ack?: (res: SocketAckResponse) => void) => {
    try {
      if (!payload?.code) throw new Error("ROOM_CODE_REQUIRED");

      const room = roomManager.getRoom(payload.code.toUpperCase().trim());
      if (!room) throw new Error("ROOM_NOT_FOUND");

      // Ensure socket is in the room channel
      socket.join(room.code);
      socket.data.roomCode = room.code;

      const authUserId = socket.handshake.auth?.userId;
      const authUsername = socket.handshake.auth?.username;
      if (authUserId) {
        socket.data.userId = authUserId;
      }

      // Sync active socket ID if reconnecting
      if (
        (authUserId && room.host.userId === authUserId) ||
        (authUsername && room.host.displayName === authUsername)
      ) {
        room.host.socketId = socket.id;
        room.host.isConnected = true;
      } else if (
        room.guest &&
        ((authUserId && room.guest.userId === authUserId) ||
          (authUsername && room.guest.displayName === authUsername))
      ) {
        room.guest.socketId = socket.id;
        room.guest.isConnected = true;
      }

      if (typeof ack === "function") {
        ack({ success: true, data: room });
      }
    } catch (error: any) {
      if (typeof ack === "function") {
        ack({ success: false, error: error.message || "ROOM_NOT_FOUND" });
      }
    }
  });


  /**
   * 5. LEAVE ROOM
   */
  socket.on("room:leave", (payload: { code: string }, ack?: (res: SocketAckResponse) => void) => {
    try {
      if (!payload?.code) throw new Error("ROOM_CODE_REQUIRED");

      const roomCode = payload.code.toUpperCase().trim();
      const userId = socket.data.userId || resolveUserId(socket);

      const result = roomManager.leaveRoom(roomCode, userId);

      socket.leave(roomCode);
      socket.data.roomCode = undefined;

      if (result.action === "ROOM_DELETED") {
        io.to(roomCode).emit("room:deleted", { message: "Host left the room. Room disbanded." });
      } else if (result.action === "GUEST_REMOVED" && result.room) {
        io.to(roomCode).emit("room:updated", result.room);
      }

      if (typeof ack === "function") {
        ack({ success: true, data: result });
      }
    } catch (error: any) {
      if (typeof ack === "function") {
        ack({ success: false, error: error.message || "FAILED_TO_LEAVE_ROOM" });
      }
    }
  });

  /**
   * 6. SOCKET DISCONNECT
   */
  socket.on("disconnect", () => {
    const roomCode = socket.data.roomCode;
    const userId = socket.data.userId;

    if (roomCode && userId) {
      try {
        const room = roomManager.getRoom(roomCode);
        if (room && room.status === "waiting") {
          const result = roomManager.leaveRoom(roomCode, userId);
          if (result.action === "ROOM_DELETED") {
            io.to(roomCode).emit("room:deleted", { message: "Host disconnected. Room closed." });
          } else if (result.action === "GUEST_REMOVED" && result.room) {
            io.to(roomCode).emit("room:updated", result.room);
          }
        }
      } catch {
        // Ignore disconnect cleanup errors if room was already cleared
      }
    }
  });
}
