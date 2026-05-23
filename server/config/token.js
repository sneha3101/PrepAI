import jwt from "jsonwebtoken";

const genToken=async(userId)=>{
     try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing in server .env")
        }
        const token=jwt.sign({userId},process.env.JWT_SECRET,{expiresIn :"7d"})
    return token 
     } catch (error) {
        throw error
     }

}

export default genToken
