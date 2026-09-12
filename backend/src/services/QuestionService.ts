import QuestionModel from "../models/Question/Question.model.js";
import type { RoomConfig } from "../rooms/RoomManager.types.js";
import type { IQuestion } from "../models/Question/Question.types.js";

export class QuestionService {
  /**
   * Samples random questions from DB matching the requirements for a Match.
   * If no topics are specified or topics is empty, samples randomly across ALL topics for the given difficulty.
   */
  public static async selectQuestionsForMatch(config: RoomConfig): Promise<IQuestion[]> {
    const selectedQuestions: IQuestion[] = [];

    for (const req of config.problemRequirements) {
      // 1. Skip if 0 questions are requested for this difficulty
      if (!req.count || req.count <= 0) {
        continue;
      }

      // 2. Base filter: Match by difficulty
      const matchCriteria: Record<string, any> = {
        difficulty: req.difficulty,
      };

      // 3. Topic filter: Only filter by topic if topics are explicitly provided & non-empty
      if (config.topics && config.topics.length > 0) {
        matchCriteria.topics = { $in: config.topics };
      }

      // 4. Randomly sample 'req.count' questions matching criteria from MongoDB
      let sampled = await QuestionModel.aggregate<IQuestion>([
        { $match: matchCriteria },
        { $sample: { size: req.count } },
      ]);

      // 5. Fallback: If not enough questions found for specific topics, sample across all topics for this difficulty
      if (sampled.length < req.count && config.topics && config.topics.length > 0) {
        sampled = await QuestionModel.aggregate<IQuestion>([
          { $match: { difficulty: req.difficulty } },
          { $sample: { size: req.count } },
        ]);
      }

      // 6. Ensure enough questions were returned
      if (sampled.length < req.count) {
        throw new Error(
          `NOT_ENOUGH_QUESTIONS: Insufficient ${req.difficulty} questions found in database.`
        );
      }

      selectedQuestions.push(...sampled);
    }

    return selectedQuestions;
  }
}
