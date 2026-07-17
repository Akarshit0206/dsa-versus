import {Document, Types} from "mongoose";

type reqStatus= "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
interface IFriendsSchema extends Document{
    sentBy: Types.ObjectId;
    userA: Types.ObjectId;
    userB: Types.ObjectId;
    status: reqStatus;
    createdAt: Date;
    updatedAt: Date;
}

export type {reqStatus, IFriendsSchema};