import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const userType = () => localStorage.getItem("userType") || "creator";

async function fetchTrends(uType, signal) {
  const prompt = uType === "company"
    ? `Search for the top 5 trending content formats and marketing strategies this week for brands and businesses. For each trend: what it is, why it's working right now, and a ready-to-use campaign concept.`
    : `Search for the top 5 trending content formats and topics this week for content creators on Instagram, YouTube, and TikTok. For each trend: what it is, why it's working, and a ready-to-use reel concept with hook.`;

  const res = await fetch("/api/chat", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      messages:[{ role:"user", content:prompt }],
      userType: uType,
      engineMode:"Trend",
    }),
    signal,
  });

  if (!res.ok) throw new Error("Failed");
  const contentType = res.headers.get("Content-Type") || "";
  if (contentType.includes("text/event-stream")) {
    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buf = "", full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream:true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") break;
        try { const p = JSON.parse(raw); if (p.delta) full += p.delta; } catch {}
      }
    }
    return full;
  } else {
    const d = await res.json();
    return d.reply || "";
  }
}

function parseTrends(raw) {
  // Split on numbered items 1. 2. 3. 4. 5.
  const cleaned = raw
    .replace(/\*\*/g,"").replace(/^#{1,6}\s*/gm,"").replace(/GRAPH_DATA:[\s\S]*$/m,"").replace(/Chips:.*$/m,"")
    .trim();
  const parts = cleaned.split(/(?=\b[1-5]\.\s)/);
  return parts
    .filter(p => /^[1-5]\.\s/.test(p.trim()))
    .map((p, i) => {
      const lines = p.trim().split("\n").filter(Boolean);
      const title = lines[0].replace(/^[1-5]\.\s*/, "").split("\n")[0].trim();
      const body  = lines.slice(1).join(" ").trim();
      const EMOJIS = ["🔥","⚡","🎯","🚀","💡"];
      return { title, body, emoji: EMOJIS[i] || "✨" };
    })
    .slice(0, 5);
}

function TrendCard({ trend, i, onUse }) {
  return (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: i * 0.1, ease:[0.16,1,0.3,1] }}
      className="rounded-2xl p-5 transition-all duration-200"
      style={{ background:"rgba(14,28,16,0.7)", border:"1px solid rgba(45,214,104,0.15)" }}
      onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(45,214,104,0.35)"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(45,214,104,0.15)"}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.15)" }}>
          {trend.emoji}
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest"
            style={{ color:"rgba(45,214,104,0.6)", fontFamily:"var(--font-body)" }}>Trend {i+1}</span>
          <h3 className="text-sm font-bold leading-snug mt-0.5"
            style={{ color:"#f0faf2", fontFamily:"var(--font-body)" }}>{trend.title}</h3>
        </div>
      </div>
      <p className="text-xs leading-relaxed mb-4"
        style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
        {trend.body.slice(0, 200)}{trend.body.length > 200 ? "…" : ""}
      </p>
      <button onClick={() => onUse(trend)}
        className="px-4 py-2 rounded-xl text-xs font-semibold btn-green transition-all"
        style={{ color:"#050a06", fontFamily:"var(--font-body)" }}>
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
      const raw = await fetchTrends(ut, controller.signal);
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
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.3)", color:"#f43f5e", fontFamily:"var(--font-body)" }}>
              🔥 Trend Engine
            </div>
            <button onClick={load} disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:loading?"var(--text-muted)":"#2dd668", fontFamily:"var(--font-body)" }}>
              {loading ? "Searching…" : "↻ Refresh trends"}
            </button>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily:"var(--font-body)", color:"#f0faf2" }}>
            What's trending right now
          </h1>
          <p className="text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
            Live trending content formats and topics. Click any to get an instant action plan.
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl"
              style={{ background:"rgba(14,28,16,0.6)", border:"1px solid rgba(45,214,104,0.12)" }}>
              <div className="flex gap-1.5">
                {[0,1,2].map(i=>(
                  <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background:"#f43f5e" }}
                    animate={{ y:[0,-6,0], opacity:[0.4,1,0.4] }}
                    transition={{ duration:0.85, delay:i*0.17, repeat:Infinity }}/>
                ))}
              </div>
              <span className="text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
                Searching for this week's top trends…
              </span>
            </div>
            {[1,2,3,4,5].map(i=>(
              <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background:"rgba(14,28,16,0.5)", height:120 }}/>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-sm mb-4" style={{ color:"rgba(240,250,242,0.6)", fontFamily:"var(--font-body)" }}>{error}</p>
            <button onClick={load} className="px-5 py-2.5 rounded-xl text-sm font-semibold btn-green" style={{ color:"#050a06", fontFamily:"var(--font-body)" }}>
              Try again
            </button>
          </div>
        )}

        {/* Trend cards */}
        {!loading && trends.length > 0 && (
          <div className="space-y-4">
            {trends.map((t, i) => (
              <TrendCard key={i} trend={t} i={i} onUse={useTrend} />
            ))}
          </div>
        )}

        {/* Fallback: show raw if no structured trends parsed */}
        {!loading && !error && trends.length === 0 && rawText && (
          <div className="rounded-2xl p-5" style={{ background:"rgba(14,28,16,0.7)", border:"1px solid rgba(45,214,104,0.15)" }}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
              {rawText.replace(/\*\*/g,"").replace(/^#{1,6}\s*/gm,"").trim()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
