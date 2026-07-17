import { Schema, model, Model } from "mongoose";
import type {IMatchSchema, IPlayerStats, IQuestionProgress} from "./Match.Types.js"

const questionProgressSchema = new Schema<IQuestionProgress>(
  {
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    totalTestCases: { type: Number, required: true },
    testCasesPassed: { type: Number, default: 0 },
    attemptsCount: { type: Number, default: 0 },
    bestSubmissionId: { type: Schema.Types.ObjectId, ref: "Submission" },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const playerStatsSchema = new Schema<IPlayerStats>(
  {
    player: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionProgress: {
      type: [questionProgressSchema],
      required: true,
    },
    totalTestCasesPassed: {
      type: Number,
      required: true,
      default: 0,
    },
    timeTaken: {
      type: Number,
      default: -1,
    },
  },
  { _id: false }
);

const matchSchema = new Schema<IMatchSchema>(
  {
    player1Stats: {
      type: playerStatsSchema,
      required: true,
    },
    player2Stats: {
      type: playerStatsSchema,
      required: true,
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    questions: {
      type: [Schema.Types.ObjectId],
      ref: "Question",
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Match: Model<IMatchSchema> = model("Match", matchSchema);

export default Match;