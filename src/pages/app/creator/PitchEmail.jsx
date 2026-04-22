import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const FONT = "'Instrument Sans', sans-serif";
const SERIF = "'Instrument Serif', serif";

function cleanResult(text) {
  return (text || "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^#{1,4}\s+/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/—/g, "-")
    .replace(/–/g, "-")
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

export default function PitchEmail() {
  const navigate = useNavigate();
  const [creator, setCreator] = useState(localStorage.getItem("corex_user_name") || "");
  const [brand, setBrand] = useState("");
  const [offer, setOffer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brand.trim() || !offer.trim()) { setError("Enter the brand name and what you're offering."); return; }
    const credits = parseInt(localStorage.getItem("corex_credits") || "0");
    if (credits < 3) { setError("You need at least 3 credits."); return; }
    setLoading(true); setError(""); setResult("");
    localStorage.setItem("corex_credits", String(credits - 3));

    const prompt = `Write a brand pitch email from ${creator || "a creator"} to ${brand}.

What they're offering: ${offer}

Return EXACTLY this structure:

📧 SUBJECT LINE:
[subject line that gets opened — specific, not clickbaity]

✉️ EMAIL BODY:

Hi [Name],

[Opening line that proves you've done research on ${brand} — not generic. Reference something real about their brand, recent campaign, or product.]

[Value prop paragraph: who you are, your numbers, why YOUR audience is ${brand}'s audience. Max 3 sentences with real numbers.]

[Specific collab idea: exactly what you'd create, why it fits their current goal, what success looks like. Be specific about deliverables.]

[Rate/timeline mention + next step CTA — make it easy to say yes.]

[Sign-off]

📝 FOLLOW-UP MESSAGE (send if no reply in 5 days):
[Short, direct follow-up that adds new value — not just "bumping this"]

💡 PRO TIPS FOR THIS PITCH:
→ [Specific personalization tip for ${brand}]
→ [Timing or delivery tip]
→ [What to do if they negotiate rate]

YOUR MOVE:
→ Send this email → expect reply in 3-7 days
→ [One thing to add to your Instagram/profile before sending]
→ [One data point to research about ${brand} before hitting send]`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          userType: "creator", conversationTurn: 2,
          userName: localStorage.getItem("corex_user_name") || "",
          brandName: localStorage.getItem("corex_brand_name") || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      const fullText = data.reply || "";
      if (!fullText) throw new Error("No response generated");
      setResult(cleanResult(fullText));
      try {
        const history = JSON.parse(localStorage.getItem("corex_history") || "[]");
        history.unshift({ id: Date.now(), title: `Pitch: ${brand}`, messages: [{ role: "user", content: prompt }, { role: "assistant", content: fullText }], ts: Date.now(), type: "creator-engine" });
        localStorage.setItem("corex_history", JSON.stringify(history.slice(0, 50)));
      } catch { }
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Connection error — check your internet and try again." : (err.message || "Something went wrong. Please try again."));
      localStorage.setItem("corex_credits", String(parseInt(localStorage.getItem("corex_credits") || "0") + 3));
    }
    setLoading(false);
  };

  return (
    <div className="page-enter" style={{ flex: 1, overflowY: "auto", padding: "40px 32px", maxWidth: 680, margin: "0 auto", width: "100%" }}>
      <button onClick={() => navigate("/app/creators")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontFamily: FONT, fontSize: 13, padding: 0, marginBottom: 28, display: "flex", alignItems: "center", gap: 6 }} onMouseEnter={e => e.currentTarget.style.color = "#ffffff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>← Creators</button>
      <div style={{ marginBottom: 32 }}>
        <span style={{ display: "inline-block", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "4px 14px", fontSize: 12, fontFamily: FONT, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>✦ Pitch Email Writer</span>
        <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 34, color: "#ffffff", margin: "0 0 8px 0", fontWeight: 400 }}>Pitches brands reply to.</h1>
        <p style={{ fontFamily: FONT, fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>Not a template. A real pitch, personalized for that brand.</p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit}>
          {[
            { label: "Your name + niche", content: <input type="text" value={creator} onChange={e => setCreator(e.target.value)} placeholder="e.g. Priya Shah, skincare creator, 85K Instagram" style={{ width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14, fontFamily: FONT, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#ffffff", outline: "none", boxSizing: "border-box", caretColor: "#9CFCAF" }} /> },
            { label: "Brand you're pitching *", content: <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Minimalist, Dot & Key, Plum, Sugar Cosmetics" style={{ width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14, fontFamily: FONT, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#ffffff", outline: "none", boxSizing: "border-box", caretColor: "#9CFCAF" }} /> },
            { label: "What you're offering *", content: <textarea value={offer} onChange={e => setOffer(e.target.value)} placeholder="e.g. 2 reels + 3 stories over 30 days, full usage rights, I'll feature their new serum in a before/after transformation reel" rows={3} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14, fontFamily: FONT, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#ffffff", outline: "none", resize: "vertical", boxSizing: "border-box", caretColor: "#9CFCAF" }} /> },
          ].map(({ label, content }) => (
            <div key={label} style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontFamily: FONT, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>{label}</label>
              {content}
            </div>
          ))}
          {error && <p style={{ color: "#f87171", fontFamily: FONT, fontSize: 13, marginBottom: 16 }}>{error}</p>}
          <motion.button type="submit" disabled={loading} whileHover={!loading ? { translateY: -1 } : {}} whileTap={!loading ? { scale: 0.98 } : {}} style={{ width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, fontFamily: FONT, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", background: loading ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #226FF7, #FFEA71)", color: loading ? "rgba(255,255,255,0.3)" : "#000000", border: "none" }}>
            {loading ? "Writing your pitch…" : "Write My Pitch →"}
          </motion.button>
          <p style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 8 }}>⚡ 3 credits</p>
        </form>
      ) : (
        <div>
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
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <motion.button whileHover={{ translateY: -1 }} whileTap={{ scale: 0.98 }} onClick={() => setResult("")} style={{ padding: "10px 20px", borderRadius: 100, fontSize: 13, fontFamily: FONT, fontWeight: 600, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", cursor: "pointer" }}>↺ Write another pitch</motion.button>
            <motion.button whileHover={{ translateY: -1 }} whileTap={{ scale: 0.98 }} onClick={() => { navigator.clipboard.writeText(result).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }} style={{ padding: "10px 20px", borderRadius: 100, fontSize: 13, fontFamily: FONT, fontWeight: 600, background: copied ? "rgba(156,252,175,0.1)" : "rgba(255,255,255,0.06)", border: copied ? "1px solid rgba(156,252,175,0.3)" : "1px solid rgba(255,255,255,0.1)", color: copied ? "#9CFCAF" : "#ffffff", cursor: "pointer", transition: "all 0.2s" }}>{copied ? "Copied ✓" : "📋 Copy pitch"}</motion.button>
            <motion.button
              whileHover={{ translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => downloadAsPDF(result, "Pitch Email")}
              style={{ padding: "10px 20px", borderRadius: 100, fontSize: 13, fontFamily: FONT, fontWeight: 600, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", cursor: "pointer" }}
            >
              ↓ Download PDF
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
