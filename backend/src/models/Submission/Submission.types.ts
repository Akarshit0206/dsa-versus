import { Types, Document } from "mongoose";

type Verdict =
  | "PENDING"
  | "ACCEPTED"
  | "WRONG ANSWER"
  | "TLE"
  | "MLE"
  | "STACK OVERFLOW"
  | "COMPILATION ERROR"
  | "RUNTIME ERROR"
  | "INTERNAL ERROR";

type Status = "PENDING" | "JUDGED" | "FAILED";

interface ITestCaseResult {
  testCaseIndex: number; // maps back to Question.testCases[i]
  isSample: boolean; // denormalized copy
  verdict: Verdict;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  time?: number; // seconds, from Judge0
  memory?: number; // KB, from Judge0
}

interface ISubmissionSchema extends Document {
  questionId: Types.ObjectId;
  userId: Types.ObjectId;
  matchId?: Types.ObjectId;
  languageId: number; // 71 | 54 | 62
  code: string;

  verdict: Verdict;
  status: Status;

  sampleTestCases: ITestCaseResult[];
  failedTestCase?: ITestCaseResult;

  passedCount: number;
  totalCount: number;

  // Recorded for successful ("ACCEPTED") submissions
  executionTime?: number; // seconds
  memory?: number; // KB

  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type { Verdict, Status, ITestCaseResult, ISubmissionSchema };