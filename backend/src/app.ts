import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import {Server} from 'socket.io';
import { authRouter } from "./routes/index.js";
import { errorHandler } from "./middlewares/index.js";
import { Socket } from "dgram";

export const app= express();
export const server= http.createServer(app);

export const io= new Server(server, {
    cors:{
        origin: process.env.CLIENT_URL,
        credentials: true,
    }
})

io.on("connection", (socket)=>{
    console.log("Web socket connected");
})
//middlewares
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}))

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit:"16kb"}));
app.use(cookieParser());


//routes
app.use("/api/auth", authRouter);

//errorHandler
app.use(errorHandler);