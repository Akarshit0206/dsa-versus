import {Types} from "mongoose";

type Verdict= 
      "PENDING"
    | "ACCEPTED"
    | "WRONG ANSWER"
    | "TLE"
    | "MLE"
    | "STACK OVERFLOW"
    | "COMPILATION ERROR"
    | "RUNTIME ERROR"

type Status= "PENDING" | "JUDGED" | "FAILED";


interface ITestCaseResult {
  testCaseIndex: number; // maps back to Question.testCases[i]
  isSample: boolean; // denormalized copy — controls what you're allowed to reveal to the user
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
    languageId: number;
    code: string;

    verdict: Verdict;
    status: Status;

    sampleTestCases: ITestCaseResult[];
    failedTestCase?: ITestCaseResult;

    passedCount: number;
    totalCount: number;
    submittedAt: Date;
}

export type {ITestCaseResult, ISubmissionSchema};