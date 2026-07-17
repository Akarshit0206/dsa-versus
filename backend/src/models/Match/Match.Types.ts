import type { Types, Document } from "mongoose";

interface IQuestionProgress {
  question: Types.ObjectId;
  totalTestCases: number; 
  testCasesPassed: number;
  attemptsCount: number;
  bestSubmissionId?: Types.ObjectId;
  completedAt?: Date | null;
}

interface IPlayerStats {
  player: Types.ObjectId;
  questionProgress: IQuestionProgress[];
  totalTestCasesPassed: number;
  timeTaken: number;
}

interface IMatchSchema extends Document {
  player1Stats: IPlayerStats;
  player2Stats: IPlayerStats;
  questions: Types.ObjectId[];
  winner?: Types.ObjectId | null;
  duration: number;
  endedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type {IMatchSchema, IPlayerStats, IQuestionProgress};