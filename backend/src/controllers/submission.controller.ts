import type { RequestHandler } from "express";
import { Types } from "mongoose";
import QuestionModel from "../models/Question/Question.model.js";
import SubmissionModel from "../models/Submission/Submission.model.js";
import { PistonService } from "../services/PistonService.js";
import { matchManager } from "../matches/MatchManager.js";
import { io } from "../app.js";
import { ApiError, ApiResponse } from "../utils/index.js";

/**
 * 1. RUN CODE (Sample & Custom Test Cases)
 * Does not affect match score or persist submission
 */
export const runCode: RequestHandler = async (req, res) => {
  const { code, languageId, questionId, testCases, slug, title } = req.body;

  if (!code || typeof code !== "string") {
    throw new ApiError(400, "Code is required for execution");
  }

  if (!languageId || ![71, 54, 62].includes(Number(languageId))) {
    throw new ApiError(400, "Valid languageId (71: Python, 54: C++, 62: Java) is required");
  }

  let casesToRun: Array<{ input: string; output?: string; isSample?: boolean }> = [];
  let questionSlug = slug;
  let questionTitle = title;

  if (questionId && Types.ObjectId.isValid(questionId)) {
    const question = await QuestionModel.findById(questionId).lean();
    if (!question) {
      throw new ApiError(404, "Question not found");
    }
    questionSlug = questionSlug || question.slug;
    questionTitle = questionTitle || question.title;
    if (!Array.isArray(testCases) || testCases.length === 0) {
      casesToRun = (question.testCases || [])
        .filter((tc) => tc.isSample)
        .map((tc) => ({
          input: tc.input,
          output: tc.output,
          isSample: true,
        }));
    }
  }

  if (Array.isArray(testCases) && testCases.length > 0 && casesToRun.length === 0) {
    casesToRun = testCases.map((tc) => ({
      input: tc.input || "",
      output: tc.output || "",
      isSample: tc.isSample ?? true,
    }));
  }

  if (casesToRun.length === 0) {
    throw new ApiError(400, "No test cases provided for execution");
  }

  const evaluation = await PistonService.evaluateTestCases({
    sourceCode: code,
    languageId: Number(languageId),
    testCases: casesToRun,
    slug: questionSlug,
    title: questionTitle,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: evaluation.verdict,
        totalCount: evaluation.totalCount,
        passedCount: evaluation.passedCount,
        details: evaluation.details,
      },
      "Code evaluated successfully"
    )
  );
};

/**
 * 2. SUBMIT CODE (All Test Cases + Real-time Match Grading & Winner Resolution)
 */
export const submitCode: RequestHandler = async (req, res) => {
  const { matchId, questionId, code, languageId } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required to submit solution");
  }

  if (!code || typeof code !== "string") {
    throw new ApiError(400, "Code is required");
  }

  if (!languageId || ![71, 54, 62].includes(Number(languageId))) {
    throw new ApiError(400, "Valid languageId is required");
  }

  if (!questionId || !Types.ObjectId.isValid(questionId)) {
    throw new ApiError(400, "Valid questionId is required");
  }

  // 1. Fetch Question with ALL official test cases (both sample and hidden)
  let allTestCases: Array<{ input: string; output?: string; isSample?: boolean }> = [];
  let baseTimeLimit = 3;
  let questionSlug = req.body.slug;
  let questionTitle = req.body.title;

  if (questionId && Types.ObjectId.isValid(questionId)) {
    const question = await QuestionModel.findById(questionId).lean();
    if (question) {
      questionSlug = questionSlug || question.slug;
      questionTitle = questionTitle || question.title;
      allTestCases = (question.testCases || []).map((tc) => ({
        input: tc.input,
        output: tc.output,
        isSample: tc.isSample,
      }));
      if (question.baseTimeLimit) {
        baseTimeLimit = question.baseTimeLimit / 1000;
      }
    }
  }

  // Fallback to client test cases if testing standalone / preview questions
  if (allTestCases.length === 0 && Array.isArray(req.body.testCases) && req.body.testCases.length > 0) {
    allTestCases = req.body.testCases.map((tc: any) => ({
      input: tc.input || "",
      output: tc.output || "",
      isSample: tc.isSample ?? true,
    }));
  }

  if (allTestCases.length === 0) {
    throw new ApiError(404, "Question or test cases not found");
  }

  // 2. Evaluate Code with Piston Sandbox
  const evaluation = await PistonService.evaluateTestCases({
    sourceCode: code,
    languageId: Number(languageId),
    testCases: allTestCases,
    cpuTimeLimit: baseTimeLimit,
    slug: questionSlug,
    title: questionTitle,
  });

  // 3. Persist Submission Record in MongoDB
  const sampleTestResults = evaluation.details
    .filter((d) => d.isSample)
    .map((d) => ({
      testCaseIndex: d.caseIndex,
      isSample: true,
      verdict: d.verdict,
      stdout: d.actualOutput,
      stderr: d.stderr,
      compileOutput: d.compileOutput,
      time: d.time,
      memory: d.memory,
    }));

  const failedTestResult = evaluation.failedTestCase
    ? {
        testCaseIndex: evaluation.failedTestCase.caseIndex,
        isSample: evaluation.failedTestCase.isSample,
        verdict: evaluation.failedTestCase.verdict,
        stdout: evaluation.failedTestCase.actualOutput,
        stderr: evaluation.failedTestCase.stderr,
        compileOutput: evaluation.failedTestCase.compileOutput,
        time: evaluation.failedTestCase.time,
        memory: evaluation.failedTestCase.memory,
      }
    : undefined;

  const resolvedQuestionId =
    questionId && Types.ObjectId.isValid(questionId)
      ? new Types.ObjectId(questionId)
      : new Types.ObjectId();

  const submissionDoc = await SubmissionModel.create({
    questionId: resolvedQuestionId,
    userId,
    matchId: matchId && Types.ObjectId.isValid(matchId) ? new Types.ObjectId(matchId) : undefined,
    languageId: Number(languageId),
    code,
    verdict: evaluation.verdict,
    status: "JUDGED",
    sampleTestCases: sampleTestResults,
    failedTestCase: failedTestResult,
    passedCount: evaluation.passedCount,
    totalCount: evaluation.totalCount,
    executionTime: evaluation.executionTime,
    memory: evaluation.memory,
    submittedAt: new Date(),
  });

  // 4. If part of an active match, update in-memory progress & check for winner
  let matchUpdateData = null;
  let matchEndedData = null;

  if (matchId) {
    const activeMatch = matchManager.getMatch(matchId);
    if (activeMatch && activeMatch.status === "in_progress") {
      try {
        const updatedMatch = matchManager.updatePlayerProgress({
          matchId,
          userId: userId.toString(),
          questionId: resolvedQuestionId.toString(),
          testCasesPassed: evaluation.passedCount,
          totalTestCases: evaluation.totalCount,
        });

        matchUpdateData = {
          matchId: updatedMatch.matchId,
          player1Stats: updatedMatch.player1Stats,
          player2Stats: updatedMatch.player2Stats,
        };

        // Broadcast progress to both duelists
        io.to(`match:${matchId}`).emit("match:progress_updated", matchUpdateData);
        if (updatedMatch.roomCode) {
          io.to(updatedMatch.roomCode).emit("match:progress_updated", matchUpdateData);
        }

        // Check if this submission triggers an instant win condition
        const resolution = matchManager.checkAndResolveWinner(matchId);
        if (resolution.isEnded) {
          const finalizedMatch = await matchManager.finalizeMatch(
            matchId,
            resolution.winnerId,
            resolution.reason
          );

          matchEndedData = {
            matchId,
            winnerUserId: resolution.winnerId || undefined,
            reason: resolution.reason,
            match: finalizedMatch,
          };

          io.to(`match:${matchId}`).emit("match:ended", matchEndedData);
          if (finalizedMatch.roomCode) {
            io.to(finalizedMatch.roomCode).emit("match:ended", matchEndedData);
          }
        }
      } catch (err: any) {
        console.warn("[SubmissionController] Match progress update error:", err.message);
      }
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        submissionId: submissionDoc._id,
        verdict: evaluation.verdict,
        passedCount: evaluation.passedCount,
        totalCount: evaluation.totalCount,
        details: evaluation.details.filter((d) => d.isSample), // Only expose sample details
        matchEnded: !!matchEndedData,
        winnerUserId: matchEndedData?.winnerUserId,
      },
      "Submission evaluated successfully"
    )
  );
};

/**
 * 3. GET SUBMISSION HISTORY FOR USER
 */
export const getSubmissionsForUser: RequestHandler = async (req, res) => {
  const userId = req.user?._id;
  const { matchId, questionId } = req.query;

  const filter: Record<string, any> = { userId };
  if (matchId && Types.ObjectId.isValid(matchId as string)) {
    filter.matchId = new Types.ObjectId(matchId as string);
  }
  if (questionId && Types.ObjectId.isValid(questionId as string)) {
    filter.questionId = new Types.ObjectId(questionId as string);
  }

  const submissions = await SubmissionModel.find(filter)
    .populate("questionId", "title slug difficulty")
    .sort({ submittedAt: -1 })
    .limit(20)
    .lean();

  return res.status(200).json(
    new ApiResponse(200, submissions, "Submissions retrieved successfully")
  );
};
