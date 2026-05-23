import express from "express"
import { getCurrentUser, useInterviewCredits } from "../controllers/user.controller.js"
import isAuth from "../middlewares/isAuth.js"

const userRouter = express.Router()

userRouter.get("/me", isAuth, getCurrentUser)
userRouter.get("/current-user", isAuth, getCurrentUser)
userRouter.post("/use-interview-credits", isAuth, useInterviewCredits)

export default userRouter
