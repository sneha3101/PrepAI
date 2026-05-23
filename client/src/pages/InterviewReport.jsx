import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiArrowLeft, FiCreditCard, FiDownload } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

const average = (items, key) => {
  if (!items.length) return 0;
  return Number((items.reduce((total, item) => total + Number(item[key] || 0), 0) / items.length).toFixed(1));
};

const getSummary = (score) => {
  if (score >= 8) return "Strong interview performance.";
  if (score >= 6) return "Good performance with room to improve.";
  if (score >= 4) return "Average performance; keep practicing.";
  return "Significant improvement required.";
};

const buildTrendPath = (responses) => {
  const scores = responses.length ? responses.map((item) => Number(item.finalScore || 0)) : [0, 0, 0, 0, 0];
  const points = scores.map((score, index) => {
    const x = 32 + index * 162;
    const y = 226 - Math.max(0, Math.min(10, score)) * 18;
    return `${x} ${y}`;
  });

  return `M${points.join(" L")}`;
};

const InterviewReport = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [savedReportId, setSavedReportId] = useState(state?.reportId || state?.interview?._id || "");
  const reportData = useMemo(() => state?.interview || state || {}, [state]);
  const responses = useMemo(() => reportData?.responses || [], [reportData]);
  const overallScore = average(responses, "finalScore");
  const skills = [
    { label: "Confidence", value: average(responses, "confidence") },
    { label: "Communication", value: average(responses, "communication") },
    { label: "Correctness", value: average(responses, "correctness") },
  ];
  const trendPath = buildTrendPath(responses);

  useEffect(() => {
    const saveReport = async () => {
      if (savedReportId || state?.interview || !responses.length) return;

      try {
        const result = await axios.post(
          `${SERVER_URL}/api/interview/reports`,
          {
            candidateName: reportData.candidateName,
            role: reportData.role,
            experience: reportData.experience,
            mode: reportData.mode,
            responses,
            resumeAnalysis: reportData.resumeAnalysis,
          },
          { withCredentials: true }
        );
        setSavedReportId(result.data.interview?._id || "");
      } catch (error) {
        console.warn("Could not save interview history:", error.response?.data?.message || error.message);
      }
    };

    saveReport();
  }, [reportData, responses, savedReportId, state?.interview]);

  const downloadReport = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-[#0F172A] px-5 py-8 text-[#E2E8F0]">
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/interview-history")}
              aria-label="Go back to history"
              className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1E293B] text-sky-400 shadow-sm ring-1 ring-slate-700 transition hover:text-emerald-400"
            >
              <FiArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-4xl font-semibold">Interview Analytics Dashboard</h1>
              <p className="mt-3 text-base text-slate-300">
                {reportData?.role || "Candidate"} - {reportData?.experience || "Experience not specified"} - {reportData?.mode || "Interview"}
              </p>
            </div>
          </div>

          <button
            onClick={downloadReport}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-[#0F172A] shadow-[0_12px_28px_rgba(34,197,94,0.22)] transition hover:bg-sky-400"
          >
            <FiDownload size={18} />
            Download PDF
          </button>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-700 bg-[#1E293B] p-5 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F172A] text-emerald-300 ring-1 ring-emerald-400/20">
                <FiCreditCard size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-200">Credits after this interview</p>
                <p className="mt-1 text-xs text-slate-400">25 credits were used for this completed interview.</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-300">{reportData?.remainingCredits ?? "Updated"}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.8fr]">
          <div className="grid gap-8">
            <article className="rounded-2xl border border-slate-700 bg-[#1E293B] p-8 text-center shadow-[0_14px_30px_rgba(2,6,23,0.28)]">
              <p className="text-base font-medium text-slate-300">Overall Performance</p>
              <div
                className="mx-auto mt-12 flex h-40 w-40 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#22C55E ${overallScore * 10}%, #334155 ${overallScore * 10}% 100%)`,
                }}
              >
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#0F172A] text-4xl font-bold text-emerald-400">
                  {overallScore}
                </div>
              </div>
              <p className="mt-9 text-sm text-slate-400">Out of 10</p>
              <h2 className="mt-5 text-lg font-semibold">{getSummary(overallScore)}</h2>
              <p className="mt-2 text-sm text-slate-300">Based on your submitted interview answers.</p>
            </article>

            <article className="rounded-2xl border border-slate-700 bg-[#1E293B] p-8 shadow-[0_14px_30px_rgba(2,6,23,0.28)]">
              <h2 className="text-xl font-semibold">Skill Evaluation</h2>
              <div className="mt-8 grid gap-7">
                {skills.map((skill) => (
                  <div key={skill.label}>
                    <div className="mb-3 flex justify-between text-base font-medium">
                      <span>{skill.label}</span>
                      <span className="text-emerald-400">{skill.value}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-700">
                      <div
                        className="h-3 rounded-full bg-emerald-500"
                        style={{ width: `${skill.value * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="grid gap-8">
            <article className="rounded-2xl border border-slate-700 bg-[#1E293B] p-8 shadow-[0_14px_30px_rgba(2,6,23,0.28)]">
              <h2 className="text-xl font-semibold">Performance Trend</h2>
              <div className="mt-8 h-72 rounded-xl border border-slate-700 bg-[#0F172A] p-5">
                <svg viewBox="0 0 700 260" className="h-full w-full" role="img" aria-label="Performance trend chart">
                  {[0, 1, 2, 3].map((line) => (
                    <line
                      key={line}
                      x1="32"
                      x2="680"
                      y1={28 + line * 58}
                      y2={28 + line * 58}
                      stroke="#334155"
                      strokeDasharray="4 4"
                    />
                  ))}
                  <path d={trendPath} fill="none" stroke="#22c55e" strokeWidth="4" />
                  {["Q1", "Q2", "Q3", "Q4", "Q5"].map((label, index) => (
                    <text key={label} x={28 + index * 162} y="248" fill="#94a3b8" fontSize="15">
                      {label}
                    </text>
                  ))}
                  {["10", "6", "3", "0"].map((label, index) => (
                    <text key={label} x="4" y={32 + index * 58} fill="#94a3b8" fontSize="15">
                      {label}
                    </text>
                  ))}
                </svg>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-700 bg-[#1E293B] p-8 shadow-[0_14px_30px_rgba(2,6,23,0.28)]">
              <h2 className="text-xl font-semibold">Question Breakdown</h2>
              <div className="mt-8 grid gap-6">
                {(responses.length ? responses : []).map((item, index) => (
                  <div key={`${item.question}-${index}`} className="rounded-xl border border-slate-700 bg-[#0F172A] p-6">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <p className="text-sm text-slate-400">Question {index + 1}</p>
                        <h3 className="mt-2 text-base font-semibold leading-7">{item.question}</h3>
                      </div>
                      <span className="h-fit rounded-lg bg-emerald-500/15 px-4 py-2 text-base font-bold text-emerald-300">
                        {item.finalScore} / 10
                      </span>
                    </div>
                    <div className="mt-5 rounded-lg border border-slate-700 bg-[#1E293B] p-4">
                      <p className="text-sm font-bold text-sky-300">Your Answer</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.answer}</p>
                    </div>
                    <div className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-4">
                      <p className="text-sm font-bold text-emerald-300">AI Feedback</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
};

export default InterviewReport;
