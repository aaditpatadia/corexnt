import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const userType = () => localStorage.getItem("userType") || "creator";

async function fetchTrends(uType, signal) {
  const prompt = uType === "company"
    ? `Search for the top 5 trending content formats and marketing strategies this week for brands and businesses. For each trend: what it is, why it's working right now, and a ready-to-use campaign concept.`
    : `Search for the top 5 trending content formats and topics this week for content creators on Instagram, YouTube, and TikTok. For each trend: what it is, why it's working, and a ready-to-use reel concept with hook.`;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: prompt }], userType: uType, engineMode: "Trend" }),
    signal,
  });
  if (!res.ok) throw new Error("Failed");
  const d = await res.json();
  return d.reply || "";
}

function parseTrends(raw) {
  const cleaned = raw
    .replace(/\*\*/g, "").replace(/^#{1,6}\s*/gm, "")
    .replace(/GRAPH_DATA:[\s\S]*$/m, "").replace(/Chips:.*$/m, "").trim();
  const parts = cleaned.split(/(?=\b[1-5]\.\s)/);
  return parts
    .filter(p => /^[1-5]\.\s/.test(p.trim()))
    .map((p, i) => {
      const lines = p.trim().split("\n").filter(Boolean);
      const title = lines[0].replace(/^[1-5]\.\s*/, "").trim();
      const body  = lines.slice(1).join(" ").trim();
      const EMOJIS = ["🔥", "⚡", "🎯", "🚀", "💡"];
      return { title, body, emoji: EMOJIS[i] || "✨" };
    })
    .slice(0, 5);
}

function TrendCard({ trend, i, onUse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: "#ffffff", border: "1px solid #e8e8e3", borderRadius: 20, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", transition: "all 0.2s ease" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8e6d4"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,122,60,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e3"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "#e8f5ee", border: "1px solid #c8e6d4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
          {trend.emoji}
        </div>
        <div>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#1a7a3c", fontFamily: "var(--font-body)" }}>Trend {i + 1}</span>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", fontFamily: "var(--font-body)", lineHeight: 1.35, marginTop: 3 }}>{trend.title}</h3>
        </div>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: "#555555", fontFamily: "var(--font-body)", marginBottom: 16 }}>
        {trend.body.slice(0, 220)}{trend.body.length > 220 ? "…" : ""}
      </p>
      <button onClick={() => onUse(trend)}
        style={{ padding: "8px 18px", borderRadius: 100, fontSize: 13, fontWeight: 600, background: "#1a7a3c", color: "#ffffff", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", transition: "background 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.background = "#145f2f"}
        onMouseLeave={e => e.currentTarget.style.background = "#1a7a3c"}>
        Use this trend →
      </button>
    </motion.div>
  );
}

export default function TrendEngine() {
  const navigate = useNavigate();
  const ut = userType();
  const [trends,  setTrends]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [rawText, setRawText] = useState("");
  const [error,   setError]   = useState("");

  const load = async () => {
    setLoading(true); setError(""); setTrends([]);
    const controller = new AbortController();
    try {
      const raw    = await fetchTrends(ut, controller.signal);
      setRawText(raw);
      const parsed = parseTrends(raw);
      setTrends(parsed.length > 0 ? parsed : []);
    } catch (e) {
      if (e.name !== "AbortError") setError("Failed to load trends. Try again.");
    }
    setLoading(false);
    return () => controller.abort();
  };

  useEffect(() => { load(); }, []);

  const useTrend = (trend) => {
    const prompt = `Help me use this trending content format: "${trend.title}". ${trend.body} Give me a complete, ready-to-execute plan for using this trend in my content right now.`;
    sessionStorage.setItem("corex_prefill", prompt);
    navigate("/app/chat");
  };

  return (
    <div className="h-full overflow-y-auto scroll-area" style={{ background: "#f0f0eb" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 24px 48px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600, background: "#fff0f0", border: "1px solid rgba(244,63,94,0.3)", color: "#e11d48", fontFamily: "var(--font-body)" }}>
              🔥 Trend Engine
            </div>
            <button onClick={load} disabled={loading}
              style={{ padding: "7px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600, background: "#e8f5ee", border: "1px solid #c8e6d4", color: loading ? "#888888" : "#1a7a3c", cursor: loading ? "default" : "pointer", fontFamily: "var(--font-body)", transition: "all 0.2s" }}>
              {loading ? "Searching…" : "↻ Refresh"}
            </button>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, color: "#1a1a1a", marginBottom: 6 }}>What's trending right now</h1>
          <p style={{ fontSize: 14, color: "#888888", fontFamily: "var(--font-body)" }}>Live trending content formats. Click any to get an instant action plan.</p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 20, background: "#ffffff", border: "1px solid #e8e8e3" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#f43f5e" }}
                    animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.85, delay: i * 0.17, repeat: Infinity }}/>
                ))}
              </div>
              <span style={{ fontSize: 13, color: "#555555", fontFamily: "var(--font-body)" }}>Searching for this week's top trends…</span>
            </div>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 120, borderRadius: 20, background: "#e8e8e3", animation: "pulse 1.5s ease-in-out infinite" }}/>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontSize: 14, color: "#888888", fontFamily: "var(--font-body)", marginBottom: 16 }}>{error}</p>
            <button onClick={load} style={{ padding: "10px 24px", borderRadius: 100, fontSize: 13, fontWeight: 600, background: "#1a7a3c", color: "#ffffff", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}>
              Try again
            </button>
          </div>
        )}

        {/* Trend cards */}
        {!loading && trends.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {trends.map((t, i) => <TrendCard key={i} trend={t} i={i} onUse={useTrend}/>)}
          </div>
        )}

        {/* Fallback raw */}
        {!loading && !error && trends.length === 0 && rawText && (
          <div style={{ background: "#ffffff", border: "1px solid #e8e8e3", borderRadius: 20, padding: 20 }}>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#555555", fontFamily: "var(--font-body)", whiteSpace: "pre-wrap" }}>
              {rawText.replace(/\*\*/g, "").replace(/^#{1,6}\s*/gm, "").trim()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
