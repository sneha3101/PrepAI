import express from "express";
import { analyzeResume } from "../controllers/resume.controller.js";
import { uploadResume } from "../middlewares/multer.js";

const resumeRouter = express.Router();

resumeRouter.post("/analyze", uploadResume.single("resume"), analyzeResume);

export default resumeRouter;
