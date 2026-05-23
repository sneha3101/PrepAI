import { useState } from "react";
import axios from "axios";
import { FiBarChart2, FiBriefcase, FiFilePlus, FiMic, FiUploadCloud, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const setupBenefits = [
  { title: "Choose Role & Experience", icon: FiUser },
  { title: "Smart Voice Interview", icon: FiMic },
  { title: "Performance Analytics", icon: FiBarChart2 },
];

const ServerUrl = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

const getSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("prepai_user") || "{}");
  } catch {
    return {};
  }
};

const InterviewLogin = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical Interview");
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeError, setResumeError] = useState("");

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setResumeError("Please upload a PDF resume.");
      setResumeAnalysis(null);
      setResumeFileName("");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    setResumeFileName(file.name);
    setResumeError("");
    setIsAnalyzing(true);

    try {
      const result = await axios.post(`${ServerUrl}/api/resume/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setResumeAnalysis(result.data);
      setRole((currentRole) => currentRole || result.data.role || "");
      setExperience((currentExperience) => currentExperience || result.data.experience || "");
    } catch (error) {
      setResumeAnalysis(null);
      setResumeError(error.response?.data?.message || "Could not analyze this resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startInterview = () => {
    const savedUser = getSavedUser();
    const credits = Number(savedUser.credits ?? 100);

    if (credits < 25) {
      setResumeError("You need 25 credits to start an interview.");
      return;
    }

    navigate("/interview", {
      state: {
        candidateName: savedUser.name || "Sneha",
        role: role || "frontend developer",
        experience: experience || "2 years",
        mode,
        resumeAnalysis,
      },
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F172A] px-5 py-10 text-[#E2E8F0]">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-700 bg-[#1E293B] shadow-[0_24px_60px_rgba(2,6,23,0.38)] lg:grid-cols-[1fr_1fr]"
      >
        <div className="bg-[#0F172A] p-8 md:p-12">
          <div className="flex h-full flex-col justify-center">
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Start Your AI Interview</h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-slate-300">
              Practice real interview scenarios powered by AI. Improve communication, technical skills, and confidence.
            </p>

            <div className="mt-12 grid gap-5">
              {setupBenefits.map(({ title, icon: Icon }) => (
                <div
                  key={title}
                  className="flex min-h-14 items-center gap-4 rounded-xl border border-slate-700 bg-[#1E293B] px-5 text-sm font-semibold text-[#E2E8F0] shadow-sm"
                >
                  <Icon className="text-sky-400" size={21} />
                  {title}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <h2 className="text-4xl font-semibold">Interview Setup</h2>
          <div className="mt-9 grid gap-6">
            <label className="flex h-14 items-center gap-4 border-b border-slate-600 px-3 text-slate-300 focus-within:border-emerald-500">
              <FiUser size={18} />
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="Enter Role"
                className="h-full w-full bg-transparent text-sm font-medium text-[#E2E8F0] outline-none placeholder:text-slate-500"
              />
            </label>

            <label className="flex h-14 items-center gap-4 border-b border-slate-600 px-3 text-slate-300 focus-within:border-emerald-500">
              <FiBriefcase size={18} />
              <input
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                placeholder="Experience (e.g. 2 years)"
                className="h-full w-full bg-transparent text-sm font-medium text-[#E2E8F0] outline-none placeholder:text-slate-500"
              />
            </label>

            <select
              value={mode}
              onChange={(event) => setMode(event.target.value)}
              className="h-14 rounded-lg border border-slate-600 bg-[#0F172A] px-4 text-sm font-semibold text-[#E2E8F0] outline-none transition focus:border-emerald-500"
            >
              <option>Technical Interview</option>
              <option>HR Interview Mode</option>
              <option>Resume Based Interview</option>
            </select>

            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-600 bg-[#0F172A] text-center transition hover:border-sky-400 hover:bg-sky-950/30">
              <FiFilePlus className="text-emerald-400" size={36} />
              <span className="mt-4 text-sm font-semibold text-slate-300">
                {isAnalyzing ? "Scanning resume..." : resumeFileName || "Click to upload resume (Optional)"}
              </span>
              <span className="mt-2 text-xs text-slate-500">PDF only, max 5MB</span>
              <input type="file" accept="application/pdf" onChange={handleResumeUpload} className="hidden" />
            </label>

            {resumeError && (
              <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm font-medium text-red-200">
                {resumeError}
              </p>
            )}

            {resumeAnalysis && (
              <section className="rounded-xl border border-slate-700 bg-[#0F172A] p-5">
                <h3 className="text-lg font-semibold text-[#E2E8F0]">Resume Analysis Result</h3>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-700 bg-[#1E293B] px-4 py-3">
                    <p className="text-xs font-semibold uppercase text-slate-400">Role</p>
                    <p className="mt-2 text-sm font-semibold text-emerald-300">
                      {resumeAnalysis.role || "Role not found"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-[#1E293B] px-4 py-3">
                    <p className="text-xs font-semibold uppercase text-slate-400">Experience</p>
                    <p className="mt-2 text-sm font-semibold text-sky-300">
                      {resumeAnalysis.experience || "Experience not found"}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-slate-200">Projects:</p>
                  <ul className="mt-3 grid gap-2 text-sm font-medium text-slate-300">
                    {(resumeAnalysis.projects?.length ? resumeAnalysis.projects : ["No projects found"]).map((project) => (
                      <li key={project} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                        <span>{project}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-slate-200">Skills:</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(resumeAnalysis.skills?.length ? resumeAnalysis.skills : ["No skills found"]).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <button
              onClick={startInterview}
              className="flex h-14 items-center justify-center gap-3 rounded-full bg-emerald-500 px-6 text-base font-semibold text-[#0F172A] shadow-[0_12px_28px_rgba(34,197,94,0.24)] transition hover:bg-sky-400"
            >
              <FiUploadCloud size={18} />
              Start Interview
            </button>
          </div>
        </div>
      </motion.section>
    </main>
  );
};

export default InterviewLogin;
