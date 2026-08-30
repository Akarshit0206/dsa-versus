import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const TOPICS = [
  "Arrays",
  "Strings",
  "Hash maps",
  "Stacks & queues",
  "Greedy",
  "Binary Search",
  "Dynamic programming"
];

const QuestionSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    slug: { type: Type.STRING },
    description: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ["EASY", "MEDIUM", "HARD"] },
    constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
    topics: { type: Type.ARRAY, items: { type: Type.STRING } },
    baseMemoryLimit: { type: Type.INTEGER },
    baseTimeLimit: { type: Type.INTEGER },
    timeLimitMultiplier: {
      type: Type.OBJECT,
      properties: {
        cpp: { type: Type.NUMBER },
        java: { type: Type.NUMBER },
        python: { type: Type.NUMBER }
      },
      required: ["cpp", "java", "python"]
    },
    starterCode: {
      type: Type.OBJECT,
      properties: {
        cpp: { type: Type.STRING },
        java: { type: Type.STRING },
        python: { type: Type.STRING }
      },
      required: ["cpp", "java", "python"]
    },
    testCases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          input: { type: Type.STRING },
          output: { type: Type.STRING },
          isSample: { type: Type.BOOLEAN }
        },
        required: ["input", "output", "isSample"]
      }
    }
  },
  required: [
    "title",
    "slug",
    "description",
    "difficulty",
    "constraints",
    "topics",
    "baseMemoryLimit",
    "baseTimeLimit",
    "timeLimitMultiplier",
    "starterCode",
    "testCases"
  ]
};

const TopicBatchSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: QuestionSchema
    }
  },
  required: ["questions"]
};

async function generateDataset() {
  const allGeneratedQuestions = [];

  console.log("==================================================");
  console.log("Starting Dataset Generation via Gemini 3.7 Flash");
  console.log(`Target: ${TOPICS.length} topics x 9 questions = ${TOPICS.length * 9} questions`);
  console.log("==================================================\n");

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    console.log(`[${i + 1}/${TOPICS.length}] Generating 9 questions for: "${topic}"...`);

    const prompt = `
      You are an expert competitive programming problem setter.
      Create exactly 9 standard LeetCode-style algorithmic coding problems for the topic: '${topic}'.
      
      Distribution:
      - 3 EASY questions
      - 4 MEDIUM questions
      - 2 HARD questions
      
      Requirements:
      1. Provide 8-10 test cases per problem (at least 2 with isSample = true, and 2-4 hidden evaluation cases).
      2. 'input' and 'output' strings in testCases MUST be valid JSON-serialized strings (parseable via JSON.parse).
      3. Set baseMemoryLimit and baseTimeLimit according to the question.
      4. Provide complete starterCode signatures for cpp, java and python.
    `;

    let success = false;
    let retries = 3;

    while (retries > 0 && !success) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: TopicBatchSchema,
            temperature: 0.2
          }
        });

        const parsedData = JSON.parse(response.text.trim());
        allGeneratedQuestions.push(...parsedData.questions);
        console.log(`    ✓ Successfully added 9 questions for "${topic}".`);
        success = true;
      } catch (err) {
        retries--;
        console.error(`    ✗ Error generating "${topic}": ${err.message}. Retrying (${retries} left)...`);
        await new Promise((res) => setTimeout(res, 3000));
      }
    }

    // Rate-limit buffer
    await new Promise((res) => setTimeout(res, 2000));
  }

  const outputFile = "dataset_seed.json";
  fs.writeFileSync(outputFile, JSON.stringify(allGeneratedQuestions, null, 2), "utf-8");

  console.log("\n==================================================");
  console.log(`DONE! Successfully exported ${allGeneratedQuestions.length} questions to ${outputFile}`);
  console.log("==================================================");
}

generateDataset().catch(console.error);