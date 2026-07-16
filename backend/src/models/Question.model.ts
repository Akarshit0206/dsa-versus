import { Schema, model, Document } from "mongoose";

type Difficulty = "easy" | "medium" | "hard";
type Language = 71 | 54 | 62; // python | cpp | java

interface ITest {
  input: string;
  output: string;
  isSample: boolean;
}

interface IQuestion extends Document {
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  constraints: string[];
  topics: string[];
  baseMemoryLimit: number; // MB
  baseTimeLimit: number; // sec
  timeLimitMultiplier: Record<Language, number>;
  testCases: ITest[];
  starterCode?: Record<Language, string>;
  createdAt: Date;
  updatedAt: Date;
}

const TestSchema = new Schema<ITest>(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    isSample: { type: Boolean, required: true, default: false },
  },
  { _id: false } 
);

const QuestionSchema= new Schema<IQuestion>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      index: true,
    },
    constraints: { type: [String], default: [] },
    topics: { type: [String], default: [], index: true },

    baseMemoryLimit: { type: Number, required: true }, // MB
    baseTimeLimit: { type: Number, required: true }, // sec

    timeLimitMultiplier: {
      type: Map,
      of: Number,
      required: true,
    },

    testCases: {
      type: [TestSchema],
      required: true,
    },

    starterCode: {
      type: Map,
      of: String,
      required: false,
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);


export const QuestionModel = model<IQuestion>("Question", QuestionSchema);
export type { IQuestion, ITest, Difficulty, Language };