import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ResponseCard from "../../components/ResponseCard";
import { deductCredits, getCredits, CREDIT_COSTS } from "../../utils/credits";
import { generateResponsePDF } from "../../utils/generatePDF";

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG        = "#000000";
const CARD_BG   = "#111111";
const CARD_BORDER = "1px solid rgba(255,255,255,0.07)";
const INPUT_STYLE = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#ffffff",
  borderRadius: 12,
  fontFamily: "'Instrument Sans', sans-serif",
  fontSize: 14,
  outline: "none",
  width: "100%",
  padding: "12px 16px",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease",
};
const LABEL_STYLE = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)",
  fontFamily: "'Instrument Sans', sans-serif",
  marginBottom: 8,
};
const PRIMARY_BTN = {
  background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
  color: "#000000",
  border: "none",
  borderRadius: 100,
  padding: "14px 32px",
  fontSize: 15,
  fontWeight: 700,
  fontFamily: "'Instrument Sans', sans-serif",
  cursor: "pointer",
  width: "100%",
  transition: "opacity 0.2s ease, transform 0.15s ease",
};
const SECONDARY_BTN = {
  background: "transparent",
  color: "rgba(255,255,255,0.6)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 100,
  padding: "13px 28px",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "'Instrument Sans', sans-serif",
  cursor: "pointer",
  transition: "border-color 0.2s ease, color 0.2s ease",
};

// ── Options ────────────────────────────────────────────────────────────────────
const INDUSTRIES = [
  "D2C", "Fashion", "Food & Bev", "Tech/SaaS",
  "Health & Wellness", "Finance", "Education",
  "Content Creator", "Other",
];
const BRIEF_TYPES = [
  "Product Launch", "Campaign", "Content Strategy",
  "Brand Positioning", "Influencer Strategy",
  "Shoot/Creative Direction", "Other",
];
const GOALS = ["Awareness", "Conversions", "Engagement", "Brand Love", "Sales"];
const BUDGETS = [
  "Under ₹50K", "₹50K–2L", "₹2L–10L", "₹10L+", "Not sure",
];

// ── Loading phrases ────────────────────────────────────────────────────────────
const LOADING_PHRASES = [
  "Studying your market position…",
  "Mapping the Indian consumer landscape…",
  "Crafting your campaign concept…",
  "Building your message architecture…",
  "Selecting the right creators…",
  "Calculating channel strategy…",
  "Writing your 30-day content calendar…",
  "Sharpening your KPIs…",
  "Finalising your first move…",
];

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepDots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => {
        const active  = i === current;
        const done    = i < current;
        return (
          <motion.div
            key={i}
            animate={{ width: active ? 28 : 8, opacity: done ? 0.5 : 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: 8,
              borderRadius: 100,
              background: active
                ? "linear-gradient(135deg, #226FF7, #9CFCAF)"
                : done
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(255,255,255,0.12)",
            }}
          />
        );
      })}
    </div>
  );
}

// ── Reusable field wrapper ─────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ ...LABEL_STYLE, color: error ? "rgba(248,113,113,0.8)" : "rgba(255,255,255,0.4)" }}>
        {label}
        {error && <span style={{ marginLeft: 8, fontWeight: 400, letterSpacing: 0, textTransform: "none", fontSize: 12 }}>— {error}</span>}
      </label>
      {children}
    </div>
  );
}

// ── Styled select ──────────────────────────────────────────────────────────────
function Select({ value, onChange, options, error }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        ...INPUT_STYLE,
        borderColor: error ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        paddingRight: 36,
        cursor: "pointer",
      }}
    >
      <option value="" disabled style={{ background: "#111" }}>Select…</option>
      {options.map(o => (
        <option key={o} value={o} style={{ background: "#111", color: "#fff" }}>{o}</option>
      ))}
    </select>
  );
}

// ── Styled text input ──────────────────────────────────────────────────────────
function TextInput({ value, onChange, placeholder, error, multiline }) {
  const style = {
    ...INPUT_STYLE,
    borderColor: error ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)",
    resize: "none",
    minHeight: multiline ? 96 : undefined,
    lineHeight: 1.6,
  };

  const focusStyle = { borderColor: "rgba(255,255,255,0.3)" };
  const blurStyle  = { borderColor: error ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)" };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        style={style}
        onFocus={e => Object.assign(e.target.style, focusStyle)}
        onBlur={e => Object.assign(e.target.style, blurStyle)}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={style}
      onFocus={e => Object.assign(e.target.style, focusStyle)}
      onBlur={e => Object.assign(e.target.style, blurStyle)}
    />
  );
}

// ── Radio group ────────────────────────────────────────────────────────────────
function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <motion.button
            key={opt}
            onClick={() => onChange(opt)}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: "10px 20px",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Instrument Sans', sans-serif",
              cursor: "pointer",
              border: active
                ? "1px solid rgba(156,252,175,0.5)"
                : "1px solid rgba(255,255,255,0.1)",
              background: active
                ? "rgba(156,252,175,0.08)"
                : "rgba(255,255,255,0.03)",
              color: active ? "#9CFCAF" : "rgba(255,255,255,0.55)",
              transition: "all 0.18s ease",
            }}
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Loading animation ──────────────────────────────────────────────────────────
function LoadingState() {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx(i => (i + 1) % LOADING_PHRASES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 32px",
        background: CARD_BG,
        border: CARD_BORDER,
        borderRadius: 20,
        textAlign: "center",
        gap: 24,
      }}
    >
      {/* Animated ring */}
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "#9CFCAF",
            borderRightColor: "#6BC3CE",
          }}
        />
        <div style={{
          position: "absolute",
          inset: 8,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(34,111,247,0.15), rgba(156,252,175,0.1))",
        }} />
      </div>

      <div>
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          fontFamily: "'Instrument Sans', sans-serif",
          marginBottom: 10,
        }}>
          COREX is working
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            style={{
              fontSize: 17,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.75)",
              fontFamily: "'Instrument Serif', serif",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {LOADING_PHRASES[phraseIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p style={{
        fontSize: 12,
        color: "rgba(255,255,255,0.2)",
        fontFamily: "'Instrument Sans', sans-serif",
        margin: 0,
      }}>
        Building your complete brief — this takes a moment
      </p>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function BriefBuilder() {
  const [step, setStep]     = useState(0); // 0-2 = wizard, 3 = loading/result
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [creditError, setCreditError] = useState(false);
  const [errors,  setErrors]  = useState({});

  // Form state
  const [form, setForm] = useState({
    // Step 1
    brandName:   typeof window !== "undefined" ? (localStorage.getItem("corex_brand_name") || "") : "",
    industry:    "",
    briefType:   "",
    // Step 2
    audience:    "",
    goal:        "",
    budget:      "",
    // Step 3
    different:   "",
    challenge:   "",
    references:  "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Validation per step ──────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.brandName.trim()) e.brandName = "Required";
      if (!form.industry)         e.industry  = "Required";
      if (!form.briefType)        e.briefType = "Required";
    } else if (step === 1) {
      if (!form.audience.trim())  e.audience  = "Required";
      if (!form.goal)             e.goal      = "Required";
      if (!form.budget)           e.budget    = "Required";
    } else if (step === 2) {
      if (!form.different.trim()) e.different = "Required";
      if (!form.challenge.trim()) e.challenge = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < 2) {
      setStep(s => s + 1);
      setErrors({});
    } else {
      submit();
    }
  };

  const back = () => {
    if (step > 0) {
      setStep(s => s - 1);
      setErrors({});
    }
  };

  const reset = () => {
    setStep(0);
    setResult(null);
    setCreditError(false);
    setErrors({});
    setLoading(false);
    setForm({
      brandName:  typeof window !== "undefined" ? (localStorage.getItem("corex_brand_name") || "") : "",
      industry:   "",
      briefType:  "",
      audience:   "",
      goal:       "",
      budget:     "",
      different:  "",
      challenge:  "",
      references: "",
    });
  };

  // ── API call ─────────────────────────────────────────────────────────────────
  const submit = async () => {
    const cost = CREDIT_COSTS.campaign_brief;
    const credits = getCredits();
    if (credits < cost) {
      setCreditError(true);
      setStep(3);
      return;
    }

    setStep(3);
    setLoading(true);
    setResult(null);

    const prompt = `Generate a complete, ready-to-execute campaign brief for ${form.brandName} in ${form.industry}.
Brief type: ${form.briefType}
Audience: ${form.audience}
Goal: ${form.goal}
Budget: ${form.budget}
What makes them different: ${form.different}
Current challenge: ${form.challenge}
References: ${form.references || "None specified"}

Generate the FULL brief now — do not ask for more information. Include:
1. Campaign concept and big idea (1 powerful sentence)
2. Message architecture: hero message + 3 supporting messages
3. Channel strategy: which platforms + why + budget split in rupees
4. Content calendar: 30-day plan with specific content types and posting frequency
5. Influencer strategy: tier recommendation + specific named Indian creators with follower counts and why them
6. Creative direction: visual mood, colour palette, tone, reference campaigns
7. KPIs: 3 measurable targets with specific numbers
8. First move: what to do in the next 7 days to execute this`;

    try {
      deductCredits(cost);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          userType: "company",
          engineMode: "Narrative",
          conversationTurn: 2,
          plan: localStorage.getItem("corex_plan") || "free",
          profileContext: `Brand: ${form.brandName}. Industry: ${form.industry}. Brief type: ${form.briefType}.`,
        }),
      });

      const contentType = res.headers.get("Content-Type") || "";
      let fullText = "";

      if (contentType.includes("text/event-stream") || contentType.includes("text/plain")) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || "";
                fullText += delta;
              } catch {
                fullText += data;
              }
            }
          }
        }
      } else {
        const json = await res.json();
        fullText = json.reply || json.content || json.message || json.response || "";
      }

      setResult({
        id: Date.now(),
        role: "assistant",
        content: fullText || "Brief generated. Please try again if the content appears empty.",
      });
    } catch {
      setResult({
        id: Date.now(),
        role: "assistant",
        content: "Something went wrong generating your brief. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Step titles ───────────────────────────────────────────────────────────────
  const STEP_TITLES = [
    "Brand basics",
    "Audience & goal",
    "Your edge",
  ];

  const STEP_SUBTITLES = [
    "Tell us who you are and what this brief is for",
    "Who are you talking to, and what do you want from them?",
    "What makes your brand worth paying attention to?",
  ];

  const slideVariants = {
    initial: (dir) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
    animate: { opacity: 1, x: 0 },
    exit:    (dir) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => { setDirection(1); next(); };
  const goBack = () => { setDirection(-1); back(); };

  // ── Result view ───────────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div style={{ background: BG, minHeight: "100vh", padding: "0 0 80px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 32 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 14px", borderRadius: 100, marginBottom: 16,
              background: "rgba(156,252,175,0.07)",
              border: "1px solid rgba(156,252,175,0.2)",
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", color: "#9CFCAF",
                fontFamily: "'Instrument Sans', sans-serif",
              }}>
                Brief Builder
              </span>
            </div>
            <h1 style={{
              fontSize: 26,
              fontStyle: "italic",
              color: "#ffffff",
              fontFamily: "'Instrument Serif', serif",
              lineHeight: 1.25,
              margin: "0 0 6px",
            }}>
              {loading ? "Building your brief…" : `Your ${form.briefType} brief`}
            </h1>
            {!loading && result && (
              <p style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.4)",
                fontFamily: "'Instrument Sans', sans-serif",
                margin: 0,
              }}>
                {form.brandName} · {form.industry}
              </p>
            )}
          </motion.div>

          {/* Loading state */}
          {loading && <LoadingState />}

          {/* Credit error */}
          {!loading && creditError && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "24px",
                background: "rgba(248,113,113,0.06)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 20,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              <p style={{
                fontSize: 28, marginBottom: 12,
              }}>✦</p>
              <p style={{
                fontSize: 16, fontWeight: 700,
                color: "rgba(248,113,113,0.9)",
                fontFamily: "'Instrument Sans', sans-serif",
                marginBottom: 8,
              }}>
                Not enough credits
              </p>
              <p style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                fontFamily: "'Instrument Sans', sans-serif",
                marginBottom: 0,
              }}>
                Brief generation costs {CREDIT_COSTS.campaign_brief} credits. You have {getCredits()}.
                Top up from the Credits page to continue.
              </p>
            </motion.div>
          )}

          {/* Result */}
          {!loading && result && !creditError && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ResponseCard
                message={result}
                userType="company"
                onChip={() => {}}
                onRegenerate={submit}
              />
            </motion.div>
          )}

          {/* Action buttons after result */}
          {!loading && (result || creditError) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}
            >
              <button
                onClick={reset}
                style={{
                  ...SECONDARY_BTN,
                  flex: "1 1 auto",
                  padding: "13px 20px",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }}
              >
                Start a new brief
              </button>

              {result && !creditError && (
                <button
                  onClick={() => {
                    generateResponsePDF({
                      title: `${form.briefType} Brief — ${form.brandName}`,
                      body: result.content,
                      actionSteps: [],
                      realExample: "",
                      graphData: null,
                      chartImage: null,
                    });
                  }}
                  style={{
                    ...PRIMARY_BTN,
                    flex: "1 1 auto",
                    padding: "13px 20px",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  Download PDF
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ── Wizard steps 0–2 ──────────────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: "100vh", padding: "0 0 80px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 100, marginBottom: 16,
            background: "rgba(156,252,175,0.07)",
            border: "1px solid rgba(156,252,175,0.2)",
          }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", color: "#9CFCAF",
              fontFamily: "'Instrument Sans', sans-serif",
            }}>
              Brief Builder
            </span>
          </div>
          <h1 style={{
            fontSize: 28,
            color: "#ffffff",
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
            margin: "0 0 8px",
          }}>
            Build a campaign brief
          </h1>
          <p style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'Instrument Sans', sans-serif",
            margin: 0,
            lineHeight: 1.6,
          }}>
            Answer 3 quick steps — COREX builds the full brief.
            Costs {CREDIT_COSTS.campaign_brief} credits.
          </p>
        </motion.div>

        {/* Step dots */}
        <StepDots current={step} total={3} />

        {/* Step card */}
        <div style={{
          background: CARD_BG,
          border: CARD_BORDER,
          borderRadius: 20,
          padding: "28px 24px",
          overflow: "hidden",
          position: "relative",
        }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Step header */}
              <div style={{ marginBottom: 24 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: "2px", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)",
                  fontFamily: "'Instrument Sans', sans-serif",
                  marginBottom: 6,
                }}>
                  Step {step + 1} of 3
                </p>
                <h2 style={{
                  fontSize: 22,
                  fontStyle: "italic",
                  color: "#ffffff",
                  fontFamily: "'Instrument Serif', serif",
                  lineHeight: 1.25,
                  margin: "0 0 6px",
                }}>
                  {STEP_TITLES[step]}
                </h2>
                <p style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "'Instrument Sans', sans-serif",
                  margin: 0,
                }}>
                  {STEP_SUBTITLES[step]}
                </p>
              </div>

              {/* ── Step 1: Brand basics ── */}
              {step === 0 && (
                <div>
                  <Field label="Brand / Product name" error={errors.brandName}>
                    <TextInput
                      value={form.brandName}
                      onChange={v => set("brandName", v)}
                      placeholder="e.g. MamaEarth, Zouk, Bombay Shaving Company"
                      error={errors.brandName}
                    />
                  </Field>

                  <Field label="Industry" error={errors.industry}>
                    <Select
                      value={form.industry}
                      onChange={v => set("industry", v)}
                      options={INDUSTRIES}
                      error={errors.industry}
                    />
                  </Field>

                  <Field label="This brief is for" error={errors.briefType}>
                    <Select
                      value={form.briefType}
                      onChange={v => set("briefType", v)}
                      options={BRIEF_TYPES}
                      error={errors.briefType}
                    />
                  </Field>
                </div>
              )}

              {/* ── Step 2: Audience & goal ── */}
              {step === 1 && (
                <div>
                  <Field label="Primary audience" error={errors.audience}>
                    <TextInput
                      value={form.audience}
                      onChange={v => set("audience", v)}
                      placeholder="e.g. Women 22–35, tier 1 cities, fitness-conscious"
                      error={errors.audience}
                    />
                  </Field>

                  <Field label="Main goal" error={errors.goal}>
                    <RadioGroup
                      options={GOALS}
                      value={form.goal}
                      onChange={v => set("goal", v)}
                    />
                    {errors.goal && (
                      <p style={{
                        fontSize: 12, color: "rgba(248,113,113,0.8)",
                        fontFamily: "'Instrument Sans', sans-serif",
                        margin: "6px 0 0",
                      }}>
                        Please select a goal
                      </p>
                    )}
                  </Field>

                  <Field label="Budget range" error={errors.budget}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {BUDGETS.map(b => {
                        const active = form.budget === b;
                        return (
                          <motion.button
                            key={b}
                            onClick={() => set("budget", b)}
                            whileTap={{ scale: 0.96 }}
                            style={{
                              padding: "10px 18px",
                              borderRadius: 100,
                              fontSize: 14,
                              fontWeight: 600,
                              fontFamily: "'Instrument Sans', sans-serif",
                              cursor: "pointer",
                              border: active
                                ? "1px solid rgba(255,234,113,0.5)"
                                : "1px solid rgba(255,255,255,0.1)",
                              background: active
                                ? "rgba(255,234,113,0.08)"
                                : "rgba(255,255,255,0.03)",
                              color: active ? "#FFEA71" : "rgba(255,255,255,0.55)",
                              transition: "all 0.18s ease",
                            }}
                          >
                            {b}
                          </motion.button>
                        );
                      })}
                    </div>
                    {errors.budget && (
                      <p style={{
                        fontSize: 12, color: "rgba(248,113,113,0.8)",
                        fontFamily: "'Instrument Sans', sans-serif",
                        margin: "6px 0 0",
                      }}>
                        Please select a budget range
                      </p>
                    )}
                  </Field>
                </div>
              )}

              {/* ── Step 3: Insight ── */}
              {step === 2 && (
                <div>
                  <Field label="What makes you different from competitors" error={errors.different}>
                    <TextInput
                      value={form.different}
                      onChange={v => set("different", v)}
                      placeholder="e.g. We use 100% natural ingredients sourced from Himalayan farmers. Our price is 40% lower than Himalaya for similar quality."
                      error={errors.different}
                      multiline
                    />
                  </Field>

                  <Field label="Biggest challenge right now" error={errors.challenge}>
                    <TextInput
                      value={form.challenge}
                      onChange={v => set("challenge", v)}
                      placeholder="e.g. Low brand awareness outside metro cities. Competing with established D2C brands with bigger ad budgets."
                      error={errors.challenge}
                      multiline
                    />
                  </Field>

                  <Field label="Reference brands or campaigns you love (optional)">
                    <TextInput
                      value={form.references}
                      onChange={v => set("references", v)}
                      placeholder="e.g. boAt's 'Ignite' campaign, Nykaa's influencer strategy, Swiggy's meme-forward content"
                    />
                  </Field>

                  {/* Credit cost reminder */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px", borderRadius: 12,
                    background: "rgba(156,252,175,0.04)",
                    border: "1px solid rgba(156,252,175,0.12)",
                    marginTop: 4,
                  }}>
                    <span style={{ fontSize: 14 }}>✦</span>
                    <p style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "'Instrument Sans', sans-serif",
                      margin: 0,
                      lineHeight: 1.5,
                    }}>
                      Generating this brief costs{" "}
                      <span style={{ color: "rgba(156,252,175,0.7)", fontWeight: 700 }}>
                        {CREDIT_COSTS.campaign_brief} credits
                      </span>
                      . You currently have{" "}
                      <span style={{ color: getCredits() >= CREDIT_COSTS.campaign_brief ? "rgba(156,252,175,0.7)" : "rgba(248,113,113,0.8)", fontWeight: 700 }}>
                        {getCredits()}
                      </span>{" "}
                      credits.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div style={{
          display: "flex", gap: 12, marginTop: 16,
          flexDirection: step === 0 ? "row-reverse" : "row",
        }}>
          {step > 0 && (
            <button
              onClick={goBack}
              style={{ ...SECONDARY_BTN, flex: "0 0 auto", padding: "14px 24px" }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
            >
              ← Back
            </button>
          )}

          <motion.button
            onClick={goNext}
            whileTap={{ scale: 0.98 }}
            style={{ ...PRIMARY_BTN, flex: 1 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            {step < 2 ? `Continue →` : `Generate brief — ${CREDIT_COSTS.campaign_brief} credits`}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
