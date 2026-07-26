import User from "../models/User/User.model.js";
import { ApiError, ApiResponse } from "../utils/index.js";
import type { RequestHandler } from "express";
import type { IUser } from "../models/User/User.types.js";


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