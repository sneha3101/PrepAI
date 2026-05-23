import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/connectDb.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import resumeRouter from "./routes/resume.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"

dotenv.config({ quiet: true })

const PORT = process.env.PORT || 8000
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientDistPath = path.join(__dirname, "../client/dist")

const app = express()
app.use(cors({
    origin: CLIENT_URL,
    credentials:true
}))   // app initialization through express

app.use(express.json())
app.use(cookieParser())

app.get("/api/health", (req, res) => {
    res.status(200).json({ message: "PrepAI API is running" })
})

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/resume", resumeRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter)

app.use(express.static(clientDistPath))

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"))
})

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`)
    await connectDb()
})
