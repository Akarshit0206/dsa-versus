type Difficulty = "EASY" | "MEDIUM" | "HARD";
type Language = 71 | 54 | 62; // python | cpp | java

interface ITestCase {
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
  testCases: ITestCase[];
  starterCode?: Record<Language, string>;
  createdAt: Date;
  updatedAt: Date;
}

export type {Difficulty, Language, ITestCase, IQuestion};