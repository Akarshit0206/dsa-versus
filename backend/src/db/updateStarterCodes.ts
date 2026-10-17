import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import QuestionModel from "../models/Question/Question.model.js";
import { CodeDriverService } from "../services/CodeDriverService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  console.log("=== Updating Starter Codes to LeetCode Style ===");

  // 1. Update dataset_seed.json
  const datasetPath = path.resolve(__dirname, "../../dataset/dataset_seed.json");
  if (!fs.existsSync(datasetPath)) {
    console.error(`dataset_seed.json not found at ${datasetPath}`);
    return;
  }

  const raw = fs.readFileSync(datasetPath, "utf-8");
  const questions: Array<any> = JSON.parse(raw);

  console.log(`Found ${questions.length} questions in dataset_seed.json`);

  let updatedCount = 0;
  for (const q of questions) {
    const slug = q.slug || q.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const starterCodes = CodeDriverService.getStarterCode(slug);
    q.starterCode = starterCodes;
    updatedCount++;
  }

  fs.writeFileSync(datasetPath, JSON.stringify(questions, null, 2), "utf-8");
  console.log(`Updated ${updatedCount} questions in ${datasetPath}`);

  // 2. Update MongoDB if MONGODB_URI is available
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log("MONGODB_URI not found in .env; skipping database update.");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully.");

    let dbUpdated = 0;
    for (const q of questions) {
      const slug = q.slug;
      const starterCodes = CodeDriverService.getStarterCode(slug);

      const res = await QuestionModel.updateOne(
        { slug },
        { $set: { starterCode: starterCodes } }
      );

      if (res.matchedCount > 0) {
        dbUpdated++;
      }
    }

    console.log(`Successfully updated ${dbUpdated} questions in MongoDB!`);
  } catch (err: any) {
    console.error("MongoDB update error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

main().catch(console.error);
