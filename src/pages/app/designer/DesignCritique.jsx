import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FONT = "'Instrument Sans', sans-serif";
const SERIF = "'Instrument Serif', serif";
const CREDITS_COST = 5;

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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:image/png;base64,..." — extract the base64 part
      const b64 = reader.result.split(",")[1];
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DesignCritique() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [brief, setBrief] = useState("");
  const [stage, setStage] = useState("Work in Progress");
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const chosen = e.target.files[0];
    if (!chosen) return;
    setFile(chosen);
    // Show preview for image files
    if (chosen.type.startsWith("image/")) {
      const url = URL.createObjectURL(chosen);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please upload a design file to critique.");
      return;
    }

    const credits = parseInt(localStorage.getItem("corex_credits") || "0");
    if (credits < CREDITS_COST) {
      setError(`You need ${CREDITS_COST} credits for this. Top up to continue.`);
      return;
    }

    setLoading(true);
    localStorage.setItem("corex_credits", String(credits - CREDITS_COST));

    const prompt = `Analyze this design work and give a structured critique. Brief: ${brief || "Design work shared for critique"} Stage: ${stage || "Work in Progress"}

Return EXACTLY this structure:

FIRST IMPRESSION (what the design communicates in 3 seconds):
[gut read, emotional response, does it match the brief?]

TECHNICAL ANALYSIS:
Hierarchy: [is the eye led correctly? what's the focal point?]
Balance: [visual weight distribution — is it stable or intentionally dynamic?]
Contrast: [does it work in black and white?]
Spacing: [is there enough breathing room? what's too tight?]
Alignment: [what's off and by how much?]

BRAND FIT SCORE: [X/10]
[How well does this serve the brief? What it gets right. What creates dissonance.]

THE THREE FIXES (most important changes):
1. [Most critical change — what specifically to change and why]
2. [Second most critical]
3. [Third]

WHAT'S WORKING (do not change these):
[Specific elements to preserve in the next iteration]

CLIENT LANGUAGE:
[How to present this design to a client. Rationale for key choices. How to handle anticipated objections.]

Reference real design principles (Gestalt, Swiss Style, etc.) and real Indian/global brand examples where relevant.`;

    try {
      let base64String = null;
      try {
        base64String = await fileToBase64(file);
      } catch {
        throw new Error("Could not read the uploaded file. Please try a different image.");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          files: [{ name: file.name, type: file.type, b64: base64String }],
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
      setResult(fullText);

      // Save to history
      try {
        const history = JSON.parse(localStorage.getItem("corex_history") || "[]");
        history.unshift({
          id: Date.now(),
          title: `Design Critique: ${file.name.slice(0, 30)}`,
          messages: [
            { role: "user", content: prompt },
            { role: "assistant", content: fullText },
          ],
          ts: Date.now(),
          type: "designer-studio",
        });
        localStorage.setItem("corex_history", JSON.stringify(history.slice(0, 50)));
      } catch { /* silent */ }

    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Connection error — check your internet and try again."
          : err.message || "Something went wrong. Please try again."
      );
      // Refund credits on error
      localStorage.setItem(
        "corex_credits",
        String(parseInt(localStorage.getItem("corex_credits") || "0") + CREDITS_COST)
      );
    }

    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Design Critique</title><style>body{font-family:sans-serif;padding:40px;white-space:pre-wrap;line-height:1.7;color:#111;}</style></head><body>${result.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body></html>`);
    win.document.close();
    win.print();
  };

  const handleStartOver = () => {
    setResult("");
    setError("");
    setFile(null);
    setBrief("");
    setStage("Work in Progress");
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        onClick={() => navigate("/app/designer-studio")}
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
        ← Designer Studio
      </button>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>◉</div>
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
          Design Critique
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>
          Upload your design. Get a structured, honest critique — hierarchy, contrast, brand fit, and the three fixes.
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
            {/* File upload */}
            <div>
              <Label>Design file (required)</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "1px dashed rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  padding: "24px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.02)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 8, objectFit: "contain" }}
                  />
                ) : (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                    <p style={{ fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                      {file ? file.name : "Upload your design (JPG, PNG, PDF)"}
                    </p>
                  </>
                )}
                {file && !preview && (
                  <p style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>{file.name}</p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {/* Brief */}
            <div>
              <Label>Brief description</Label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="What was the brief? What's this for?"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Stage */}
            <div>
              <Label>Stage of work</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Early Concept", "Work in Progress", "Almost Final"].map((s) => (
                  <Pill
                    key={s}
                    label={s}
                    selected={stage === s}
                    onClick={() => setStage(s)}
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
                  : "linear-gradient(135deg, #FFEA71, #226FF7)",
                color: loading ? "rgba(255,255,255,0.3)" : "#000",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Analysing…" : `Get Critique — ${CREDITS_COST} credits →`}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "28px 28px 24px",
                fontFamily: FONT,
                fontSize: 14,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                marginBottom: 16,
              }}
            >
              {result}
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
                  background: copied ? "rgba(156,252,175,0.12)" : "rgba(255,255,255,0.06)",
                  border: copied ? "1px solid rgba(156,252,175,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  color: copied ? "#9CFCAF" : "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {copied ? "Copied!" : "Copy result"}
              </motion.button>
              <motion.button
                whileHover={{ translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrint}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: FONT,
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Save as PDF
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
