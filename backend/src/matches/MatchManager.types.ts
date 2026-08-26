import type { Types } from "mongoose";
import type { RoomPlayer, RoomConfig } from "../rooms/RoomManager.types.js";
import type { IPlayerStats, IQuestionProgress } from "../models/Match/Match.Types.js";

export interface QuestionProgress extends IQuestionProgress {}
export interface PlayerStats extends IPlayerStats {}

export interface InMemoryMatch {
  matchId: string; // Valid Mongoose ObjectId string
  roomCode: string;
  player1: RoomPlayer;
  player2: RoomPlayer;
  player1Stats: PlayerStats;
  player2Stats: PlayerStats;
  questions: Types.ObjectId[];
  durationInMinutes: number;
  startedAt: Date;
  endedAt?: Date | null;
  winner?: Types.ObjectId | null;
  status: "in_progress" | "completed";
}

export interface UpdateProgressInput {
  matchId: string;
  userId: string;
  questionId: string;
  testCasesPassed: number;
  totalTestCases: number;
}
