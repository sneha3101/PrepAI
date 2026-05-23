import mongoose from "mongoose";


const connectDb= async()=>{   //if we dont use async await promisess will occur which we dont want,this function ensures connection
    try{
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is missing in server .env")
        }
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("database connected")
    }catch(error){
        console.log(`database error ${error.message}`)
    }
}

export default connectDb
