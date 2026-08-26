import { Types } from "mongoose";
import type { Room } from "../rooms/RoomManager.types.js";
import type {
  InMemoryMatch,
  PlayerStats,
  QuestionProgress,
  UpdateProgressInput,
} from "./MatchManager.types.js";

import { QuestionService } from "../services/QuestionService.js";
import MatchModel from "../models/Match/Match.model.js";

export class MatchManager {
  private activeMatches: Map<string, InMemoryMatch>;

  constructor() {
    this.activeMatches = new Map();
  }

  /**
   * Initialize a new in-memory match from a full Room lobby & persist initial record to DB
   */
  public async startMatch(room: Room): Promise<InMemoryMatch> {
    if (!room.guest) {
      throw new Error("CANNOT_START_MATCH: Guest player has not joined yet.");
    }

    if (room.status !== "waiting") {
      throw new Error("MATCH_ALREADY_STARTED: Room is already in an active or completed match.");
    }

    if (!Types.ObjectId.isValid(room.host.userId)) {
      throw new Error("INVALID_USER_ID: Host userId is not a valid Mongoose ObjectId.");
    }
    if (!Types.ObjectId.isValid(room.guest.userId)) {
      throw new Error("INVALID_USER_ID: Guest userId is not a valid Mongoose ObjectId.");
    }
    
    // 1. Fetch real sampled questions for the match from DB via QuestionService
    const selectedQuestions = await QuestionService.selectQuestionsForMatch(room.config);
    const questionIds = selectedQuestions.map((q) => q._id as Types.ObjectId);

    // Update room status
    room.status = "active";

    // 2. Generate valid Mongoose ObjectId string for in-memory matchId
    const matchId = new Types.ObjectId().toString();

    // 3. Construct initial Question Progress sub-documents using actual question testCases count
    const initialProgress: QuestionProgress[] = selectedQuestions.map((q) => ({
      question: q._id as Types.ObjectId,
      totalTestCases: q.testCases?.length ?? 5,
      testCasesPassed: 0,
      attemptsCount: 0,
      bestSubmissionId: undefined,
      completedAt: null,
    }));

    // 4. Construct Player1 and Player2 Stats (aligned 1-to-1 with DB Match schema)
    const player1Stats: PlayerStats = {
      player: new Types.ObjectId(room.host.userId),
      questionProgress: initialProgress.map((p) => ({ ...p })),
      totalTestCasesPassed: 0,
      timeTaken: -1,
    };

    const player2Stats: PlayerStats = {
      player: new Types.ObjectId(room.guest.userId),
      questionProgress: initialProgress.map((p) => ({ ...p })),
      totalTestCasesPassed: 0,
      timeTaken: -1,
    };

    // 5. Persist initial Match record in MongoDB
    await MatchModel.create({
      _id: new Types.ObjectId(matchId),
      player1Stats,
      player2Stats,
      questions: questionIds,
      duration: room.config.timeLimitInMinutes,
      winner: null,
      endedAt: null,
    });

    const match: InMemoryMatch = {
      matchId,
      roomCode: room.code,
      player1: room.host,
      player2: room.guest,
      player1Stats,
      player2Stats,
      questions: questionIds,
      durationInMinutes: room.config.timeLimitInMinutes,
      startedAt: new Date(),
      endedAt: null,
      winner: null,
      status: "in_progress",
    };

    this.activeMatches.set(matchId, match);
    return match;
  }

  /**
   * Get an active match by ID
   */
  public getMatch(matchId: string): InMemoryMatch | undefined {
    return this.activeMatches.get(matchId);
  }

  /**
   * Update player test cases passed and progress for a question during live match
   */
  public updatePlayerProgress(input: UpdateProgressInput): InMemoryMatch {
    const { matchId, userId, questionId, testCasesPassed, totalTestCases } = input;
    const match = this.activeMatches.get(matchId);

    if (!match) throw new Error("MATCH_NOT_FOUND");
    if (match.status !== "in_progress") throw new Error("MATCH_ALREADY_ENDED");

    const isPlayer1 = match.player1.userId === userId;
    const isPlayer2 = match.player2.userId === userId;

    if (!isPlayer1 && !isPlayer2) {
      throw new Error("USER_NOT_IN_MATCH");
    }

    const playerStats = isPlayer1 ? match.player1Stats : match.player2Stats;
    const progress = playerStats.questionProgress.find(
      (p) => p.question.toString() === questionId
    );

    if (progress) {
      progress.attemptsCount += 1;
      progress.testCasesPassed = Math.max(progress.testCasesPassed, testCasesPassed);
      progress.totalTestCases = totalTestCases;

      if (testCasesPassed === totalTestCases && !progress.completedAt) {
        progress.completedAt = new Date();
      }

      // Recalculate total test cases passed for player
      playerStats.totalTestCasesPassed = playerStats.questionProgress.reduce(
        (sum, p) => sum + p.testCasesPassed,
        0
      );
    }

    return match;
  }

  /**
   * End a match and declare winner
   */
  public endMatch(matchId: string, winnerUserId?: string): InMemoryMatch {
    const match = this.activeMatches.get(matchId);
    if (!match) throw new Error("MATCH_NOT_FOUND");

    match.status = "completed";
    match.endedAt = new Date();

    if (winnerUserId && Types.ObjectId.isValid(winnerUserId)) {
      match.winner = new Types.ObjectId(winnerUserId);
    }

    return match;
  }

  /**
   * Remove match from memory
   */
  public removeMatch(matchId: string): boolean {
    return this.activeMatches.delete(matchId);
  }
}

// Export singleton instance
export const matchManager = new MatchManager();
