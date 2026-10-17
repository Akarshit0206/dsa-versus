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

        const authUserId = socket.handshake.auth?.userId || socket.data.userId;
        if (authUserId) {
          socket.data.userId = authUserId;
          if (match.player1.userId === authUserId) {
            match.player1.socketId = socket.id;
            match.player1.isConnected = true;
          } else if (match.player2.userId === authUserId) {
            match.player2.socketId = socket.id;
            match.player2.isConnected = true;
          }
        }

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
    async (payload: UpdateProgressInput, ack?: (res: SocketAckResponse) => void) => {
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

        // Check if this progress update triggered a win condition (e.g. all problems solved)
        const resolution = matchManager.checkAndResolveWinner(match.matchId);
        if (resolution.isEnded) {
          const finalizedMatch = await matchManager.finalizeMatch(
            match.matchId,
            resolution.winnerId,
            resolution.reason
          );

          const endPayload = {
            matchId: match.matchId,
            winnerUserId: resolution.winnerId || undefined,
            reason: resolution.reason,
            match: finalizedMatch,
          };

          io.to(`match:${match.matchId}`).emit("match:ended", endPayload);
          if (match.roomCode) {
            io.to(match.roomCode).emit("match:ended", endPayload);
          }
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

  /**
   * 4. END MATCH / TIMEOUT / FORFEIT
   */
  socket.on(
    "match:end",
    async (
      payload: { matchId: string; reason?: string; forfeit?: boolean },
      ack?: (res: SocketAckResponse) => void
    ) => {
      try {
        if (!payload?.matchId) throw new Error("MATCH_ID_REQUIRED");
        const match = matchManager.getMatch(payload.matchId);
        if (!match) throw new Error("MATCH_NOT_FOUND");

        const authUserId = socket.handshake.auth?.userId || socket.data.userId;
        const forfeitUserId = payload.forfeit ? authUserId : undefined;

        const resolution = matchManager.checkAndResolveWinner(match.matchId, {
          forceEnd: true,
          forfeitUserId,
          reason: payload.reason || "MATCH_ENDED",
        });

        const finalizedMatch = await matchManager.finalizeMatch(
          match.matchId,
          resolution.winnerId,
          resolution.reason
        );

        const endPayload = {
          matchId: match.matchId,
          winnerUserId: resolution.winnerId || undefined,
          reason: resolution.reason,
          match: finalizedMatch,
        };

        io.to(`match:${match.matchId}`).emit("match:ended", endPayload);
        if (match.roomCode) {
          io.to(match.roomCode).emit("match:ended", endPayload);
        }

        if (typeof ack === "function") {
          ack({ success: true, data: finalizedMatch });
        }
      } catch (error: any) {
        if (typeof ack === "function") {
          ack({ success: false, error: error.message || "FAILED_TO_END_MATCH" });
        }
      }
    }
  );

  /**
   * 5. LEAVE MATCH / EXPLICIT FORFEIT
   */
  socket.on(
    "match:leave",
    async (
      payload: { matchId: string },
      ack?: (res: SocketAckResponse) => void
    ) => {
      try {
        const match = payload?.matchId
          ? matchManager.getMatch(payload.matchId)
          : (socket.data.matchId && matchManager.getMatch(socket.data.matchId)) ||
            matchManager.getActiveMatchBySocketId(socket.id);

        if (match && match.status === "in_progress") {
          const authUserId = socket.handshake.auth?.userId || socket.data.userId;
          const forfeitUserId =
            authUserId ||
            (match.player1.socketId === socket.id
              ? match.player1.userId
              : match.player2.userId);

          const resolution = matchManager.checkAndResolveWinner(match.matchId, {
            forceEnd: true,
            forfeitUserId,
            reason: "FORFEIT_PLAYER_LEFT",
          });

          const finalizedMatch = await matchManager.finalizeMatch(
            match.matchId,
            resolution.winnerId,
            resolution.reason
          );

          const endPayload = {
            matchId: match.matchId,
            winnerUserId: resolution.winnerId || undefined,
            reason: "FORFEIT_PLAYER_LEFT",
            match: finalizedMatch,
          };

          io.to(`match:${match.matchId}`).emit("match:ended", endPayload);
          if (match.roomCode) {
            io.to(match.roomCode).emit("match:ended", endPayload);
          }

          if (typeof ack === "function") {
            ack({ success: true, data: finalizedMatch });
          }
        }
      } catch (error: any) {
        if (typeof ack === "function") {
          ack({ success: false, error: error.message || "FAILED_TO_LEAVE_MATCH" });
        }
      }
    }
  );

  /**
   * 6. SOCKET DISCONNECT DURING ACTIVE MATCH
   */
  socket.on("disconnect", async () => {
    try {
      const matchId = socket.data.matchId;
      const userId = socket.data.userId || socket.handshake.auth?.userId;

      const match =
        (matchId && matchManager.getMatch(matchId)) ||
        (userId && matchManager.getActiveMatchByUserId(userId)) ||
        matchManager.getActiveMatchBySocketId(socket.id);

      if (match && match.status === "in_progress") {
        const forfeitUserId =
          userId ||
          (match.player1.socketId === socket.id
            ? match.player1.userId
            : match.player2.userId);

        const resolution = matchManager.checkAndResolveWinner(match.matchId, {
          forceEnd: true,
          forfeitUserId,
          reason: "OPPONENT_DISCONNECTED",
        });

        const finalizedMatch = await matchManager.finalizeMatch(
          match.matchId,
          resolution.winnerId,
          resolution.reason
        );

        const endPayload = {
          matchId: match.matchId,
          winnerUserId: resolution.winnerId || undefined,
          reason: "OPPONENT_DISCONNECTED",
          match: finalizedMatch,
        };

        io.to(`match:${match.matchId}`).emit("match:ended", endPayload);
        if (match.roomCode) {
          io.to(match.roomCode).emit("match:ended", endPayload);
        }
      }
    } catch (err: any) {
      console.warn("[MatchHandler] Disconnect cleanup error:", err.message);
    }
  });
}
