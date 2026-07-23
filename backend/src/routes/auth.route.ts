import express from "express";
import type { Request, Response, NextFunction } from "express";

export const authRouter= express.Router();

authRouter.route("/register").get((req: Request, res: Response, next: NextFunction)=>{
    res.send("Hello Register");
})