import express from "express";
import {registerUser, loginUser, logoutUser, getCurrentUser} from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const authRouter= express.Router();

authRouter.route("/register").post(asyncHandler(registerUser));
authRouter.route("/login").post(asyncHandler(loginUser));
authRouter.route("/logout").post(verifyJWT, asyncHandler(logoutUser));
authRouter.route("/me").get(verifyJWT, asyncHandler(getCurrentUser));