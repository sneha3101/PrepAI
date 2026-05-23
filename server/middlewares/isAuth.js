import jwt from "jsonwebtoken"
import User from "../models/user.models.js"

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: token missing" })
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing in server .env")
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select("-__v")
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: user not found" })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ message: `Unauthorized: ${error.message}` })
    }
}

export default isAuth
