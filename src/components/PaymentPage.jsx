import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Zap, X } from "lucide-react";

const CREATOR_PLANS = [
  {
    name: "Trial",
    price: "₹192",
    period: "15 days",
    description: "Perfect to explore Corex",
    popular: false,
    features: [
      "50 AI messages",
      "Reel script generator",
      "Trend engine access",
      "Basic growth audit",
      "Email support",
    ],
    missing: ["Brand deals tool", "Templates library", "Priority support"],
  },
  {
    name: "Pro",
    price: "₹499",
    period: "month",
    description: "For serious creators",
    popular: true,
    features: [
      "Unlimited AI messages",
      "All creator tools",
      "Brand deal calculator",
      "30-day content calendar",
      "Trend engine (real-time)",
      "Templates library",
      "Priority email support",
    ],
    missing: [],
  },
  {
    name: "Elite",
    price: "₹999",
    period: "month",
    description: "For top creators & agencies",
    popular: false,
    features: [
      "Everything in Pro",
      "5 team seats",
      "White-label exports",
      "Dedicated strategy call",
      "Custom integrations",
      "24/7 support",
      "Early feature access",
    ],
    missing: [],
  },
];

const COMPANY_PLANS = [
  {
    name: "Starter",
    price: "₹2,999",
    period: "month",
    description: "For early-stage startups",
    popular: false,
    features: [
      "100 AI messages/month",
      "Campaign builder",
      "Basic brand audit",
      "Budget allocator",
      "3 team seats",
      "Email support",
    ],
    missing: ["Competitor intel", "Custom reports", "Dedicated CSM"],
  },
  {
    name: "Growth",
    price: "₹7,999",
    period: "month",
    description: "For scaling brands",
    popular: true,
    features: [
      "Unlimited AI messages",
      "All company tools",
      "Competitor intelligence",
      "Influencer brief generator",
      "Custom PDF reports",
      "10 team seats",
      "Dedicated CSM",
      "Priority support",
    ],
    missing: [],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organisations",
    popular: false,
    features: [
      "Everything in Growth",
      "Unlimited seats",
      "Custom AI fine-tuning",
      "API access",
      "SLA guarantee",
      "On-site onboarding",
      "Dedicated account team",
    ],
    missing: [],
  },
];

function Toast({ message, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 20, x: "-50%" }}
      className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl"
      style={{
        background: "rgba(20,20,30,0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(124,58,237,0.3)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.2)",
        whiteSpace: "nowrap",
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(124,58,237,0.2)" }}
      >
        <Zap size={14} className="text-violet-400" />
      </div>
      <p className="text-sm text-zinc-200 font-medium">{message}</p>
      <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 ml-2">
        <X size={14} />
      </button>
    </motion.div>
  );
}

function PlanCard({ plan, delay }) {
  const [toast, setToast] = useState(false);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4 }}
        className="relative flex flex-col rounded-2xl p-6 transition-all duration-300"
        style={{
          background: plan.popular ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.04)",
          border: plan.popular ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          boxShadow: plan.popular
            ? "0 0 40px rgba(124,58,237,0.2), 0 8px 32px rgba(0,0,0,0.4)"
            : "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Popular badge */}
        {plan.popular && (
          <div
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}
          >
            Most Popular
          </div>
        )}

        {/* Plan name & price */}
        <div className="mb-5">
          <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
            {plan.name}
          </h3>
          <p className="text-xs text-zinc-500 mb-3">{plan.description}</p>
          <div className="flex items-baseline gap-1">
            <span
              className="text-3xl font-bold"
              style={{ fontFamily: "Sora, sans-serif", color: plan.popular ? "#a78bfa" : "#fff" }}
            >
              {plan.price}
            </span>
            {plan.period && <span className="text-zinc-500 text-sm">/{plan.period}</span>}
          </div>
        </div>

        <div className="h-px bg-white/[0.06] mb-5" />

        {/* Features */}
        <ul className="space-y-2.5 flex-1 mb-6">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(124,58,237,0.2)" }}
              >
                <Check size={10} className="text-violet-400" />
              </div>
              {f}
            </li>
          ))}
          {plan.missing.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-600">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-white/[0.04]">
                <X size={10} className="text-zinc-700" />
              </div>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={showToast}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
          style={
            plan.popular
              ? { background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }
              : { background: "rgba(255,255,255,0.07)", color: "#d4d4d8", border: "1px solid rgba(255,255,255,0.1)" }
          }
        >
          {plan.price === "Custom" ? "Contact sales" : "Pay Now"}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {toast && (
          <Toast
            message="Coming soon — Razorpay integration"
            onClose={() => setToast(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function PaymentPage({ onBack, userType = "creator" }) {
  const [tab, setTab] = useState(userType);
  const plans = tab === "company" ? COMPANY_PLANS : CREATOR_PLANS;

  return (
    <div className="min-h-screen overflow-y-auto relative z-10 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-10 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
            Upgrade{" "}
            <span className="gradient-text">Corex</span>
          </h1>
          <p className="text-zinc-500 max-w-md mx-auto">
            Choose the plan that fits your growth. Cancel anytime.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-10">
          <div
            className="flex p-1 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {["creator", "company"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize"
                style={
                  tab === t
                    ? { background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff" }
                    : { color: "#71717a" }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} delay={i * 0.08} />
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-zinc-700 text-xs mt-10"
        >
          All prices in INR · GST extra · Razorpay integration coming soon
        </motion.p>
      </div>
    </div>
  );
}
