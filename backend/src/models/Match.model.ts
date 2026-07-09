import mongoose, { type Int32 } from "mongoose"
import {Schema, Model, Types, Document} from "mongoose";

interface IMatchSchema extends Document{
    player1: Types.ObjectId;
    player2: Types.ObjectId;
    winner: Types.ObjectId | null;
    score1: Int32;
    score2: Int32;
    createdAt: Date;
    updatedAt: Date;
}
