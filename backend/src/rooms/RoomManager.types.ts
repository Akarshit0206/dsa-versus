import type { Difficulty } from "../models/Question/Question.types.js";

export type RoomFormat = "blitz" | "standard" | "classic" | "custom";

export interface ProblemRequirement {
  difficulty: Difficulty;
  count: number;
}

export interface RoomConfig {
  format: RoomFormat;
  topics: string[];
  timeLimitInMinutes: number;
  problemRequirements: ProblemRequirement[];
}

export interface CustomRoomConfig {
  duration: number; // Must be between 10 and 60 minutes
  easyCount?: number;
  mediumCount?: number;
  hardCount?: number;
}

export interface CreateRoomInput {
  format: RoomFormat;
  topics?: string[];
  customConfig?: CustomRoomConfig;
}

export interface RoomPlayer {
  userId: string;
  displayName: string;
  socketId: string;
  isConnected: boolean;
}

export interface Room {
  code: string;
  host: RoomPlayer;
  guest?: RoomPlayer | null;
  status: "waiting" | "active" | "completed";
  config: RoomConfig;
  createdAt: Date;
  expiresAt: Date;
}

export interface InMemoryMatch {
  matchId: string;
  roomCode: string;
  player1: RoomPlayer;
  player2: RoomPlayer;
  config: RoomConfig;
  assignedProblemIds: string[];
  startedAt: Date;
  durationInMinutes: number;
  status: "in_progress" | "completed";
}