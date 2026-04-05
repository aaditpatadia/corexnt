import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { saveUserProfile } from "../../utils/userProfile";

const CREATOR_STEPS = [
  {
    key: "niche",
    question: "What kind of content do you create?",
    options: ["Fitness", "Finance", "Comedy", "Fashion", "Food", "Tech", "Travel", "Business", "Lifestyle", "Other"],
  },
  {
    key: "platform",
    question: "Which platform is your main focus?",
    options: ["Instagram", "YouTube", "TikTok", "LinkedIn", "All"],
  },
  {
    key: "followers",
    question: "How many followers do you have right now?",
    options: ["Under 1K", "1K–10K", "10K–50K", "50K–100K", "100K–500K", "500K+"],
  },
  {
    key: "challenge",
    question: "What's your biggest challenge right now?",
    options: ["Getting more views", "Growing followers", "Brand deals", "Content ideas", "Going viral", "Monetising"],
  },
];

const BRAND_STEPS = [
  {
    key: "company",
    question: "What's your company or brand name?",
    placeholder: "e.g. Zepto, boAt, Wakefit",
    isText: true,
  },
  {
    key: "industry",
    question: "What industry are you in?",
    options: ["D2C / E-commerce", "SaaS / Tech", "Food & Beverage", "Fashion", "Health & Wellness", "Finance", "Education", "Other"],
  },
  {
    key: "competitors",
    question: "Who are your main competitors?",
    placeholder: "e.g. Blinkit, Swiggy Instamart (comma separated)",
    isText: true,
  },
  {
    key: "budget",
    question: "What's your monthly marketing budget?",
    options: ["Under ₹1L", "₹1–5L", "₹5–20L", "₹20–50L", "₹50L+", "Prefer not to say"],
  },
];

export default function ProfileSetup({ userType, userName }) {
  const navigate  = useNavigate();
  const isCreator = userType !== "company";
  const steps     = isCreator ? CREATOR_STEPS : BRAND_STEPS;
  const accent    = isCreator ? "#2dd668" : "#a78bfa";
  const accentRgba = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";

  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState({});
  const [textVal, setTextVal] = useState("");

  const current = steps[step];
  const progress = ((step) / steps.length) * 100;
  const name = userName?.split(" ")[0] || "there";

  function handleSelect(value) {
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    advance(next);
  }

  function handleTextNext() {
    if (!textVal.trim()) { advance(answers); return; }
    const next = { ...answers, [current.key]: textVal.trim() };
    setAnswers(next);
    setTextVal("");
    advance(next);
  }

  function handleSkip() {
    if (step < steps.length - 1) {
      setTextVal("");
      setStep(s => s + 1);
    } else {
      finish(answers);
    }
  }

  function advance(ans) {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      finish(ans);
    }
  }

  function finish(ans) {
    saveUserProfile({ ...ans, name: localStorage.getItem("userName") || "" });
    localStorage.setItem("corex_profile_done", "true");
    navigate("/app/dashboard", { replace: true });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ background: isCreator ? "#080c09" : "#06040f" }}>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-10">
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 13, color: `${accentRgba}0.7)`, fontFamily: "var(--font-body)", fontWeight: 600 }}>
            Step {step + 1} of {steps.length}
          </span>
          <button onClick={() => { localStorage.setItem("corex_skip_profile", "true"); navigate("/app/dashboard", { replace: true }); }}
            style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
            Skip all →
          </button>
        </div>
        <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${accent}, ${accentRgba}0.6))` }}/>
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md">

          {step === 0 && (
            <p style={{ fontSize: 13, color: `${accentRgba}0.6)`, fontFamily: "var(--font-body)", marginBottom: 4 }}>
              Hey {name} 👋
            </p>
          )}

          <h2 style={{ fontSize: "clamp(20px, 3vw, 26px)", fontFamily: "var(--font-display)", fontWeight: 700, color: "#f0faf2", lineHeight: 1.3, marginBottom: 28 }}>
            {current.question}
          </h2>

          {/* Option buttons */}
          {!current.isText && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {current.options.map(opt => (
                <motion.button key={opt}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(opt)}
                  style={{
                    padding: "14px 16px", borderRadius: 14, textAlign: "left", fontSize: 14,
                    fontFamily: "var(--font-body)", fontWeight: 500,
                    background: answers[current.key] === opt ? `${accentRgba}0.12)` : "rgba(255,255,255,0.04)",
                    border: answers[current.key] === opt ? `1px solid ${accentRgba}0.4)` : "1px solid rgba(255,255,255,0.08)",
                    color: answers[current.key] === opt ? accent : "rgba(255,255,255,0.7)",
                    cursor: "none", transition: "all 0.18s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${accentRgba}0.07)`; e.currentTarget.style.color = "#f0faf2"; }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = answers[current.key] === opt ? `${accentRgba}0.12)` : "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = answers[current.key] === opt ? accent : "rgba(255,255,255,0.7)";
                  }}>
                  {opt}
                </motion.button>
              ))}
            </div>
          )}

          {/* Text input */}
          {current.isText && (
            <div>
              <input
                autoFocus
                type="text"
                value={textVal}
                onChange={e => setTextVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleTextNext()}
                placeholder={current.placeholder || "Type your answer..."}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14, fontSize: 15,
                  fontFamily: "var(--font-body)", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", color: "#f0faf2",
                  caretColor: accent, outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={e => e.currentTarget.style.borderColor = `${accentRgba}0.5)`}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              <div className="flex gap-3 mt-4">
                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={handleTextNext}
                  style={{
                    flex: 1, padding: "13px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                    background: `linear-gradient(135deg, ${isCreator ? "#1a7a3c,#2dd668" : "#7c3aed,#a78bfa"})`,
                    color: isCreator ? "#050a06" : "#fff", border: "none", cursor: "none", fontFamily: "var(--font-body)",
                  }}>
                  Continue →
                </motion.button>
                <button onClick={handleSkip}
                  style={{
                    padding: "13px 16px", borderRadius: 12, fontSize: 13, fontFamily: "var(--font-body)",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)", cursor: "none",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Skip for option questions */}
          {!current.isText && (
            <button onClick={handleSkip}
              style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
              Skip for now →
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
