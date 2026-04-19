import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const FONT = "'Instrument Sans', sans-serif";
const SERIF = "'Instrument Serif', serif";

const CREDITS_COST = 5;

function cleanResult(text) {
  return (text || "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .replace(/^---+$/gm, "")
    .trim();
}

function downloadAsPDF(text, title) {
  const doc = new jsPDF();
  const margin = 20;
  const maxWidth = 170;
  const lineHeight = 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text(title, margin, margin);

  doc.setFontSize(11);
  let y = margin + 12;

  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

function Pill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "7px 16px",
        borderRadius: 100,
        fontSize: 13,
        fontFamily: FONT,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s",
        background: selected ? "rgba(156,252,175,0.12)" : "rgba(255,255,255,0.04)",
        border: selected
          ? "1px solid rgba(156,252,175,0.4)"
          : "1px solid rgba(255,255,255,0.1)",
        color: selected ? "#9CFCAF" : "rgba(255,255,255,0.6)",
      }}
    >
      {label}
    </button>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  fontSize: 14,
  fontFamily: FONT,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#ffffff",
  outline: "none",
  boxSizing: "border-box",
  caretColor: "#9CFCAF",
};

function Label({ children }) {
  return (
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
      {children}
    </label>
  );
}

export default function ReelScript() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [duration, setDuration] = useState("");
  const [tone, setTone] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const credits = parseInt(localStorage.getItem("corex_credits") || "0");
    if (credits < CREDITS_COST) {
      setError(`You need ${CREDITS_COST} credits for this. Top up to continue.`);
      return;
    }

    setLoading(true);
    localStorage.setItem("corex_credits", String(credits - CREDITS_COST));

    const prompt = `Write a full reel script for a ${niche || "content"} creator.\n\nTopic: ${topic}\nDuration: ${duration || "30s"}\nTone: ${tone || "Entertaining"}\n\nReturn:\n- 3 hook options (first 3 seconds each)\n- Full timed script (mark every ${duration === "60s" ? "10" : duration === "15s" ? "3" : "5"} seconds)\n- Caption under 150 chars\n- 5 hashtags\n- One strong CTA for the end\n\nBe specific, punchy, and platform-native. Not generic.`;

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

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "API error");
      const fullText = data.reply || "";
      if (!fullText) throw new Error("No response generated");
      setResult(cleanResult(fullText));

      // Save to history
      try {
        const history = JSON.parse(localStorage.getItem("corex_history") || "[]");
        history.unshift({
          id: Date.now(),
          title: `Reel Script: ${topic.slice(0, 30)}`,
          messages: [
            { role: "user", content: prompt },
            { role: "assistant", content: fullText },
          ],
          ts: Date.now(),
          type: "creator-engine",
        });
        localStorage.setItem("corex_history", JSON.stringify(history.slice(0, 50)));
      } catch { /* silent */ }

    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Connection error — check your internet and try again." : (err.message || "Something went wrong. Please try again."));
      localStorage.setItem("corex_credits", String(parseInt(localStorage.getItem("corex_credits") || "0") + CREDITS_COST));
    }

    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).catch(() => {});
  };

  const handleStartOver = () => {
    setResult("");
    setError("");
    setTopic("");
    setNiche("");
    setDuration("");
    setTone("");
  };

  return (
    <div
      className="page-enter"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "40px 32px",
        maxWidth: 680,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate("/app/creator-engine")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: FONT,
          fontSize: 13,
          color: "rgba(255,255,255,0.4)",
          padding: "0 0 28px 0",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
      >
        ← Creator Engine
      </button>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
        <h1
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 32,
            color: "#ffffff",
            margin: "0 0 8px 0",
            fontWeight: 400,
          }}
        >
          Reel Script Generator
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>
          3 hooks. Full script. Caption. Done.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            {/* Topic */}
            <div>
              <Label>What's the reel about?</Label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Skincare routine for oily skin, 60 second format"
                rows={3}
                required
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Niche */}
            <div>
              <Label>Your niche</Label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Skincare, Finance, Fashion"
                style={inputStyle}
              />
            </div>

            {/* Duration */}
            <div>
              <Label>Duration</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["15s", "30s", "60s"].map((d) => (
                  <Pill
                    key={d}
                    label={d}
                    selected={duration === d}
                    onClick={() => setDuration(duration === d ? "" : d)}
                  />
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <Label>Tone</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Educational", "Entertaining", "Inspiring", "Controversial", "Behind-scenes"].map((t) => (
                  <Pill
                    key={t}
                    label={t}
                    selected={tone === t}
                    onClick={() => setTone(tone === t ? "" : t)}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p style={{ color: "#f87171", fontFamily: FONT, fontSize: 13, margin: 0 }}>{error}</p>
            )}

            <motion.button
              whileHover={{ translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                padding: "13px",
                borderRadius: 12,
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
              {loading ? "Generating…" : `Generate Script — ${CREDITS_COST} credits →`}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Editable output */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontFamily: FONT, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase" }}>
                  ✏️ Editable — make it yours
                </span>
              </div>
              <textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 420,
                  padding: "20px 22px",
                  borderRadius: 16,
                  fontSize: 15,
                  fontFamily: FONT,
                  lineHeight: 1.8,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.9)",
                  resize: "vertical",
                  outline: "none",
                  caretColor: "#9CFCAF",
                  boxSizing: "border-box",
                  whiteSpace: "pre-wrap",
                  overflowY: "auto",
                }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <motion.button
                whileHover={{ translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: FONT,
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Copy result
              </motion.button>
              <motion.button
                whileHover={{ translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => downloadAsPDF(result, "Reel Script")}
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
                ↓ Download PDF
              </motion.button>
              <motion.button
                whileHover={{ translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartOver}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: FONT,
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Start over
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
