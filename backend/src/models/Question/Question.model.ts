import { Schema, model, Document } from "mongoose";
import type { ITestCase, IQuestion, Language } from "./Question.types.js";

const TestSchema = new Schema<ITestCase>(
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


const QuestionModel = model<IQuestion>("Question", QuestionSchema);

export default QuestionModel;