import { useState } from "react";
import { motion } from "framer-motion";

const FONT = "'Instrument Sans', sans-serif";
const SERIF = "'Instrument Serif', serif";

const SHOOT_TYPES = [
  "Product Launch", "Lookbook", "Campaign", "Reel",
  "Editorial", "Event", "Food", "Architecture", "Fashion", "Other",
];
const BUDGETS = ["Under ₹10K", "₹10–25K", "₹25–50K", "₹50K+"];
const PLATFORMS = ["Instagram Reels", "YouTube", "Website Hero", "Print", "TikTok", "LinkedIn"];

function Pill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "7px 16px", borderRadius: 100, fontSize: 13, fontFamily: FONT,
        fontWeight: 500, cursor: "pointer", transition: "all 0.18s",
        background: selected ? "rgba(156,252,175,0.12)" : "rgba(255,255,255,0.04)",
        border: selected ? "1px solid rgba(156,252,175,0.4)" : "1px solid rgba(255,255,255,0.1)",
        color: selected ? "#9CFCAF" : "rgba(255,255,255,0.6)",
      }}
    >
      {label}
    </button>
  );
}

export default function ShootPlanner() {
  const [shootType, setShootType] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const togglePlatform = (p) =>
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shootType || !description.trim()) {
      setError("Please select a shoot type and describe your shoot.");
      return;
    }

    const currentCredits = parseInt(localStorage.getItem("corex_credits") || "0");
    if (currentCredits < 5) {
      setError("You need at least 5 credits to plan a shoot. Top up to continue.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    // Deduct credits upfront
    localStorage.setItem("corex_credits", String(currentCredits - 5));

    const prompt = `Generate a complete professional shoot brief for the following:

Shoot type: ${shootType}
Description: ${description}
Budget: ${budget || "Not specified"}
Platforms: ${platforms.length ? platforms.join(", ") : "Not specified"}

Return in this EXACT structure:

SHOOT BRIEF: [title]

SHOT LIST:
List every shot with: Shot name | Framing | Movement | Notes. Include hero shots, detail shots, lifestyle shots, BTS shots. Minimum 8 shots.

MOOD & DIRECTION:
Color palette: [specific colors]
Lighting: [specific lighting direction]
References: [5 specific Pinterest search terms]
Wardrobe: [if applicable]
Overall feel: [one powerful sentence]

VISUAL DIRECTION:
[One sentence written for a photographer/director. Specific. Evocative. Professional.]

LOGISTICS:
Equipment needed: [list]
Props: [list]
Location requirements: [list]
Team needed: [solo / 2-person / full crew]
Timing: [breakdown of the shoot day]

DELIVERABLES:
Formats to capture: [list]
Final selects target: [number]
Post-production direction: [brief notes]

Be specific. Be professional. Think like a creative director who has planned 200 shoots.`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          userType: "brand",
          conversationTurn: 2,
          userName: localStorage.getItem("corex_user_name") || "",
          brandName: localStorage.getItem("corex_brand_name") || "",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "API error");
      const fullText = data.reply || "";
      if (!fullText) throw new Error("No response generated");
      setResult(fullText);

      // Save to history
      try {
        const history = JSON.parse(localStorage.getItem("corex_history") || "[]");
        const words = description.trim().split(" ").slice(0, 4).join(" ");
        history.unshift({
          id: Date.now(),
          title: `Shoot: ${words}`,
          messages: [
            { role: "user", content: prompt },
            { role: "assistant", content: fullText },
          ],
          ts: Date.now(),
          type: "shoot-planner",
        });
        localStorage.setItem("corex_history", JSON.stringify(history.slice(0, 50)));
      } catch { /* silent */ }

    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Connection error — check your internet and try again." : (err.message || "Something went wrong. Please try again."));
      // Refund credit
      localStorage.setItem(
        "corex_credits",
        String(parseInt(localStorage.getItem("corex_credits") || "0") + 5)
      );
    }

    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
          📷 Shoot Planner
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
          Plan a perfect shoot.
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 15, color: "rgba(255,255,255,0.45)", margin: 0 }}>
          From brief to shot list in 60 seconds.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit}>
          {/* Shoot type */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: FONT,
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              What are you shooting? *
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SHOOT_TYPES.map((t) => (
                <Pill key={t} label={t} selected={shootType === t} onClick={() => setShootType(t)} />
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: FONT,
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Describe it *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Skincare serum launch for D2C brand, small budget, shooting in an apartment, need reels and a hero image for website"
              rows={3}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                fontSize: 14,
                fontFamily: FONT,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ffffff",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                caretColor: "#9CFCAF",
              }}
            />
          </div>

          {/* Budget */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: FONT,
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Budget Range
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {BUDGETS.map((b) => (
                <Pill key={b} label={b} selected={budget === b} onClick={() => setBudget(budget === b ? "" : b)} />
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div style={{ marginBottom: 32 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: FONT,
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Platforms
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PLATFORMS.map((p) => (
                <Pill
                  key={p}
                  label={p}
                  selected={platforms.includes(p)}
                  onClick={() => togglePlatform(p)}
                />
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color: "#f87171", fontFamily: FONT, fontSize: 13, marginBottom: 16 }}>
              {error}
            </p>
          )}

          <div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { translateY: -1 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                fontSize: 15,
                fontFamily: FONT,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                background: loading
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
                color: loading ? "rgba(255,255,255,0.3)" : "#000000",
                border: "none",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Planning your shoot…" : "Plan my shoot →"}
            </motion.button>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 12,
                color: "rgba(255,255,255,0.3)",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              ⚡ 5 credits
            </p>
          </div>
        </form>
      ) : (
        <div>
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 28,
              marginBottom: 20,
              fontFamily: FONT,
              fontSize: 14,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
            }}
          >
            {result}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setResult(""); setDescription(""); setShootType(""); setBudget(""); setPlatforms([]); }}
              style={{
                padding: "10px 20px",
                borderRadius: 100,
                fontSize: 13,
                fontFamily: FONT,
                fontWeight: 600,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              ↺ Plan another shoot
            </motion.button>
            <motion.button
              whileHover={{ translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopy}
              style={{
                padding: "10px 20px",
                borderRadius: 100,
                fontSize: 13,
                fontFamily: FONT,
                fontWeight: 600,
                background: copied ? "rgba(156,252,175,0.1)" : "rgba(255,255,255,0.06)",
                border: copied ? "1px solid rgba(156,252,175,0.3)" : "1px solid rgba(255,255,255,0.1)",
                color: copied ? "#9CFCAF" : "#ffffff",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {copied ? "Copied ✓" : "📋 Copy brief"}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
