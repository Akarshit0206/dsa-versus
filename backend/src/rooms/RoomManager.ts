import { customAlphabet } from "nanoid";
import type {
  Room,
  RoomPlayer,
  RoomConfig,
  RoomFormat,
  CreateRoomInput,
  ProblemRequirement,
} from "./RoomManager.types.js";

const genCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

// Room TTL: 5 minutes
const ROOM_TTL_MS = 5 * 60 * 1000;

// Presets Definition
const ROOM_PRESETS: Record<Exclude<RoomFormat, "custom">, Omit<RoomConfig, "format" | "topics">> = {
  blitz: {
    timeLimitInMinutes: 20,
    problemRequirements: [
      { difficulty: "EASY", count: 1 },
      { difficulty: "MEDIUM", count: 1 },
    ],
  },
  standard: {
    timeLimitInMinutes: 45,
    problemRequirements: [
      { difficulty: "EASY", count: 1 },
      { difficulty: "MEDIUM", count: 2 },
    ],
  },
  classic: {
    timeLimitInMinutes: 60,
    problemRequirements: [
      { difficulty: "EASY", count: 1 },
      { difficulty: "MEDIUM", count: 1 },
      { difficulty: "HARD", count: 1 },
    ],
  },
};

export class RoomManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  private _resolveConfig(input: CreateRoomInput): RoomConfig {
    const { format, topics = [], customConfig } = input;

    if (format !== "custom") {
      const preset = ROOM_PRESETS[format];
      return {
        format,
        topics,
        timeLimitInMinutes: preset.timeLimitInMinutes,
        problemRequirements: preset.problemRequirements,
      };
    }

    // --- CUSTOM CONFIG SECURITY & BOUNDARY CHECKS ---
    if (!customConfig) {
      throw new Error("CUSTOM_CONFIG_REQUIRED");
    }

    const { duration, easyCount = 0, mediumCount = 0, hardCount = 0 } = customConfig;

    // Boundary check 1: Duration must be 10 - 60 mins
    if (!duration || duration < 10 || duration > 60) {
      throw new Error("INVALID_DURATION: Duration must be between 10 and 60 minutes.");
    }

    // Boundary check 2: Build problem requirements & validate count (1 to 3 max)
    const problemRequirements: ProblemRequirement[] = [];
    if (easyCount > 0) problemRequirements.push({ difficulty: "EASY", count: easyCount });
    if (mediumCount > 0) problemRequirements.push({ difficulty: "MEDIUM", count: mediumCount });
    if (hardCount > 0) problemRequirements.push({ difficulty: "HARD", count: hardCount });

    const totalQuestions = easyCount + mediumCount + hardCount;
    if (totalQuestions < 1 || totalQuestions > 3) {
      throw new Error("INVALID_QUESTION_COUNT: Total questions must be between 1 and 3.");
    }

    return {
      format: "custom",
      topics,
      timeLimitInMinutes: duration,
      problemRequirements,
    };
  }

  /**
   * Create a new room in memory with Host player
   */
  public createRoom(hostPlayer: Omit<RoomPlayer, "isConnected">, input: CreateRoomInput): Room {
    if (!hostPlayer.userId || !hostPlayer.socketId) {
      throw new Error("INVALID_PLAYER_DATA: Host userId and socketId are required.");
    }

    let code: string;
    do {
      code = genCode();
    } while (this.rooms.has(code));

    const config = this._resolveConfig(input);

    const room: Room = {
      code,
      host: {
        ...hostPlayer,
        isConnected: true,
      },
      guest: null,
      status: "waiting",
      config,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + ROOM_TTL_MS),
    };

    this.rooms.set(code, room);
    return room;
  }

  /**
   * Join an existing room with Security Checks
   */
  public joinRoom(code: string, guestPlayer: Omit<RoomPlayer, "isConnected">): Room {
    const room = this.rooms.get(code.toUpperCase());

    // Security Check 1: Room existence
    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    // Security Check 2: Room status
    if (room.status !== "waiting") {
      //can/should we return the room status or res. acc. to that, insted of this vague message.
      throw new Error("ROOM_NOT_WAITING: Room has already started or ended.");
    }

    // Security Check 3: Host cannot join their own room as guest
    if (guestPlayer.userId === room.host.userId) {
      throw new Error("HOST_CANNOT_JOIN_OWN_ROOM: You cannot join a room created by yourself.");
    }

    // Security Check 4: Room already full
    if (room.guest) {
      throw new Error("ROOM_IS_FULL: Room already has two players.");
    }

    // Attach Guest Player
    room.guest = {
      ...guestPlayer,
      isConnected: true,
    };

    return room;
  }

  /**
   * Handle player leaving room
   */
  public leaveRoom(code: string, userId: string): { action: "ROOM_DELETED" | "GUEST_REMOVED"; room?: Room } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) throw new Error("ROOM_NOT_FOUND");

    if (room.host.userId === userId) {
      // Host left -> delete room
      this.rooms.delete(code.toUpperCase());
      return { action: "ROOM_DELETED" };
    }

    if (room.guest && room.guest.userId === userId) {
      // Guest left -> reset room to waiting
      room.guest = null;
      room.status = "waiting";
      return { action: "GUEST_REMOVED", room };
    }

    throw new Error("USER_NOT_IN_ROOM");
  }

  /**
   * Getters & Helpers
   */
  public getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public removeRoom(code: string): boolean {
    return this.rooms.delete(code.toUpperCase());
  }
}

// Export singleton instance
export const roomManager = new RoomManager();