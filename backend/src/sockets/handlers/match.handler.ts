import type { Server, Socket } from "socket.io";
import { roomManager } from "../../rooms/RoomManager.js";
import { matchManager } from "../../matches/MatchManager.js";
import type { UpdateProgressInput } from "../../matches/MatchManager.types.js";

interface SocketAckResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function registerMatchHandlers(io: Server, socket: Socket) {
  /**
   * 1. START MATCH (Host Only)
   * Moved here from room.handler.ts for domain separation.
   */
  socket.on(
    "match:start",
    async (payload: { code: string }, ack?: (res: SocketAckResponse) => void) => {
      try {
        if (!payload?.code) throw new Error("ROOM_CODE_REQUIRED");

        const roomCode = payload.code.toUpperCase().trim();
        const room = roomManager.getRoom(roomCode);

        if (!room) throw new Error("ROOM_NOT_FOUND");

        // Permission check: caller must be host
        const authUserId = socket.handshake.auth?.userId;
        const authUsername = socket.handshake.auth?.username;

        const isHost =
          room.host.socketId === socket.id ||
          (socket.data.userId && room.host.userId === socket.data.userId) ||
          (authUserId && room.host.userId === authUserId) ||
          (authUsername && room.host.displayName === authUsername);

        if (!isHost) {
          throw new Error("UNAUTHORIZED_HOST_ONLY: Only the room host can start the match.");
        }

        // Ensure guest is present
        if (!room.guest) {
          throw new Error("CANNOT_START_MATCH: Waiting for an opponent to join.");
        }

        // Start match: Samples questions from MongoDB & creates initial match records with sanitized questions
        const match = await matchManager.startMatch(room);

        // Join socket to match channel
        socket.join(`match:${match.matchId}`);

        // Broadcast to all players in the room that match has started
        io.to(room.code).emit("match:started", { match });

        if (typeof ack === "function") {
          ack({ success: true, data: match });
        }
      } catch (error: any) {
        if (typeof ack === "function") {
          ack({ success: false, error: error.message || "FAILED_TO_START_MATCH" });
        }
      }
    }
  );

  /**
   * 2. GET MATCH (Hydration for reload / direct entry into /match/:matchId)
   */
  socket.on(
    "match:get",
    async (payload: { matchId: string }, ack?: (res: SocketAckResponse) => void) => {
      try {
        if (!payload?.matchId) throw new Error("MATCH_ID_REQUIRED");

        const matchId = payload.matchId.trim();
        const match = await matchManager.getMatchWithQuestions(matchId);

        if (!match) {
          throw new Error("MATCH_NOT_FOUND");
        }

        // Ensure this socket joins the match room for real-time duel updates
        socket.join(`match:${match.matchId}`);
        if (match.roomCode) {
          socket.join(match.roomCode);
        }
        socket.data.matchId = match.matchId;

        if (typeof ack === "function") {
          ack({ success: true, data: match });
        }
      } catch (error: any) {
        if (typeof ack === "function") {
          ack({ success: false, error: error.message || "MATCH_NOT_FOUND" });
        }
      }
    }
  );

  /**
   * 3. UPDATE PROGRESS (Live Test Case updates during match)
   */
  socket.on(
    "match:update_progress",
    (payload: UpdateProgressInput, ack?: (res: SocketAckResponse) => void) => {
      try {
        if (!payload?.matchId || !payload?.questionId) {
          throw new Error("INVALID_PROGRESS_DATA");
        }

        const match = matchManager.updatePlayerProgress(payload);

        // Broadcast updated stats to both duelists
        const updateEventPayload = {
          matchId: match.matchId,
          player1Stats: match.player1Stats,
          player2Stats: match.player2Stats,
        };

        io.to(`match:${match.matchId}`).emit("match:progress_updated", updateEventPayload);
        if (match.roomCode) {
          io.to(match.roomCode).emit("match:progress_updated", updateEventPayload);
        }

        if (typeof ack === "function") {
          ack({ success: true, data: match });
        }
      } catch (error: any) {
        if (typeof ack === "function") {
          ack({ success: false, error: error.message || "FAILED_TO_UPDATE_PROGRESS" });
        }
      }
    }
  );
}
