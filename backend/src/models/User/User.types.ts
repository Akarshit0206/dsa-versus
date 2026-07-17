import {Types, Document} from "mongoose";

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

export type {IUser, AccessTokenPayload, RefreshTokenPayload};