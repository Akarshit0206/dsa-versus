import { Types } from "mongoose";
import type { Room } from "../rooms/RoomManager.types.js";
import type {
  InMemoryMatch,
  PlayerStats,
  QuestionProgress,
  UpdateProgressInput,
  PublicQuestion,
  PublicTestCase,
} from "./MatchManager.types.js";

import { QuestionService } from "../services/QuestionService.js";
import MatchModel from "../models/Match/Match.model.js";

export class MatchManager {
  private activeMatches: Map<string, InMemoryMatch>;

  constructor() {
    this.activeMatches = new Map();
  }

  /**
   * Helper to sanitize questions: only expose public/sample test cases
   */
  private _sanitizeQuestions(questions: any[]): PublicQuestion[] {
    return questions.map((q) => {
      let starterCode: Record<string, string> = {};
      if (q.starterCode) {
        if (q.starterCode instanceof Map) {
          starterCode = Object.fromEntries(q.starterCode);
        } else if (typeof q.starterCode === "object") {
          starterCode = { ...q.starterCode };
        }
      }

      const publicTestCases: PublicTestCase[] = (q.testCases || [])
        .filter((tc: any) => tc.isSample)
        .map((tc: any) => ({
          input: tc.input,
          output: tc.output,
          isSample: true,
        }));

      return {
        _id: q._id.toString(),
        title: q.title,
        slug: q.slug,
        difficulty: q.difficulty,
        description: q.description,
        constraints: q.constraints || [],
        topics: q.topics || [],
        starterCode,
        testCases: publicTestCases,
      };
    });
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

    const hostObjectId = Types.ObjectId.isValid(room.host.userId)
      ? new Types.ObjectId(room.host.userId)
      : new Types.ObjectId();

    const guestObjectId = Types.ObjectId.isValid(room.guest.userId)
      ? new Types.ObjectId(room.guest.userId)
      : new Types.ObjectId();
    
    // 1. Fetch real sampled questions for the match from DB via QuestionService
    const selectedQuestions = await QuestionService.selectQuestionsForMatch(room.config);
    const questionIds = selectedQuestions.map((q) => q._id as Types.ObjectId);
    const sanitizedQuestions = this._sanitizeQuestions(selectedQuestions);

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
      player: hostObjectId,
      questionProgress: initialProgress.map((p) => ({ ...p })),
      totalTestCasesPassed: 0,
      timeTaken: -1,
    };

    const player2Stats: PlayerStats = {
      player: guestObjectId,
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
      questionsData: sanitizedQuestions,
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
   * Find an active in-progress match by user ID
   */
  public getActiveMatchByUserId(userId: string): InMemoryMatch | undefined {
    for (const match of this.activeMatches.values()) {
      if (
        match.status === "in_progress" &&
        (match.player1.userId === userId || match.player2.userId === userId)
      ) {
        return match;
      }
    }
    return undefined;
  }

  /**
   * Find an active in-progress match by socket ID
   */
  public getActiveMatchBySocketId(socketId: string): InMemoryMatch | undefined {
    for (const match of this.activeMatches.values()) {
      if (
        match.status === "in_progress" &&
        (match.player1.socketId === socketId || match.player2.socketId === socketId)
      ) {
        return match;
      }
    }
    return undefined;
  }

  /**
   * Get an active match with sanitized questions, hydrating from DB if needed
   */
  public async getMatchWithQuestions(matchId: string): Promise<InMemoryMatch | undefined> {
    let match = this.activeMatches.get(matchId);
    if (match && match.questionsData && match.questionsData.length > 0) {
      return match;
    }

    if (Types.ObjectId.isValid(matchId)) {
      const dbMatch = await MatchModel.findById(matchId).populate("questions").lean();
      if (dbMatch) {
        const populatedQuestions = (dbMatch.questions as any[]) || [];
        const sanitizedQuestions = this._sanitizeQuestions(populatedQuestions);

        if (!match) {
          const hydratedMatch: InMemoryMatch = {
            matchId,
            roomCode: "ARENA",
            player1: {
              userId: (dbMatch.player1Stats as any).player?.toString() || "",
              displayName: "Player 1",
              socketId: "",
              isConnected: true,
            },
            player2: {
              userId: (dbMatch.player2Stats as any).player?.toString() || "",
              displayName: "Player 2",
              socketId: "",
              isConnected: true,
            },
            player1Stats: dbMatch.player1Stats,
            player2Stats: dbMatch.player2Stats,
            questions: dbMatch.questions.map((q: any) => q._id || q),
            questionsData: sanitizedQuestions,
            durationInMinutes: dbMatch.duration,
            startedAt: (dbMatch as any).createdAt || new Date(),
            endedAt: dbMatch.endedAt,
            winner: dbMatch.winner,
            status: dbMatch.endedAt ? "completed" : "in_progress",
          };
          this.activeMatches.set(matchId, hydratedMatch);
          return hydratedMatch;
        } else {
          match.questionsData = sanitizedQuestions;
          return match;
        }
      }
    }
    return match;
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

      // Track elapsed time taken
      const startTime = new Date(match.startedAt).getTime();
      playerStats.timeTaken = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    }

    return match;
  }

  /**
   * Determine whether a match should end and who won based on contest rules
   */
  public checkAndResolveWinner(
    matchId: string,
    options?: { forceEnd?: boolean; reason?: string; forfeitUserId?: string }
  ): { isEnded: boolean; winnerId: string | null; reason: string } {
    const match = this.activeMatches.get(matchId);
    if (!match) throw new Error("MATCH_NOT_FOUND");

    if (match.status === "completed") {
      return {
        isEnded: true,
        winnerId: match.winner ? match.winner.toString() : null,
        reason: "MATCH_ALREADY_COMPLETED",
      };
    }

    // 1. Forfeit Case
    if (options?.forfeitUserId) {
      const winnerId =
        match.player1.userId === options.forfeitUserId
          ? match.player2.userId
          : match.player1.userId;
      return { isEnded: true, winnerId, reason: "FORFEIT" };
    }

    // 2. Check if either duelist solved all questions (100% test cases)
    const p1Progress = match.player1Stats.questionProgress;
    const p2Progress = match.player2Stats.questionProgress;

    const p1SolvedAll =
      p1Progress.length > 0 &&
      p1Progress.every((p) => p.totalTestCases > 0 && p.testCasesPassed === p.totalTestCases);

    const p2SolvedAll =
      p2Progress.length > 0 &&
      p2Progress.every((p) => p.totalTestCases > 0 && p.testCasesPassed === p.totalTestCases);

    if (p1SolvedAll && !p2SolvedAll) {
      return { isEnded: true, winnerId: match.player1.userId, reason: "ALL_PROBLEMS_SOLVED" };
    }

    if (p2SolvedAll && !p1SolvedAll) {
      return { isEnded: true, winnerId: match.player2.userId, reason: "ALL_PROBLEMS_SOLVED" };
    }

    if (p1SolvedAll && p2SolvedAll) {
      // Both solved all: faster timeTaken wins
      if (match.player1Stats.timeTaken < match.player2Stats.timeTaken) {
        return { isEnded: true, winnerId: match.player1.userId, reason: "ALL_PROBLEMS_SOLVED_FASTER" };
      } else if (match.player2Stats.timeTaken < match.player1Stats.timeTaken) {
        return { isEnded: true, winnerId: match.player2.userId, reason: "ALL_PROBLEMS_SOLVED_FASTER" };
      }
      return { isEnded: true, winnerId: null, reason: "ALL_PROBLEMS_SOLVED_TIE" };
    }

    // 3. Timeout / Force End: compare test cases passed & timeTaken
    if (options?.forceEnd) {
      const p1Score = match.player1Stats.totalTestCasesPassed;
      const p2Score = match.player2Stats.totalTestCasesPassed;

      if (p1Score > p2Score) {
        return { isEnded: true, winnerId: match.player1.userId, reason: "HIGHER_SCORE_ON_TIMEOUT" };
      } else if (p2Score > p1Score) {
        return { isEnded: true, winnerId: match.player2.userId, reason: "HIGHER_SCORE_ON_TIMEOUT" };
      } else {
        // Equal test cases: tie-break by timeTaken
        if (
          match.player1Stats.timeTaken > 0 &&
          match.player2Stats.timeTaken > 0 &&
          match.player1Stats.timeTaken !== match.player2Stats.timeTaken
        ) {
          const winnerId =
            match.player1Stats.timeTaken < match.player2Stats.timeTaken
              ? match.player1.userId
              : match.player2.userId;
          return { isEnded: true, winnerId, reason: "FASTER_TIME_ON_TIMEOUT" };
        }
        return { isEnded: true, winnerId: null, reason: "DRAW_ON_TIMEOUT" };
      }
    }

    return { isEnded: false, winnerId: null, reason: "IN_PROGRESS" };
  }

  /**
   * Finalize match, record winner, and persist to MongoDB
   */
  public async finalizeMatch(
    matchId: string,
    winnerUserId: string | null,
    reason: string = "MATCH_COMPLETED"
  ): Promise<InMemoryMatch> {
    const match = this.activeMatches.get(matchId);
    if (!match) throw new Error("MATCH_NOT_FOUND");

    match.status = "completed";
    match.endedAt = new Date();

    if (winnerUserId && Types.ObjectId.isValid(winnerUserId)) {
      match.winner = new Types.ObjectId(winnerUserId);
    } else {
      match.winner = null;
    }

    // Persist final match state in MongoDB
    if (Types.ObjectId.isValid(matchId)) {
      await MatchModel.findByIdAndUpdate(matchId, {
        winner: match.winner,
        endedAt: match.endedAt,
        player1Stats: match.player1Stats,
        player2Stats: match.player2Stats,
      });
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
