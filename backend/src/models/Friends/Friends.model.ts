import mongoose from "mongoose";
import {Schema, Model} from "mongoose";
import type { IFriendsSchema } from "./Friends.types.js";
//Remember to store the smaller objectId as userA & larger as userB {understand how that's helpful}
//understand more about indexing
const friendsSchema : Schema<IFriendsSchema>= new Schema({
    sentBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    userA: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    userB: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status:{
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED", "BLOCKED"],
        default: "PENDING"
    }

}, {timestamps: true})

friendsSchema.pre("validate", function(){
    const userA= this.userA.toString();
    const userB= this.userB.toString();
    if( userA === userB){
        throw new Error("You can not send request to yourself");
    }
    if(userA > userB){
        const temp=  this.userA;
        this.userA= this.userB;
        this.userB= temp;
    }
})

friendsSchema.index(
    { userA: 1, userB: 1 },
    { unique: true }
);

const Friends: Model<IFriendsSchema>= mongoose.model("Friends", friendsSchema);

export default Friends;

