import { io } from "../app.js";

io.on("connection", (socket)=>{
    console.log("User =>", socket.id);
    console.log("Web socket connected  Backend");
})