import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT = "'Instrument Sans', sans-serif";
const SERIF = "'Instrument Serif', serif";

const CARDS = [
  {
    id: "reel",
    icon: "🎬",
    title: "Reel Script",
    desc: "Write a full reel script with 3 hook options, timed script, caption, and hashtags.",
    credits: 5,
    fields: [
      { key: "topic", label: "What's the reel about?", type: "textarea", placeholder: "e.g. Skincare routine for oily skin, 60 second format" },
      { key: "niche", label: "Your niche", type: "text", placeholder: "e.g. Skincare, Finance, Fashion" },
      { key: "tone", label: "Tone", type: "pills", options: ["Educational", "Entertaining", "Inspiring", "Controversial", "Behind-scenes"] },
    ],
    buildPrompt: (d) =>
      `Write a full reel script for a creator in the ${d.niche || "content"} niche.\n\nTopic: ${d.topic}\nTone: ${d.tone || "Entertaining"}\n\nReturn:\n- 3 hook options (first 3 seconds each)\n- Full timed script (mark every 5-10 seconds)\n- Caption (under 150 chars)\n- 5 hashtags\n- One CTA for the end\n\nMake it specific. Real. Not generic.`,
  },
  {
    id: "audit",
    icon: "◎",
    title: "Growth Audit",
    desc: "Find exactly what's broken in your content and get a 7-day fix plan.",
    credits: 6,
    fields: [
      { key: "handle", label: "Your handle or describe your content", type: "textarea", placeholder: "e.g. @yourhandle — I post finance tips, 45K followers, mostly reels" },
      { key: "frequency", label: "Current posting frequency", type: "text", placeholder: "e.g. 3x per week" },
      { key: "problem", label: "Biggest problem", type: "pills", options: ["Low views", "Low followers", "Low engagement", "No brand deals", "Other"] },
    ],
    buildPrompt: (d) =>
      `Run a growth audit for this creator:\n\n${d.handle}\nPosting frequency: ${d.frequency || "not specified"}\nBiggest problem: ${d.problem || "general"}\n\nReturn:\n1. Root cause of the main problem (be specific, not generic)\n2. 3 things to stop doing immediately\n3. 3 things to start doing this week\n4. 7-day execution plan with daily tasks\n5. One metric to track as success signal\n\nBe a real creative consultant, not a life coach.`,
  },
  {
    id: "pricer",
    icon: "⚡",
    title: "Brand Deal Pricer",
    desc: "Get your exact rate card for every deliverable.",
    credits: 3,
    fields: [
      { key: "followers", label: "Followers", type: "text", placeholder: "e.g. 45000" },
      { key: "platform", label: "Platform", type: "pills", options: ["Instagram", "YouTube", "LinkedIn", "TikTok"] },
      { key: "niche", label: "Niche", type: "text", placeholder: "e.g. Finance, Fashion, Food" },
      { key: "engagement", label: "Engagement rate % (optional)", type: "text", placeholder: "e.g. 4.2" },
    ],
    buildPrompt: (d) =>
      `Generate a complete rate card for a ${d.platform || "Instagram"} creator.\n\nFollowers: ${d.followers}\nNiche: ${d.niche || "general"}\nEngagement: ${d.engagement ? d.engagement + "%" : "average"}\n\nReturn rates in INR for:\n- Static post\n- Reel\n- Story set (3 stories)\n- YouTube integration (if applicable)\n- Full campaign (30 days)\n- Whitelisting/usage rights\n\nAlso: what brands in this niche typically pay, and 2 tips to negotiate higher rates. All numbers in rupees.`,
  },
  {
    id: "pitch",
    icon: "✦",
    title: "Pitch Email Writer",
    desc: "Write a pitch that brands actually reply to.",
    credits: 3,
    fields: [
      { key: "creator", label: "Your creator name and niche", type: "text", placeholder: "e.g. Priya Shah, skincare creator, 85K Instagram" },
      { key: "brand", label: "Brand you're pitching to", type: "text", placeholder: "e.g. Minimalist, Dot & Key, Plum" },
      { key: "offer", label: "What you want to offer", type: "textarea", placeholder: "e.g. 2 reels + 3 stories, 30-day exclusivity, full usage rights" },
    ],
    buildPrompt: (d) =>
      `Write a brand pitch email from ${d.creator || "a creator"} to ${d.brand || "a brand"}.\n\nOffer: ${d.offer}\n\nThe email should:\n- Subject line that gets opened\n- Opening that proves you know the brand (not generic)\n- Your value prop in 2 sentences with numbers\n- Specific collaboration idea\n- Clear call to action\n- Professional but human tone\n\nNot a template. A real pitch that works.`,
  },
];

function FieldInput({ field, value, onChange }) {
  if (field.type === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
          fontFamily: FONT, background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)", color: "#ffffff",
          outline: "none", resize: "vertical", boxSizing: "border-box", caretColor: "#9CFCAF",
        }}
      />
    );
  }
  if (field.type === "text") {
    return (
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14,
          fontFamily: FONT, background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)", color: "#ffffff",
          outline: "none", boxSizing: "border-box", caretColor: "#9CFCAF",
        }}
      />
    );
  }
  if (field.type === "pills") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {field.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? "" : opt)}
            style={{
              padding: "6px 14px", borderRadius: 100, fontSize: 13, fontFamily: FONT,
              fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
              background: value === opt ? "rgba(156,252,175,0.12)" : "rgba(255,255,255,0.04)",
              border: value === opt ? "1px solid rgba(156,252,175,0.4)" : "1px solid rgba(255,255,255,0.1)",
              color: value === opt ? "#9CFCAF" : "rgba(255,255,255,0.6)",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }
  return null;
}

export default function CreatorEngine() {
  const [activeCard, setActiveCard] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleCardClick = (card) => {
    if (activeCard?.id === card.id) { setActiveCard(null); return; }
    setActiveCard(card);
    setFormData({});
    setResult("");
    setError("");
  };

  const handleGenerate = async (card) => {
    const credits = parseInt(localStorage.getItem("corex_credits") || "0");
    if (credits < card.credits) {
      setError(`You need ${card.credits} credits for this. Top up to continue.`);
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    localStorage.setItem("corex_credits", String(credits - card.credits));

    const prompt = card.buildPrompt(formData);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          userType: "creator",
          conversationTurn: 2,
          userName: localStorage.getItem("corex_user_name") || "",
          brandName: localStorage.getItem("corex_brand_name") || "",
        }),
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") break;
              try {
                const json = JSON.parse(data);
                if (json.delta) { fullText += json.delta; setResult(fullText); }
                else if (json.reply) { fullText = json.reply; setResult(json.reply); }
              } catch { /* skip */ }
            }
          }
        }
      }

      // Save to history
      try {
        const history = JSON.parse(localStorage.getItem("corex_history") || "[]");
        const firstVal = Object.values(formData)[0]?.toString().slice(0, 30) || "";
        history.unshift({
          id: Date.now(),
          title: `${card.title}: ${firstVal}`,
          messages: [
            { role: "user", content: prompt },
            { role: "assistant", content: fullText },
          ],
          ts: Date.now(),
          type: "creator-engine",
        });
        localStorage.setItem("corex_history", JSON.stringify(history.slice(0, 50)));
      } catch { /* silent */ }

    } catch {
      setError("Something went wrong. Please try again.");
      localStorage.setItem(
        "corex_credits",
        String(parseInt(localStorage.getItem("corex_credits") || "0") + card.credits)
      );
    }

    setLoading(false);
  };

  return (
    <div
      className="page-enter"
      style={{ flex: 1, overflowY: "auto", padding: "40px 32px", maxWidth: 720, margin: "0 auto", width: "100%" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <span
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 100,
            padding: "4px 14px",
            fontSize: 12,
            fontFamily: FONT,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 16,
          }}
        >
          ✦ Creator Engine
        </span>
        <h1
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 36,
            color: "#ffffff",
            margin: "0 0 8px 0",
            fontWeight: 400,
          }}
        >
          Creator Engine
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 15, color: "rgba(255,255,255,0.45)", margin: 0 }}>
          Scripts, hooks, audits, and deals. Built for creators who move fast.
        </p>
      </div>

      {/* Cards 2x2 grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}
      >
        {CARDS.map((card) => (
          <div key={card.id}>
            <motion.div
              whileHover={{ translateY: -2 }}
              onClick={() => handleCardClick(card)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: activeCard?.id === card.id
                  ? "1px solid rgba(156,252,175,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 20,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              {/* Gradient top accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: "linear-gradient(90deg, #226FF7, #9CFCAF)",
                }}
              />
              <div style={{ fontSize: 22, marginBottom: 10 }}>{card.icon}</div>
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: "#ffffff", margin: "0 0 6px 0" }}>
                {card.title}
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                {card.desc}
              </p>
              <span style={{ fontSize: 12, fontFamily: FONT, color: "rgba(255,255,255,0.3)" }}>
                ⚡ {card.credits} credits
              </span>
            </motion.div>

            {/* Expanded form */}
            <AnimatePresence>
              {activeCard?.id === card.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderTop: "none",
                      borderRadius: "0 0 16px 16px",
                      padding: 20,
                    }}
                  >
                    {card.fields.map((field) => (
                      <div key={field.key} style={{ marginBottom: 16 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11,
                            fontFamily: FONT,
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.4)",
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            marginBottom: 8,
                          }}
                        >
                          {field.label}
                        </label>
                        <FieldInput
                          field={field}
                          value={formData[field.key]}
                          onChange={(val) => setFormData((prev) => ({ ...prev, [field.key]: val }))}
                        />
                      </div>
                    ))}

                    {error && (
                      <p style={{ color: "#f87171", fontFamily: FONT, fontSize: 13, marginBottom: 12 }}>{error}</p>
                    )}

                    <motion.button
                      whileHover={{ translateY: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGenerate(card)}
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 10,
                        fontSize: 14,
                        fontFamily: FONT,
                        fontWeight: 600,
                        background: loading
                          ? "rgba(255,255,255,0.05)"
                          : "linear-gradient(135deg, #226FF7, #9CFCAF)",
                        color: loading ? "rgba(255,255,255,0.3)" : "#000",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {loading ? "Generating…" : `Generate ${card.title} →`}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 28,
              fontFamily: FONT,
              fontSize: 14,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
            }}
          >
            {result}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
