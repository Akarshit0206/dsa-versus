import mongoose from "mongoose";
import {Schema, Model, Document, Types} from "mongoose";

type reqStatus= "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
interface IFriendsSchema extends Document{
    sentBy: Types.ObjectId;
    userA: Types.ObjectId;
    userB: Types.ObjectId;
    status: reqStatus;
    createdAt: Date;
    updatedAt: Date;
}

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

