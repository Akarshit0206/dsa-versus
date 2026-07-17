import mongoose from "mongoose";
import { Schema, Model } from "mongoose";
import type { IRoomSchema } from "./Room.types.js";

const ROOM_CODE_LENGTH = 6;
const LOBBY_EXPIRY_MINUTES = 10;

const roomSchema: Schema<IRoomSchema> = new Schema(
  {
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    guest: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: ROOM_CODE_LENGTH,
      maxlength: ROOM_CODE_LENGTH,
      index: true,
    },
    topics: {
      type: [String],
      default: [],
    },
    difficulties: {
      type: [String],
      enum: ["EASY", "MEDIUM", "HARD"],
      default: [],
    },
    questionCount: {
      type: Number,
      required: true,
      min: 1,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["WAITING", "CANCELLED", "EXPIRED", "CONVERTED"],
      default: "WAITING",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      default: null,
    },
  },
  { timestamps: true }
);

roomSchema.pre("validate", function () {
  if (this.guest && this.host.toString() === this.guest.toString()) {
    throw new Error("Host cannot join their own room as guest");
  }
});

roomSchema.index({ host: 1, status: 1 });
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Room: Model<IRoomSchema> = mongoose.model("Room", roomSchema);

export default Room;
export { ROOM_CODE_LENGTH, LOBBY_EXPIRY_MINUTES };
