import User from "../models/User/User.model.js";
import { ApiError, ApiResponse } from "../utils/index.js";
import type { RequestHandler } from "express";
import type { IUser } from "../models/User/User.types.js";
import mongoose from "mongoose";


//Helper functions

const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)\S{4,}$/;
  return passwordRegex.test(password);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) return false;

  const blockedDomains = [
    "test.com",
    "tempmail.com",
    "temp-mail.org",
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "yopmail.com",
    "throwawaymail.com",
    "trashmail.com",
    "fakeinbox.com",
    "getnada.com",
    "dispostable.com",
  ];

  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain || blockedDomains.includes(domain)) {
    return false;
  }

  return true;
};

const generateAccessAndRefreshToken= async (userId: mongoose.Types.ObjectId) =>{
    try{
        const user= await User.findById(userId);
        if(!user){
            throw new Error("Couldn't Find User");
        }
        const refreshToken= user.generateRefreshToken();
        const accessToken= user.generateAccessToken();

        if(!refreshToken || !accessToken){
            throw new Error("Failed to create refresh and access token");
        }

        user.refreshToken= refreshToken;
        user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    }
    catch(error){
        if(error instanceof Error){
            throw new ApiError(500, error.message);
        }
        else{
            throw new ApiError(500, "Something went wong while generating access and refresh tokens")
        }
    }
}

//controller functions
export const registerUser: RequestHandler= async (req, res, next)=>{
    const {username, email, password} = req.body;

    if ([email, username, password].some((field) => !field || field.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    if (!isValidEmail(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    if (!isValidPassword(password)) {
        throw new ApiError(
            400,
            "Password must be at least 4 characters and contain both letters and numbers"
        );
    }

    const existedUser= await User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "User already exists");
    }

    const user: IUser= await User.create({
        username: username.trim().toLowerCase(),
        email,
        password,
    })

    const createdUser= await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    )
}

export const loginUser: RequestHandler= async (req, res, next)=>{
    const {identifier, password} = req.body;

    if(!identifier || !password){
        throw new ApiError(400, "Both fields are required");
    }

    const user= await User.findOne({
        $or: [{username: identifier}, {email: identifier}],
    })
    if(!user){
        throw new ApiError(404, "User does not exists");
    }

    const isPasswordValid= await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect credentials");
    }

    const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id);

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
    }

    res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
            },
            "User logged In successfully",
        )
    )
}

export const logoutUser: RequestHandler = async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
}

//may shift from auth to user controller
export const getCurrentUser: RequestHandler= async (req, res, next)=>{
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ));
}