import {app} from "./app.js";
import connectDb from "./db/index.js"
import dotenv from "dotenv"

dotenv.config({
    path: "./.env"
});

connectDb()
.then(()=>{
    app.listen(process.env.PORT || 3001, ()=>{
        console.log(`server is running at port ${process.env.PORT}`);
    })
})
.catch((error) => {
       if (error instanceof Error) {
           console.log("MongoDB Connection Error ::", error.message);
       } else {
           console.log("MongoDB Connection Error :: Unknown error", error);
       }
       process.exit(1);
})
