import User from "../models/user.models.js"
import genToken from "../config/token.js"

export const googleAuth=async(req,res)=>{
    try {
        const {name,email}=req.body
        if (!email) {
            return res.status(400).json({message:"Email is required"})
        }

        let user= await User.findOne({email})
        if(!user){
            user=await User.create({
                name: name || email.split("@")[0],
                email
            })
        }

        let token=await genToken(user._id)
        res.cookie("token",token,{
            httpOnly:true,
            secure:true,
            sameSite:"none",
            maxAge:7*24*60*60*1000
        })
        return res.status(200).json(user)   //error codes 
    }
    
    
    
    catch (error) {
        return res.status(500).json({message:`Google auth error: ${error.message}`})
    }
}

export const logOut= async(req,res) =>{
    try {
        res.clearCookie("token", {
            httpOnly:true,
            secure:false,
            sameSite:"strict"
        })
        return res.status(200).json({message:"Logout Succesfully"})
    } catch (error) {
        return res.status(500).json({message:`Logout error: ${error.message}`})
    }
}
