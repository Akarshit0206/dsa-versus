import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/index.js";
import {
  getMyProfile,
  getUserProfileByUsername,
  sendFriendRequest,
  respondFriendRequest,
  updateUserProfile,
} from "../controllers/user.controller.js";

export const userRouter = express.Router();

userRouter.route("/profile").get(verifyJWT, asyncHandler(getMyProfile));
userRouter.route("/profile").patch(verifyJWT, asyncHandler(updateUserProfile));
userRouter.route("/profile/:username").get(verifyJWT, asyncHandler(getUserProfileByUsername));

userRouter.route("/friends/request").post(verifyJWT, asyncHandler(sendFriendRequest));
userRouter.route("/friends/respond").post(verifyJWT, asyncHandler(respondFriendRequest));
