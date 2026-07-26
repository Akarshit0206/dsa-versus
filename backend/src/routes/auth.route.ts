import express from "express";
import {registerUser} from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/index.js";

export const authRouter= express.Router();

authRouter.route("/register").post(asyncHandler(registerUser));