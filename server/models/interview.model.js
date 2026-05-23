import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    confidence: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    correctness: { type: Number, default: 0 },
    finalScore: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    candidateName: { type: String, default: "Candidate" },
    role: { type: String, default: "Candidate" },
    experience: { type: String, default: "" },
    mode: { type: String, default: "Technical Interview" },
    overallScore: { type: Number, default: 0 },
    resumeAnalysis: {
      role: String,
      experience: String,
      projects: [String],
      skills: [String],
    },
    responses: [responseSchema],
    status: {
      type: String,
      enum: ["completed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
