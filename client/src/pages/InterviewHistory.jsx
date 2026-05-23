import { useEffect, useState } from "react";
import axios from "axios";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));

const InterviewHistory = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await axios.get(`${SERVER_URL}/api/interview/history`, {
          withCredentials: true,
        });
        setHistoryItems(result.data.interviews || []);
      } catch (error) {
        setHistoryError(error.response?.data?.message || "Could not load your interview history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const openReport = async (id) => {
    try {
      const result = await axios.get(`${SERVER_URL}/api/interview/reports/${id}`, {
        withCredentials: true,
      });
      navigate("/interview-report", {
        state: {
          interview: result.data.interview,
          reportId: id,
        },
      });
    } catch (error) {
      setHistoryError(error.response?.data?.message || "Could not open this report.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0F172A] px-5 py-8 text-[#E2E8F0]">
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex items-start gap-4">
          <button
            onClick={() => navigate("/home")}
            aria-label="Go back home"
            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1E293B] text-sky-400 shadow-sm ring-1 ring-slate-700 transition hover:text-emerald-400"
          >
            <FiArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-4xl font-semibold">Interview History</h1>
            <p className="mt-3 text-base text-slate-300">Only your completed interview reports appear here</p>
          </div>
        </div>

        {historyError && (
          <p className="mb-6 rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {historyError}
          </p>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-700 bg-[#1E293B] p-8 text-slate-300">
            Loading your interview history...
          </div>
        )}

        {!loading && !historyItems.length && (
          <div className="rounded-2xl border border-slate-700 bg-[#1E293B] p-8 text-center shadow-[0_14px_30px_rgba(2,6,23,0.28)]">
            <h2 className="text-2xl font-semibold">No interview history yet</h2>
            <p className="mt-3 text-sm text-slate-300">Complete an interview to see your report here.</p>
            <button
              onClick={() => navigate("/interview-login")}
              className="mt-6 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-sky-400"
            >
              Start Interview
            </button>
          </div>
        )}

        <div className="grid gap-7">
          {historyItems.map((item) => (
            <button
              key={item._id}
              onClick={() => openReport(item._id)}
              className="grid min-h-32 items-center gap-5 rounded-2xl border border-slate-700 bg-[#1E293B] p-6 text-left shadow-[0_14px_30px_rgba(2,6,23,0.28)] transition hover:-translate-y-1 hover:border-sky-400/60 hover:shadow-[0_18px_38px_rgba(2,6,23,0.35)] md:grid-cols-[1fr_auto_auto]"
            >
              <div>
                <h2 className="text-xl font-semibold">{item.role || "Interview"}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {item.experience || "Experience not specified"} - {item.mode || "Interview"} - {item.responses?.length || 0} questions
                </p>
                <p className="mt-2 text-sm text-slate-400">{formatDate(item.createdAt)}</p>
              </div>
              <div className="text-left md:text-center">
                <p className="text-2xl font-bold text-emerald-400">{item.overallScore}/10</p>
                <p className="text-xs text-slate-400">Overall Score</p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-300">
                completed
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};

export default InterviewHistory;
