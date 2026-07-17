import { Document, Types } from "mongoose";
import type { Difficulty } from "../Question/Question.types.js";

type RoomStatus = "WAITING" | "CANCELLED" | "EXPIRED" | "CONVERTED";

interface IRoomSchema extends Document {
  host: Types.ObjectId;
  guest?: Types.ObjectId | null;
  roomCode: string;
  topics: string[];
  difficulties: Difficulty[];
  questionCount: number;
  duration: number; // match length in minutes
  status: RoomStatus;
  expiresAt: Date;
  matchId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type { RoomStatus, IRoomSchema };
