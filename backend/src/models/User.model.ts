import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {Schema, Document, Model, Types} from 'mongoose';

interface IUser extends Document{
    username: string,
    email: string,
    password: string,
    avatar: string,
    refreshToken ?: string,
    isPasswordCorrect(password: string) : Promise<boolean>,
    generateAccessToken(): string,
    generateRefreshToken(): string,
}

type AccessTokenPayload= {
    _id: Types.ObjectId,
    username: string,
    email: string,
}

type RefreshTokenPayload={
    _id: Types.ObjectId,
}


const userSchema: Schema<IUser>= new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password:{
        type: String, 
        required: true,       
        trim: true,
    },
    avatar:{
        type: String,
    },
    refreshToken:{
        type: String,
    },
},
{timestamps: true});

userSchema.pre("save", async function (this: IUser) : Promise<void>{
    if(!this.isModified("password")) return;

    this.password= await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPasswordCorrect= async function(this: IUser, password : string) : Promise<boolean>{
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken= function(this: IUser): string{
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const payload: AccessTokenPayload={
            _id: this._id,
            username: this.username,
            email: this.email
        }; 
    if(!secret){
        throw new Error("Access Token Secret not defined !!");
    }
    return jwt.sign(
        payload,
        secret,
        {
            expiresIn: (process.env.ACCESS_EXPIRY ?? "1d") as jwt.SignOptions["expiresIn"]
        }
    )
}

userSchema.methods.generateRefreshToken= function(this: IUser): string{
    const secret= process.env.REFRESH_TOKEN_SECRET;
    const payload: RefreshTokenPayload= {
            _id: this._id,
        };
    if(!secret){
        throw new Error("Refresh Token Secret not defined !!");
    }
    return jwt.sign(
        payload,
        secret,
        {
            expiresIn: (process.env.ACCESS_EXPIRY ?? "1d") as jwt.SignOptions["expiresIn"],
        }
    )
}

const User: Model<IUser>= mongoose.model("User", userSchema);
export default User;