import mongoose from "mongoose"

async function connectDb(): Promise<void>{
    try{
        const uri= process.env.MONGODB_URI;
        if(!uri) throw new Error("MONGODB_URI is not defined in environment variables");
        const connectionInstance= await mongoose.connect(`${uri}/dsa-versus`);
        console.log("MongoDB Connected successfully !! Host:", connectionInstance.connection.host);
    }
    catch (error) {
       if (error instanceof Error) {
           console.log("MongoDB Connection Error ::", error.message);
       } else {
           console.log("MongoDB Connection Error :: Unknown error", error);
       }
       throw error;
   }
} 

export default connectDb;