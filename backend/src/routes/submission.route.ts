import express from "express";
import { runCode, submitCode, getSubmissionsForUser } from "../controllers/submission.controller.js";
import { asyncHandler } from "../utils/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const submissionRouter = express.Router();

// Public / match code trial run
submissionRouter.route("/run").post(asyncHandler(runCode));

// Authenticated official match submission
submissionRouter.route("/submit").post(verifyJWT, asyncHandler(submitCode));

// Authenticated user submission history
submissionRouter.route("/history").get(verifyJWT, asyncHandler(getSubmissionsForUser));
