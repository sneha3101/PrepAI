import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FiMic, FiVolume2 } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import femaleAi from "../assets/female-ai.mp4";

const ServerUrl = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

const getSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("prepai_user") || "{}");
  } catch {
    return {};
  }
};

const chooseFemaleVoice = (voices) => {
  const femaleVoiceNames = ["zira", "female", "samantha", "victoria", "karen", "susan", "google uk english female"];
  return (
    voices.find((voice) => femaleVoiceNames.some((name) => voice.name.toLowerCase().includes(name))) ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) ||
    voices[0] ||
    null
  );
};

const InterviewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const resumeAnalysis = state?.resumeAnalysis || {};
  const savedUser = getSavedUser();
  const candidateName = state?.candidateName || savedUser.name || "Sneha";
  const firstName = candidateName.split(" ")[0] || "Sneha";
  const [questions, setQuestions] = useState([]);
  const [questionError, setQuestionError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [responses, setResponses] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [voice, setVoice] = useState(null);
  const [voicesReady, setVoicesReady] = useState(false);
  const [introSpoken, setIntroSpoken] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const spokenQuestionRef = useRef("");

  const activeQuestion = questions[currentQuestion] || "";
  const progress = useMemo(
    () => (questions.length ? ((currentQuestion + 1) / questions.length) * 100 : 0),
    [currentQuestion, questions.length]
  );
  const miraIntro = `Hi ${firstName}. I am your interviewer Mira. I hope you are feeling confident and ready. I will ask you a few questions. Just answer naturally and take your time. Let's begin.`;

  const speakText = useCallback((text, options = {}) => {
    if (!text || !("speechSynthesis" in window)) return null;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = options.rate || 0.92;
    utterance.pitch = 1;
    if (voice) utterance.voice = voice;
    if (options.onend) utterance.onend = options.onend;
    window.speechSynthesis.speak(utterance);
    return utterance;
  }, [voice]);

  const speakQuestion = useCallback((question) => {
    speakText(question);
  }, [speakText]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setVoicesReady(true);
      setIntroFinished(true);
      return undefined;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoice(chooseFemaleVoice(availableVoices));
      if (availableVoices.length) setVoicesReady(true);
    };

    loadVoices();
    const fallbackTimer = window.setTimeout(() => setVoicesReady(true), 700);
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.clearTimeout(fallbackTimer);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (introSpoken || !voicesReady) return undefined;

    setIntroSpoken(true);
    const fallbackTimer = window.setTimeout(() => setIntroFinished(true), 9000);
    const utterance = speakText(miraIntro, {
      rate: 0.9,
      onend: () => {
        window.clearTimeout(fallbackTimer);
        setIntroFinished(true);
      },
    });

    if (!utterance) {
      window.clearTimeout(fallbackTimer);
      setIntroFinished(true);
    }

    return () => window.clearTimeout(fallbackTimer);
  }, [introSpoken, miraIntro, speakText, voicesReady]);

  useEffect(() => {
    const generateQuestions = async () => {
      try {
        const result = await axios.post(
          `${ServerUrl}/api/interview/questions`,
          {
            role: state?.role || resumeAnalysis.role || "frontend developer",
            experience: state?.experience || resumeAnalysis.experience || "2 years",
            mode: state?.mode || "Technical Interview",
            projects: resumeAnalysis.projects || [],
            skills: resumeAnalysis.skills || [],
            resumeText: resumeAnalysis.resumeText || "",
          },
          { withCredentials: true }
        );
        setQuestions(result.data.questions || []);
      } catch (error) {
        setQuestionError(error.response?.data?.message || "Could not generate interview questions.");
      }
    };

    generateQuestions();
  }, [resumeAnalysis.experience, resumeAnalysis.projects, resumeAnalysis.resumeText, resumeAnalysis.role, resumeAnalysis.skills, state?.experience, state?.mode, state?.role]);

  useEffect(() => {
    if (!introFinished || !activeQuestion || spokenQuestionRef.current === activeQuestion) return;
    spokenQuestionRef.current = activeQuestion;
    speakQuestion(activeQuestion);
  }, [activeQuestion, introFinished, speakQuestion]);

  useEffect(() => () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const submitAnswer = async () => {
    if (!activeQuestion || !answer.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const result = await axios.post(
        `${ServerUrl}/api/interview/evaluate`,
        {
          question: activeQuestion,
          answer,
        },
        { withCredentials: true }
      );
      const evaluatedResponse = {
        question: activeQuestion,
        answer,
        ...result.data,
      };

      setCurrentFeedback(evaluatedResponse);
      setResponses((items) => [...items, evaluatedResponse]);
    } catch (error) {
      const fallbackFeedback = {
        confidence: 0,
        communication: 0,
        correctness: 0,
        finalScore: 0,
        feedback: error.response?.data?.message || "Evaluation failed. Please try submitting the answer again.",
      };
      setCurrentFeedback({
        question: activeQuestion,
        answer,
        ...fallbackFeedback,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const spendInterviewCredits = async () => {
    const localUser = getSavedUser();
    const currentCredits = Number(localUser.credits ?? 100);

    try {
      const result = await axios.post(`${ServerUrl}/api/user/use-interview-credits`, {}, { withCredentials: true });
      const updatedUser = result.data.user || { ...localUser, credits: result.data.credits };
      localStorage.setItem("prepai_user", JSON.stringify(updatedUser));
      return result.data.credits;
    } catch (error) {
      if (error.response?.status === 401) {
        const remainingCredits = Math.max(0, currentCredits - 25);
        localStorage.setItem("prepai_user", JSON.stringify({ ...localUser, credits: remainingCredits }));
        return remainingCredits;
      }

      throw error;
    }
  };

  const goToNextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((question) => question + 1);
      setAnswer("");
      setCurrentFeedback(null);
      return;
    }

    let remainingCredits;

    try {
      remainingCredits = await spendInterviewCredits();
    } catch (error) {
      setCurrentFeedback((feedback) => ({
        ...feedback,
        feedback: error.response?.data?.message || "Could not update credits. Please try again.",
      }));
      return;
    }

    const reportResponses = currentFeedback?.question && !responses.some((item) => item.question === currentFeedback.question)
      ? [...responses, currentFeedback]
      : responses;

    navigate("/interview-report", {
      state: {
        candidateName,
        role: state?.role || resumeAnalysis.role || "frontend developer",
        experience: state?.experience || resumeAnalysis.experience || "2 years",
        mode: state?.mode || "Technical Interview",
        responses: reportResponses,
        resumeAnalysis,
        remainingCredits,
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#0F172A] px-5 py-10 text-[#E2E8F0]">
      <section className="mx-auto grid w-full max-w-7xl overflow-hidden rounded-2xl border border-slate-700 bg-[#1E293B] shadow-[0_18px_45px_rgba(2,6,23,0.35)] lg:grid-cols-[0.55fr_1fr]">
        <aside className="border-b border-slate-700 p-6 lg:border-b-0 lg:border-r">
          <video
            src={femaleAi}
            autoPlay
            loop
            muted
            playsInline
            className="h-72 w-full rounded-2xl bg-[#0F172A] object-cover shadow-sm"
          />

          <div className="mt-7 rounded-2xl border border-slate-700 bg-[#0F172A] p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-300">Interview Status</p>
            <div className="mt-6 border-y border-slate-700 py-8">
              <div
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-2xl font-semibold text-emerald-400"
                style={{
                  background: `conic-gradient(#22C55E ${progress}%, #334155 ${progress}% 100%)`,
                }}
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0F172A]">
                  {currentQuestion + 1}/{questions.length || 5}
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold text-emerald-400">{currentQuestion + 1}</p>
                <p className="mt-1 text-xs text-slate-400">Current Question</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-sky-400">{questions.length || 5}</p>
                <p className="mt-1 text-xs text-slate-400">Total Questions</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="p-6 md:p-8">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-semibold text-emerald-400"
          >
            AI Smart Interview
          </motion.h1>

          <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-300">Mira</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{miraIntro}</p>
              </div>
              <button
                onClick={() => speakText(miraIntro, { rate: 0.9 })}
                aria-label="Hear Mira introduction again"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-sky-300 ring-1 ring-slate-700 transition hover:text-emerald-300"
              >
                <FiVolume2 size={18} />
              </button>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-slate-700 bg-[#0F172A] p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-400">Question {currentQuestion + 1} of {questions.length || 5}</p>
              <button
                onClick={() => speakQuestion(activeQuestion)}
                aria-label="Speak question again"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E293B] text-sky-300 ring-1 ring-slate-700 transition hover:text-emerald-300"
              >
                <FiVolume2 size={18} />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-semibold leading-8 text-[#E2E8F0]">
              {questionError || activeQuestion || "Preparing your question..."}
            </h2>
          </div>

          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={!activeQuestion || Boolean(currentFeedback)}
            className="mt-7 min-h-[430px] w-full resize-none rounded-2xl border border-slate-700 bg-[#0F172A] p-6 text-base leading-7 text-[#E2E8F0] outline-none transition placeholder:text-slate-500 focus:border-emerald-500"
            placeholder="Speak or type your answer here..."
          />

          {currentFeedback && (
            <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-bold text-emerald-300">AI Suggestion</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{currentFeedback.feedback}</p>
                </div>
                <span className="h-fit rounded-lg bg-emerald-500/15 px-4 py-2 text-base font-bold text-emerald-300">
                  {currentFeedback.finalScore} / 10
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <button
              aria-label="Record answer"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-sky-400 shadow-sm ring-1 ring-sky-400/30 transition hover:text-emerald-400"
            >
              <FiMic size={22} />
            </button>
            <button
              onClick={currentFeedback ? goToNextQuestion : submitAnswer}
              disabled={!activeQuestion || (!currentFeedback && !answer.trim()) || isEvaluating}
              className="h-14 flex-1 rounded-xl bg-emerald-500 px-6 text-base font-semibold text-[#0F172A] shadow-[0_12px_28px_rgba(34,197,94,0.24)] transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            >
              {isEvaluating
                ? "Evaluating..."
                : currentFeedback
                  ? currentQuestion === questions.length - 1 ? "View Report" : "Next Question"
                  : "Submit Answer"}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
};

export default InterviewPage;
