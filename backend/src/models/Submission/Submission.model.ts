import mongoose from "mongoose";
import { Schema } from "mongoose";
import type { ITestCaseResult, ISubmissionSchema } from "./Submission.types.js";

const ALLOWED_VERDICTS = [
  "PENDING",
  "ACCEPTED",
  "WRONG ANSWER",
  "TLE",
  "MLE",
  "STACK OVERFLOW",
  "COMPILATION ERROR",
  "RUNTIME ERROR",
  "INTERNAL ERROR",
];

const TestCaseResultSchema = new Schema<ITestCaseResult>(
  {
    testCaseIndex: { type: Number, required: true },
    isSample: { type: Boolean, required: true },
    verdict: {
      type: String,
      enum: ALLOWED_VERDICTS,
      required: true,
      default: "PENDING",
    },
    stdout: { type: String, maxlength: 5000 },
    stderr: { type: String, maxlength: 2000 },
    compileOutput: { type: String, maxlength: 2000 },
    time: { type: Number },
    memory: { type: Number },
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmissionSchema>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    matchId: { type: Schema.Types.ObjectId, ref: "Match", index: true },
    languageId: {
      type: Number,
      required: true,
      enum: [71, 54, 62], // 71: Python, 54: C++, 62: Java
    },
    code: { type: String, required: true },

    status: {
      type: String,
      enum: ["PENDING", "JUDGED", "FAILED"],
      required: true,
      default: "PENDING",
      index: true,
    },
    verdict: {
      type: String,
      enum: ALLOWED_VERDICTS,
      required: true,
      default: "PENDING",
      index: true,
    },

    sampleTestCases: { type: [TestCaseResultSchema], default: [] },
    failedTestCase: { type: TestCaseResultSchema },
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },

    // Recorded for successful ("ACCEPTED") submissions
    executionTime: { type: Number },
    memory: { type: Number },

    submittedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Common query pattern: "this user's submission history for a contest".
SubmissionSchema.index({ userId: 1, matchId: 1, submittedAt: -1 });
// Common query pattern: "this user's attempts on this question".
SubmissionSchema.index({ userId: 1, questionId: 1, submittedAt: -1 });

const SubmissionModel = mongoose.model<ISubmissionSchema>("Submission", SubmissionSchema);

export default SubmissionModel;