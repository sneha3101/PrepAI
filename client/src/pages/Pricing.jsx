import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState } from "react";
import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

const getSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("prepai_user") || "{}");
  } catch {
    return {};
  }
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const plans = [
  {
    name: "Free",
    price: "Rs.0",
    credits: "100 Credits",
    description: "Perfect for beginners starting interview preparation.",
    badge: "Default",
    features: ["100 AI Interview Credits", "Basic Performance Report", "Voice Interview Access", "Limited History Tracking"],
    default: true,
  },
  {
    name: "Starter Pack",
    planId: "starter",
    price: "Rs.100",
    credits: "150 Credits",
    description: "Great for focused practice and skill improvement.",
    features: ["150 AI Interview Credits", "Detailed Feedback", "Performance Analytics", "Full Interview History"],
    featured: true,
  },
  {
    name: "Pro Pack",
    planId: "pro",
    price: "Rs.500",
    credits: "650 Credits",
    description: "Best value for serious job preparation.",
    badge: "Best Value",
    features: ["650 AI Interview Credits", "Advanced AI Feedback", "Skill Trend Analysis", "Priority AI Processing"],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("Starter Pack");
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handlePayment = async (plan) => {
    if (!plan.planId) return;

    if (selectedPlan !== plan.name) {
      setSelectedPlan(plan.name);
      return;
    }

    setPaymentError("");
    setPaymentLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay checkout. Please check your internet connection.");
      }

      const orderResult = await axios.post(
        `${SERVER_URL}/api/payment/create-order`,
        { planId: plan.planId },
        { withCredentials: true }
      );

      const { keyId, order, plan: serverPlan, user } = orderResult.data;

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "PrepAI",
        description: `${serverPlan.name} - ${serverPlan.credits} credits`,
        order_id: order.id,
        prefill: {
          name: user?.name || getSavedUser().name || "",
          email: user?.email || getSavedUser().email || "",
        },
        theme: {
          color: "#10B981",
        },
        handler: async (response) => {
          const verifyResult = await axios.post(`${SERVER_URL}/api/payment/verify`, response, {
            withCredentials: true,
          });

          localStorage.setItem("prepai_user", JSON.stringify(verifyResult.data.user));
          navigate("/home");
        },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setPaymentError(error.response?.data?.message || error.message || "Payment could not be started.");
      setPaymentLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F172A] px-5 py-8 text-[#E2E8F0]">
      <section className="mx-auto w-full max-w-7xl">
        <button
          onClick={() => navigate("/home")}
          aria-label="Go back home"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1E293B] text-sky-400 shadow-sm ring-1 ring-slate-700 transition hover:text-emerald-400"
        >
          <FiArrowLeft size={22} />
        </button>

        <div className="mt-2 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-4xl font-semibold md:text-5xl"
          >
            Choose Your Plan
          </motion.h1>
          <p className="mt-4 text-base text-slate-300">
            Flexible pricing to match your interview preparation goals.
          </p>
          {paymentError && (
            <p className="mx-auto mt-5 max-w-xl rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {paymentError}
            </p>
          )}
        </div>

        <div className="mt-14 grid gap-7 lg:grid-cols-3">
          {plans.map((plan, index) => {
              const isSelected = selectedPlan === plan.name;

              return (
                <motion.article
                  key={plan.name}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{
                    y: -12,
                    scale: 1.015,
                    borderColor: isSelected ? "rgba(52, 211, 153, 0.9)" : "rgba(56, 189, 248, 0.7)",
                  }}
                  onClick={() => !plan.default && setSelectedPlan(plan.name)}
                  className={`group relative min-h-[540px] overflow-hidden rounded-2xl border bg-[#1E293B] p-8 shadow-[0_18px_45px_rgba(2,6,23,0.32)] transition-shadow duration-300 hover:shadow-[0_28px_70px_rgba(2,6,23,0.48)] ${
                    isSelected ? "border-emerald-400/60 ring-1 ring-emerald-400/25" : "border-slate-700"
                  } ${plan.default ? "" : "cursor-pointer"}`}
                >
                  <motion.span
                    aria-hidden="true"
                    initial={{ x: "-130%" }}
                    whileHover={{ x: "130%" }}
                    transition={{ duration: 0.95, ease: "easeInOut" }}
                    className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-300/90 to-transparent"
                  />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                    <div className="absolute inset-x-6 top-0 h-32 rounded-full bg-emerald-400/10 blur-3xl" />
                  </div>

                  {plan.badge && (
                    <span
                      className={`absolute right-8 top-8 rounded-full px-4 py-2 text-xs font-bold ${
                        plan.badge === "Best Value"
                          ? "bg-emerald-500 text-[#0F172A]"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}

                  <h2 className="relative text-2xl font-semibold">{plan.name}</h2>
                  <p className="relative mt-8 text-5xl font-bold text-emerald-400 transition duration-300 group-hover:text-sky-300">
                    {plan.price}
                  </p>
                  <p className="relative mt-3 text-lg font-semibold text-slate-300">{plan.credits}</p>
                  <p className="relative mt-8 min-h-14 text-base leading-7 text-slate-300">{plan.description}</p>

                  <div className="relative mt-8 grid gap-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                        <FiCheckCircle
                          className="shrink-0 text-emerald-400 transition group-hover:scale-110 group-hover:text-sky-300"
                          size={18}
                        />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {!plan.default && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handlePayment(plan);
                      }}
                      disabled={paymentLoading && isSelected}
                      className={`relative mt-12 h-14 w-full rounded-xl text-base font-semibold transition ${
                        isSelected
                          ? "bg-emerald-500 text-[#0F172A] shadow-[0_12px_28px_rgba(34,197,94,0.22)] hover:-translate-y-0.5 hover:bg-sky-400 hover:shadow-[0_16px_36px_rgba(56,189,248,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
                          : "bg-slate-700 text-slate-200 hover:bg-emerald-500 hover:text-[#0F172A]"
                      }`}
                    >
                      {paymentLoading && isSelected ? "Opening Payment..." : isSelected ? "Proceed to Pay" : "Select Plan"}
                    </button>
                  )}
                </motion.article>
              );
            })}
        </div>
      </section>
    </main>
  );
};

export default Pricing;
