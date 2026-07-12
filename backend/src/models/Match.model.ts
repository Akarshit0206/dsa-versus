import mongoose, { model, type Int32 } from "mongoose"
import {Schema, Model, Types, Document} from "mongoose";

interface IPlayerStats{
    player: Types.ObjectId;
    testCasesPassed: number;
    timeTaken: number;
}
interface IMatchSchema extends Document{
    player1Stats: IPlayerStats;
    player2Stats: IPlayerStats;
    winner?: Types.ObjectId | null;
    totalTestCases: number;
    duration: number;
    endedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const playerStatsSchema: Schema<IPlayerStats>= new Schema({
    player: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    testCasesPassed:{
        type: Number,
        required: true,
        default: 0,
    },
    timeTaken:{
        type: Number,
        default: -1,
    }
}, {_id: false})

const matchSchema: Schema<IMatchSchema>= new Schema({
    player1Stats:{
        type: playerStatsSchema,
        required: true,
    },
    player2Stats:{
        type: playerStatsSchema,
        required: true,
    },
    winner:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    totalTestCases:{
        type: Number,
        required: true,
    },
    duration:{
        type: Number,
        required: true,
    },
    endedAt:{
        type: Date,
        default: null,
    }
},
    {
        timestamps: true
    }
);
const Match : Model<IMatchSchema>= model("Match", matchSchema);

export default Match;