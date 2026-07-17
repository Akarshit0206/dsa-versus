import mongoose from "mongoose";
import {Schema} from "mongoose";
import type { ITestCaseResult, ISubmissionSchema } from "./Submission.types.js";

const TestCaseResultSchema = new Schema<ITestCaseResult>(
  {
    testCaseIndex: { type: Number, required: true },
    isSample: { type: Boolean, required: true },
    verdict: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Memory Limit Exceeded",
        "Runtime Error",
        "Compilation Error",
        "Internal Error",
      ],
      required: true,
    },
    // Capped so a runaway print loop can't bloat a single result before
    // Judge0's own time/memory limits even kick in.
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
    languageId: { type: Number, required: true },
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
      enum: [
         "ACCEPTED",
     "WRONG ANSWER",
     "TLE",
     "MLE",
     "STACK OVERFLOW",
     "COMPILATION ERROR",
     "RUNTIME ERROR",

      ],
      required: true,
      default: "PENDING",
      index: true,
    },
 
    sampleTestCases: { type: [TestCaseResultSchema], default: [] },
    failedTestCase: { type: TestCaseResultSchema },
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
 
    submittedAt: { type: Date },
  }
);
 
// Common query pattern: "this user's submission history for a contest".
SubmissionSchema.index({ userId: 1, matchId: 1, submittedAt: -1 });
// Common query pattern: "this user's attempts on this question".
SubmissionSchema.index({ userId: 1, questionId: 1, submittedAt: -1 });
 
const SubmissionModel = mongoose.model<ISubmissionSchema>("Submission", SubmissionSchema);

export default SubmissionModel;