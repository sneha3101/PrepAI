import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import {
  FiBarChart2,
  FiCreditCard,
  FiFileText,
  FiMic,
  FiMonitor,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/prepai-logo.svg";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

const defaultUser = {
  name: "Candidate",
  email: "guest@prepai.local",
  credits: 100,
};

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("prepai_user");
    return savedUser ? JSON.parse(savedUser) : defaultUser;
  } catch {
    return defaultUser;
  }
};

const hasSeenHomeIntro = () => sessionStorage.getItem("prepai_home_intro_seen") === "true";

const journeySteps = [
  { step: "STEP 1", title: "Upload Resume", description: "AI reads projects, skills, role and experience.", icon: FiFileText },
  { step: "STEP 2", title: "Voice Interview", description: "Mira asks resume-based questions naturally.", icon: FiMic },
  { step: "STEP 3", title: "AI Report", description: "Get scores, feedback, trends and a downloadable report.", icon: FiBarChart2 },
];

const features = [
  { title: "Resume Based Interview", description: "Questions are generated from role, projects and skills.", icon: BsRobot },
  { title: "Natural Question Flow", description: "Mira asks questions one by one without a countdown pressure.", icon: FiMic },
  { title: "Credits System", description: "Each completed interview uses 25 credits.", icon: FiCreditCard },
  { title: "Performance Tracking", description: "Confidence, communication and correctness are scored.", icon: FiTrendingUp },
  { title: "Technical Mode", description: "Practical technical questions based on your profile.", icon: FiMonitor },
  { title: "Human Feedback", description: "Short suggestions after every submitted answer.", icon: FiUser },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const staggerGroup = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getSavedUser);
  const [showIntro, setShowIntro] = useState(() => !hasSeenHomeIntro());

  const credits = user?.credits ?? 100;
  const firstName = useMemo(() => user?.name?.split(" ")[0] || "Candidate", [user]);

  useEffect(() => {
    if (!showIntro) return undefined;

    const introTimer = window.setTimeout(() => setShowIntro(false), 3400);
    localStorage.removeItem("prepai_home_intro_seen");
    sessionStorage.setItem("prepai_home_intro_seen", "true");
    return () => window.clearTimeout(introTimer);
  }, [showIntro]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await axios.get(`${SERVER_URL}/api/user/me`, {
          withCredentials: true,
        });
        const currentUser = result.data.user || result.data;
        setUser(currentUser);
        localStorage.setItem("prepai_user", JSON.stringify(currentUser));
      } catch (error) {
        console.warn("Using local user until you sign in again:", error.response?.data?.message || error.message);
      }
    };

    loadUser();
  }, []);

  if (showIntro) {
    return (
      <main className="relative flex min-h-screen items-center overflow-hidden bg-[#0F172A] px-6 text-[#E2E8F0]">
        <motion.div
          aria-hidden="true"
          animate={{ backgroundPosition: ["0px 0px", "36px 36px"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148, 163, 184, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.22) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <motion.div
          aria-hidden="true"
          initial={{ x: "-120%" }}
          animate={{ x: "120%" }}
          transition={{ duration: 1.15, delay: 1.8, ease: [0.76, 0, 0.24, 1] }}
          className="absolute top-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent"
        />

        <section className="relative z-10 mx-auto w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mb-10 flex items-center gap-3"
          >
            <img src={logo} alt="PrepAI" className="h-11 w-11 rounded-xl object-contain ring-1 ring-emerald-400/30" />
            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">PrepAI</span>
          </motion.div>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ x: -140, opacity: 0, filter: "blur(14px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl font-semibold leading-tight text-slate-200 md:text-8xl"
            >
              Practice Interviews
            </motion.h1>
          </div>

          <div className="mt-3 overflow-hidden">
            <motion.h2
              initial={{ x: 160, opacity: 0, filter: "blur(14px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.72, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl font-semibold leading-tight text-slate-200 md:text-8xl"
            >
              with{" "}
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.95, ease: "easeOut" }}
                className="text-emerald-500"
              >
                Mira
              </motion.span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 1.45 }}
            className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-sky-300"
          >
            Practice Like It&apos;s the Real Interview
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.05, delay: 1.95, ease: [0.76, 0, 0.24, 1] }}
            className="mt-10 h-1 origin-left rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-transparent"
          />
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F172A] text-[#E2E8F0]">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          aria-hidden="true"
          animate={{ backgroundPosition: ["0px 0px", "36px 36px"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148, 163, 184, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.22) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={{ x: ["-20%", "120%"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
          className="absolute top-28 h-px w-1/2 bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent"
        />
        <motion.div
          aria-hidden="true"
          animate={{ x: ["120%", "-20%"] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          className="absolute bottom-80 h-px w-1/2 bg-gradient-to-r from-transparent via-sky-300/50 to-transparent"
        />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 px-4 pt-4 md:px-8"
      >
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl border border-slate-700 bg-[#1E293B]/95 px-4 py-3 shadow-[0_18px_45px_rgba(2,6,23,0.35)] backdrop-blur md:px-6">
          <button onClick={() => navigate("/home")} className="flex min-w-0 items-center gap-3 text-left">
            <motion.span
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F172A] p-1.5 ring-1 ring-emerald-400/30"
            >
              <img src={logo} alt="PrepAI" className="h-full w-full rounded-lg object-contain" />
            </motion.span>
            <span className="truncate text-lg font-semibold">PrepAI</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/interview-history")}
              className="hidden h-10 rounded-full border border-slate-600 bg-[#0F172A] px-4 text-sm font-semibold text-slate-300 transition hover:border-sky-400 hover:text-sky-300 sm:block"
            >
              History
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="hidden h-10 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400 hover:text-[#0F172A] md:block"
            >
              Buy Credits
            </button>
            <div className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0F172A] px-3 text-sm font-semibold text-slate-200 ring-1 ring-slate-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/50 text-emerald-400">
                <FiCreditCard size={13} />
              </span>
              <span>{credits} credits</span>
            </div>
            <button
              onClick={() => navigate("/auth")}
              aria-label={`Open account for ${firstName}`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-[#0F172A] transition hover:bg-sky-400"
            >
              <FiUser size={18} />
            </button>
          </div>
        </nav>
      </motion.header>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 md:px-8 md:py-12 lg:min-h-[560px] lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.12)]"
          >
            <IoSparkles size={17} />
            Welcome back, {firstName}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: "easeOut" }}
            className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-sky-300"
          >
            Practice Like It&apos;s the Real Interview
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22, ease: "easeOut" }}
            className="mt-8 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl"
          >
            Practice Interviews with{" "}
            <motion.span
              animate={{ opacity: [0.72, 1, 0.82] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="text-emerald-400"
            >
              Mira
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.34, ease: "easeOut" }}
            className="mt-8 max-w-3xl text-base leading-7 text-slate-300 md:text-lg"
          >
            Upload your resume, answer AI-generated questions, get live feedback, and download a complete interview report.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45, ease: "easeOut" }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/interview-login")}
              className="h-12 rounded-full bg-emerald-500 px-10 text-sm font-semibold text-[#0F172A] shadow-[0_12px_28px_rgba(34,197,94,0.22)] transition hover:bg-sky-400"
            >
              Start Interview
            </motion.button>
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/interview-history")}
              className="h-12 rounded-full border border-slate-600 bg-[#1E293B] px-10 text-sm font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-300"
            >
              View History
            </motion.button>
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/pricing")}
              className="h-12 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-10 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400 hover:text-[#0F172A]"
            >
              Buy Credits
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: 36, rotateX: 8 }}
          animate={{ opacity: 1, x: 0, rotateX: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl border border-slate-700 bg-[#1E293B]/95 p-7 shadow-[0_18px_45px_rgba(2,6,23,0.35)] backdrop-blur"
        >
          <motion.div
            aria-hidden="true"
            animate={{ x: ["-120%", "120%"] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent"
          />
          <p className="text-sm font-semibold text-slate-300">Credit Balance</p>
          <div className="mt-6 flex items-end justify-between border-y border-slate-700 py-7">
            <div>
              <motion.p
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="text-5xl font-bold text-emerald-400"
              >
                {credits}
              </motion.p>
              <p className="mt-2 text-sm text-slate-400">25 credits per interview</p>
            </div>
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-xl bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20"
            >
              {Math.floor(credits / 25)} left
            </motion.span>
          </div>
          <p className="mt-6 text-sm leading-6 text-slate-300">
            Complete four interviews to use your starting 100 credits.
          </p>
          <div className="mt-7 grid gap-3">
            {["Resume scan", "Voice questions", "AI report"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.45 + index * 0.12 }}
                className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#0F172A] px-4 py-3 text-sm"
              >
                <span className="text-slate-300">{item}</span>
                <motion.span
                  animate={{ scale: [1, 1.22, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.35 }}
                  className="h-2.5 w-2.5 rounded-full bg-emerald-400"
                />
              </motion.div>
            ))}
          </div>
        </motion.aside>
      </section>

      <motion.section
        variants={staggerGroup}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-5 pb-14 md:grid-cols-3 md:px-8"
      >
        {journeySteps.map(({ step, title, description, icon: Icon }) => (
          <motion.article
            key={title}
            variants={fadeUp}
            transition={{ duration: 0.55, ease: "easeOut" }}
            whileHover={{ y: -8, borderColor: "rgba(56, 189, 248, 0.55)" }}
            className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-[#1E293B] p-7 shadow-[0_14px_30px_rgba(2,6,23,0.28)]"
          >
            <motion.span
              aria-hidden="true"
              initial={{ x: "-120%" }}
              whileHover={{ x: "120%" }}
              transition={{ duration: 0.85, ease: "easeInOut" }}
              className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/80 to-transparent"
            />
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F172A] text-sky-300 ring-1 ring-sky-400/20">
              <Icon size={23} />
            </span>
            <p className="mt-6 text-xs font-bold tracking-wide text-emerald-300">{step}</p>
            <h2 className="mt-3 text-xl font-semibold">{title}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">{description}</p>
          </motion.article>
        ))}
      </motion.section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 md:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-3xl font-semibold md:text-4xl"
        >
          AI Interview Features
        </motion.h2>
        <motion.div
          variants={staggerGroup}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {features.map(({ title, description, icon: Icon }) => (
            <motion.article
              key={title}
              variants={fadeUp}
              transition={{ duration: 0.55, ease: "easeOut" }}
              whileHover={{ y: -7, scale: 1.01, borderColor: "rgba(52, 211, 153, 0.45)" }}
              className="relative min-h-44 overflow-hidden rounded-2xl border border-slate-700 bg-[#1E293B] p-7 shadow-[0_14px_30px_rgba(2,6,23,0.28)]"
            >
              <motion.span
                aria-hidden="true"
                animate={{ opacity: [0.15, 0.45, 0.15] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-0 top-0 h-px bg-emerald-300/60"
              />
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
                <Icon size={20} />
              </span>
              <h3 className="mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-300">{description}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>
    </main>
  );
};

export default Home;
