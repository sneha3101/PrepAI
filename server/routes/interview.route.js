import express from "express";
import {
  evaluateInterviewAnswer,
  generateInterviewQuestions,
  getInterviewById,
  getInterviewHistory,
  saveInterviewReport,
} from "../controllers/interview.controller.js";
import isAuth from "../middlewares/isAuth.js";

const interviewRouter = express.Router();

interviewRouter.post("/questions", generateInterviewQuestions);
interviewRouter.post("/evaluate", evaluateInterviewAnswer);
interviewRouter.post("/reports", isAuth, saveInterviewReport);
interviewRouter.get("/history", isAuth, getInterviewHistory);
interviewRouter.get("/reports/:id", isAuth, getInterviewById);

export default interviewRouter;
