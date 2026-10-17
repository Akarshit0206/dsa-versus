import type { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";
import User from "../models/User/User.model.js";
import MatchModel from "../models/Match/Match.model.js";
import Friends from "../models/Friends/Friends.model.js";
import { ApiError, ApiResponse } from "../utils/index.js";

/**
 * Helper to compute user stats and recent matches
 */
async function computeUserStatsAndMatches(userId: Types.ObjectId) {
  const matches = await MatchModel.find({
    $or: [{ "player1Stats.player": userId }, { "player2Stats.player": userId }],
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("player1Stats.player", "username avatar")
    .populate("player2Stats.player", "username avatar")
    .populate("winner", "username avatar")
    .populate("questions", "title difficulty topics")
    .lean();

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalTestCasesPassed = 0;
  let problemsSolved = 0;

  const recentMatches = matches.map((m: any) => {
    const isP1 = m.player1Stats?.player?._id?.toString() === userId.toString();
    const myStats = isP1 ? m.player1Stats : m.player2Stats;
    const opponentStats = isP1 ? m.player2Stats : m.player1Stats;
    const opponent = opponentStats?.player;

    let result: "VICTORY" | "DEFEAT" | "DRAW" = "DRAW";
    if (m.winner) {
      const winnerId = m.winner._id ? m.winner._id.toString() : m.winner.toString();
      if (winnerId === userId.toString()) {
        result = "VICTORY";
        wins++;
      } else {
        result = "DEFEAT";
        losses++;
      }
    } else {
      draws++;
    }

    if (myStats) {
      totalTestCasesPassed += myStats.totalTestCasesPassed || 0;
      if (Array.isArray(myStats.questionProgress)) {
        myStats.questionProgress.forEach((qp: any) => {
          if (qp.totalTestCases > 0 && qp.testCasesPassed === qp.totalTestCases) {
            problemsSolved++;
          }
        });
      }
    }

    return {
      id: m._id.toString(),
      opponent: opponent
        ? {
            _id: opponent._id?.toString() || "",
            username: opponent.username || "Anonymous Duelist",
            avatar: opponent.avatar || "",
          }
        : { _id: "", username: "Opponent", avatar: "" },
      result,
      myScore: myStats?.totalTestCasesPassed || 0,
      opponentScore: opponentStats?.totalTestCasesPassed || 0,
      timeTaken: myStats?.timeTaken ?? -1,
      duration: m.duration || 15,
      playedAt: m.endedAt || m.createdAt,
      questions: (m.questions || []).map((q: any) => ({
        _id: q._id?.toString() || "",
        title: q.title || "DSA Problem",
        difficulty: q.difficulty || "MEDIUM",
        topics: q.topics || [],
      })),
    };
  });

  const matchesPlayed = matches.length;
  const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

  return {
    stats: {
      matchesPlayed,
      wins,
      losses,
      draws,
      winRate,
      problemsSolved,
      totalTestCasesPassed,
    },
    recentMatches,
  };
}

/**
 * Helper to fetch friends and pending requests
 */
async function fetchUserFriends(userId: Types.ObjectId) {
  const friendDocs = await Friends.find({
    $or: [{ userA: userId }, { userB: userId }],
  })
    .populate("userA", "username avatar email")
    .populate("userB", "username avatar email")
    .populate("sentBy", "username avatar email")
    .lean();

  const acceptedFriends: Array<{ _id: string; username: string; avatar: string }> = [];
  const incomingRequests: Array<{ friendshipId: string; from: { _id: string; username: string; avatar: string }; createdAt: Date }> = [];
  const outgoingRequests: Array<{ friendshipId: string; to: { _id: string; username: string; avatar: string }; createdAt: Date }> = [];

  friendDocs.forEach((doc: any) => {
    if (doc.status === "ACCEPTED") {
      const isA = doc.userA._id.toString() === userId.toString();
      const friend = isA ? doc.userB : doc.userA;
      if (friend) {
        acceptedFriends.push({
          _id: friend._id.toString(),
          username: friend.username,
          avatar: friend.avatar || "",
        });
      }
    } else if (doc.status === "PENDING") {
      const isSentByMe = doc.sentBy._id.toString() === userId.toString();
      if (isSentByMe) {
        const isA = doc.userA._id.toString() === userId.toString();
        const recipient = isA ? doc.userB : doc.userA;
        if (recipient) {
          outgoingRequests.push({
            friendshipId: doc._id.toString(),
            to: {
              _id: recipient._id.toString(),
              username: recipient.username,
              avatar: recipient.avatar || "",
            },
            createdAt: doc.createdAt,
          });
        }
      } else {
        const sender = doc.sentBy;
        if (sender) {
          incomingRequests.push({
            friendshipId: doc._id.toString(),
            from: {
              _id: sender._id.toString(),
              username: sender.username,
              avatar: sender.avatar || "",
            },
            createdAt: doc.createdAt,
          });
        }
      }
    }
  });

  return {
    friends: acceptedFriends,
    incomingRequests,
    outgoingRequests,
  };
}

/**
 * 1. GET CURRENT USER PROFILE, STATS & FRIENDS
 */
export const getMyProfile: RequestHandler = async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized");

  const [matchData, friendsData] = await Promise.all([
    computeUserStatsAndMatches(user._id),
    fetchUserFriends(user._id),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar || "",
          createdAt: user.createdAt,
        },
        stats: matchData.stats,
        recentMatches: matchData.recentMatches,
        friends: friendsData.friends,
        incomingRequests: friendsData.incomingRequests,
        outgoingRequests: friendsData.outgoingRequests,
      },
      "Profile fetched successfully"
    )
  );
};

/**
 * 2. GET PUBLIC USER PROFILE BY USERNAME
 */
export const getUserProfileByUsername: RequestHandler = async (req, res) => {
  const rawUsername = req.params.username;
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;
  if (!username || typeof username !== "string") throw new ApiError(400, "Username required");

  const targetUser = await User.findOne({
    username: username.toLowerCase().trim(),
  }).select("-password -refreshToken");

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const [matchData, friendsData] = await Promise.all([
    computeUserStatsAndMatches(targetUser._id),
    fetchUserFriends(targetUser._id),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: targetUser._id,
          username: targetUser.username,
          avatar: targetUser.avatar || "",
          createdAt: targetUser.createdAt,
        },
        stats: matchData.stats,
        recentMatches: matchData.recentMatches,
        friendsCount: friendsData.friends.length,
      },
      "User profile fetched successfully"
    )
  );
};

/**
 * 3. SEND FRIEND REQUEST
 */
export const sendFriendRequest: RequestHandler = async (req, res) => {
  const currentUserId = req.user._id;
  const { username } = req.body;

  if (!username || typeof username !== "string") {
    throw new ApiError(400, "Username is required");
  }

  const normalized = username.toLowerCase().trim();
  if (normalized === req.user.username.toLowerCase()) {
    throw new ApiError(400, "You cannot send a friend request to yourself");
  }

  const targetUser = await User.findOne({ username: normalized });
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const targetUserId = targetUser._id;

  // Canonical ordering for userA and userB
  const idA = currentUserId.toString() < targetUserId.toString() ? currentUserId : targetUserId;
  const idB = currentUserId.toString() < targetUserId.toString() ? targetUserId : currentUserId;

  const existingFriendship = await Friends.findOne({ userA: idA, userB: idB });
  if (existingFriendship) {
    if (existingFriendship.status === "ACCEPTED") {
      throw new ApiError(400, "You are already friends with this user");
    }
    if (existingFriendship.status === "PENDING") {
      throw new ApiError(400, "A friend request is already pending between you");
    }
    // If rejected or blocked, update to pending
    existingFriendship.status = "PENDING";
    existingFriendship.sentBy = currentUserId;
    await existingFriendship.save();

    return res.status(200).json(
      new ApiResponse(200, existingFriendship, "Friend request sent successfully")
    );
  }

  const newFriendship = await Friends.create({
    userA: idA,
    userB: idB,
    sentBy: currentUserId,
    status: "PENDING",
  });

  return res.status(201).json(
    new ApiResponse(201, newFriendship, "Friend request sent successfully")
  );
};

/**
 * 4. RESPOND TO FRIEND REQUEST (ACCEPT / REJECT)
 */
export const respondFriendRequest: RequestHandler = async (req, res) => {
  const currentUserId = req.user._id;
  const { friendshipId, action } = req.body;

  if (!friendshipId || !action) {
    throw new ApiError(400, "friendshipId and action are required");
  }

  if (action !== "ACCEPT" && action !== "REJECT") {
    throw new ApiError(400, "Action must be ACCEPT or REJECT");
  }

  const friendship = await Friends.findById(friendshipId);
  if (!friendship) {
    throw new ApiError(404, "Friend request not found");
  }

  // Ensure current user is the recipient, not the sender
  if (friendship.sentBy.toString() === currentUserId.toString()) {
    throw new ApiError(403, "You cannot accept your own friend request");
  }

  const isParticipant =
    friendship.userA.toString() === currentUserId.toString() ||
    friendship.userB.toString() === currentUserId.toString();

  if (!isParticipant) {
    throw new ApiError(403, "You are not a party to this friend request");
  }

  if (action === "ACCEPT") {
    friendship.status = "ACCEPTED";
    await friendship.save();
    return res.status(200).json(
      new ApiResponse(200, friendship, "Friend request accepted")
    );
  } else {
    await Friends.findByIdAndDelete(friendshipId);
    return res.status(200).json(
      new ApiResponse(200, {}, "Friend request declined")
    );
  }
};

/**
 * 5. UPDATE USER PROFILE (AVATAR)
 */
export const updateUserProfile: RequestHandler = async (req, res) => {
  const currentUserId = req.user._id;
  const { avatar } = req.body;

  const updateFields: Record<string, any> = {};
  if (typeof avatar === "string") {
    updateFields.avatar = avatar.trim();
  }

  const updatedUser = await User.findByIdAndUpdate(
    currentUserId,
    { $set: updateFields },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "Profile updated successfully")
  );
};
