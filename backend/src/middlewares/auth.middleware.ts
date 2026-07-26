import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../models/User/User.model.js";
import { ApiError, asyncHandler } from "../utils/index.js";
import type { RequestHandler } from "express";


export const verifyJWT: RequestHandler= asyncHandler(async (req, res, next)=>{
    try{
        const token= req.cookies?.accessToken;

        if(!token){
            throw new ApiError(401, "UnAuthorized Request");
        }
        const secret= process.env.ACCESS_TOKEN_SECRET;
        if(!secret){
            throw new ApiError(500, "Access Token Secret not loaded");
        }
        const decoded = jwt.verify(token, secret) as JwtPayload;

        const user= await User.findOne({
            _id: decoded?.id,
        }).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401, "Invalid AccessToken")
        }

        req.user= user;
        next();
    }
    catch(error){
        if(error instanceof Error){
            throw new ApiError(401, error?.message);
        }
        throw new ApiError(401, "Invalid access token");
    }
});