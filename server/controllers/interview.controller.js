import { askAi } from "../services/openRouter.services.js";
import Interview from "../models/interview.model.js";

const normalizeQuestion = (question) =>
  String(question || "")
    .replace(/^\s*(?:\d+[\).:-]\s*|[-*]\s*)/, "")
    .trim();

const parseQuestions = (content) =>
  String(content || "")
    .split("\n")
    .map(normalizeQuestion)
    .filter(Boolean)
    .slice(0, 5);

const hrQuestions = [
  "Tell me something about yourself.",
  "Run me through your resume.",
  "How would your friends describe you?",
  "What are your hobbies?",
  "What do you like to do in your free time?",
  "What are your outside interests?",
  "How do you spend your leisure time?",
  "Give me an example of your creativity.",
  "What was the last book you read?",
  "Which movie has inspired you and why?",
  "Do you play any sports and which one?",
  "What are your strengths and weaknesses?",
  "What is your greatest strength?",
  "What is your biggest weakness?",
  "What makes you angry?",
  "What makes you happy?",
  "What has been your most significant achievement?",
  "What have you done that shows initiative?",
  "What was the toughest decision you ever had to make?",
  "What has been your greatest crisis and how did you solve it?",
  "How has college prepared you for this career?",
  "Who has inspired you in your life and how?",
  "Do you have any questions for me?",
  "Why should I hire you?",
  "Why do you think we should hire you for this job?",
  "Give me one good reason why we should hire you.",
  "Explain how you would be an asset to this organization.",
  "Why do you think you are suitable for this job?",
  "Why do you think this job is best suited for you?",
  "What do you know about this company?",
  "Tell me something about our company.",
  "Describe your ideal company, location and job.",
  "Why do you want to work at our company?",
  "How do you feel about working nights and weekends?",
  "Are you ready to keep late hours?",
  "Can you work under pressure?",
  "Are you willing to relocate or travel?",
  "What are your salary expectations?",
  "How much salary do you expect?",
  "What are your career options right now?",
  "Name one skill of yours that would be right for this job.",
  "Would you like to know anything about our company?",
  "What is the difference between confidence and overconfidence?",
  "What is the difference between hard work and smart work?",
  "How do you define success and measure it by your own definition?",
  "Where do you see yourself five years from now?",
  "What are your goals?",
  "What motivates you?",
  "What motivates you to do good work?",
  "Are you overqualified for this position?",
  "Would you lie for the company?",
  "Have you considered starting your own business?",
  "If you won Rs.10 crores in a lottery, would you still work?",
  "On a scale of one to ten, rate me as your interviewer and give reasons.",
];

const getRandomHrQuestions = () =>
  [...hrQuestions]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

const fallbackQuestions = ({ role, experience, projects = [], skills = [] }) => {
  const roleText = role || "this role";
  const experienceText = experience || "your experience";
  const projectText = projects[0] || "your main project";
  const skillText = skills.slice(0, 3).join(", ") || "your technical skills";

  return [
    `Can you briefly introduce yourself and explain why you are interested in working as a ${roleText}?`,
    `Which part of your ${experienceText} experience helped you become more confident in practical development work?`,
    `Tell me about ${projectText} and explain the main problem you solved while building it.`,
    `How have you used ${skillText} together to create a reliable and user friendly application?`,
    `If ${projectText} suddenly had many users, what technical changes would you make first and why?`,
  ];
};

const clampScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(10, Math.round(number)));
};

const parseEvaluation = (content) => {
  const jsonText = String(content || "").match(/\{[\s\S]*\}/)?.[0] || content;
  const parsed = JSON.parse(jsonText);
  const confidence = clampScore(parsed.confidence);
  const communication = clampScore(parsed.communication);
  const correctness = clampScore(parsed.correctness);
  const finalScore = clampScore(parsed.finalScore || Math.round((confidence + communication + correctness) / 3));

  return {
    confidence,
    communication,
    correctness,
    finalScore,
    feedback: String(parsed.feedback || "Give clearer details and connect your answer to the question.").trim(),
  };
};

const fallbackEvaluation = (answer) => {
  const words = String(answer || "").trim().split(/\s+/).filter(Boolean).length;
  const hasDetail = words >= 35;
  const hasStructure = /\b(first|second|because|for example|finally|therefore|so)\b/i.test(answer);
  const base = words < 8 ? 2 : words < 20 ? 4 : hasDetail ? 7 : 6;
  const confidence = clampScore(base + (hasStructure ? 1 : 0));
  const communication = clampScore(base);
  const correctness = clampScore(base + (hasDetail ? 1 : 0));

  return {
    confidence,
    communication,
    correctness,
    finalScore: clampScore(Math.round((confidence + communication + correctness) / 3)),
    feedback: hasDetail
      ? "Good attempt; add sharper examples and stronger result-focused details."
      : "Add more specific details and explain your thought process clearly.",
  };
};

export const generateInterviewQuestions = async (req, res) => {
  const { role, experience, mode, projects = [], skills = [], resumeText = "" } = req.body || {};
  const projectText = Array.isArray(projects) ? projects.join(", ") : String(projects || "");
  const skillsText = Array.isArray(skills) ? skills.join(", ") : String(skills || "");
  const safeResume = String(resumeText || "").slice(0, 12000);

  const userPrompt = `
Role:${role || ""}
Experience:${experience || ""}
InterviewMode:${mode || ""}
Projects:${projectText}
Skills:${skillsText}
Resume:${safeResume}
`;

  try {
    if (String(mode || "").toLowerCase().includes("hr")) {
      return res.status(200).json({ questions: getRandomHrQuestions() });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(200).json({ questions: fallbackQuestions({ role, experience, projects, skills }) });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 -> easy
Question 2 -> easy
Question 3 -> medium
Question 4 -> medium
Question 5 -> hard

Make questions based on the candidate's role, experience, interviewMode, projects, skills, and resume details.
`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const content = await askAi(messages);
    const questions = parseQuestions(content);

    if (questions.length < 5) {
      return res.status(200).json({ questions: fallbackQuestions({ role, experience, projects, skills }) });
    }

    return res.status(200).json({ questions });
  } catch (error) {
    console.error("Question generation failed:", error.message);
    return res.status(200).json({ questions: fallbackQuestions({ role, experience, projects, skills }) });
  }
};

export const evaluateInterviewAnswer = async (req, res) => {
  const { question, answer } = req.body || {};

  if (!question || !answer) {
    return res.status(400).json({ message: "Question and answer are required" });
  }

  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(200).json(fallbackEvaluation(answer));
    }

    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence - Does the answer sound clear, confident, and well-presented?
2. Communication - Is the language simple, clear, and easy to understand?
3. Correctness - Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`,
      },
      {
        role: "user",
        content: `
Question: ${question}
Answer: ${answer}
`,
      },
    ];

    const content = await askAi(messages);
    return res.status(200).json(parseEvaluation(content));
  } catch (error) {
    console.error("Answer evaluation failed:", error.message);
    return res.status(200).json(fallbackEvaluation(answer));
  }
};

const getAverageScore = (responses) => {
  if (!Array.isArray(responses) || responses.length === 0) return 0;
  const total = responses.reduce((sum, response) => sum + Number(response.finalScore || 0), 0);
  return Number((total / responses.length).toFixed(1));
};

export const saveInterviewReport = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      candidateName,
      role,
      experience,
      mode,
      responses = [],
      resumeAnalysis = {},
    } = req.body || {};

    if (!Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ message: "Interview responses are required" });
    }

    const interview = await Interview.create({
      user: req.user._id,
      candidateName: candidateName || req.user.name || "Candidate",
      role: role || "Candidate",
      experience: experience || "",
      mode: mode || "Technical Interview",
      overallScore: getAverageScore(responses),
      resumeAnalysis: {
        role: resumeAnalysis.role,
        experience: resumeAnalysis.experience,
        projects: resumeAnalysis.projects || [],
        skills: resumeAnalysis.skills || [],
      },
      responses,
    });

    return res.status(201).json({ interview });
  } catch (error) {
    return res.status(500).json({ message: `Save interview error: ${error.message}` });
  }
};

export const getInterviewHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const interviews = await Interview.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("role experience mode overallScore status createdAt responses");

    return res.status(200).json({ interviews });
  } catch (error) {
    return res.status(500).json({ message: `History fetch error: ${error.message}` });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.status(200).json({ interview });
  } catch (error) {
    return res.status(500).json({ message: `Interview fetch error: ${error.message}` });
  }
};
