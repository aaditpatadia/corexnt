import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Tooltip, Filler,
} from "chart.js";
import { parseResponse } from "../utils/parseResponse";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Filler);

/* ── Chart builder ── */
function buildChartData(graphData, type = "bar") {
  const data = {
    labels: graphData.labels,
    datasets: [{
      data: graphData.values,
      ...(type === "bar"
        ? { backgroundColor:"rgba(45,214,104,0.75)", borderRadius:5, borderSkipped:false }
        : {
            borderColor:"#2dd668", borderWidth:2.5,
            pointBackgroundColor:"#2dd668", pointRadius:4,
            fill:true, backgroundColor:"rgba(45,214,104,0.08)", tension:0.4,
          }
      ),
    }],
  };
  const options = {
    responsive:true, maintainAspectRatio:false,
    animation:{ duration:900 },
    plugins:{
      legend:{ display:false },
      tooltip:{
        backgroundColor:"rgba(5,10,6,0.95)", borderColor:"rgba(45,214,104,0.3)", borderWidth:1,
        titleColor:"#f0faf2", bodyColor:"rgba(240,250,242,0.7)", padding:10,
        callbacks:{
          title: items => items[0].label,
          label: item  => ` ${item.raw}`,
        },
      },
    },
    scales:{
      x:{
        grid:{ color:"rgba(45,214,104,0.05)" },
        ticks:{ color:"rgba(240,250,242,0.4)", font:{ size:11, family:"var(--font-body)" } },
        border:{ color:"transparent" },
      },
      y:{ display:false },
    },
  };
  return { data, options };
}

/* ── Typewriter hook ── */
function useTypewriter(text, speed=12, enabled=true) {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const [done,      setDone]      = useState(!enabled);
  useEffect(() => {
    if (!enabled) { setDisplayed(text); setDone(true); return; }
    setDisplayed(""); setDone(false);
    let pos = 0;
    const id = setInterval(() => {
      pos += 4;
      setDisplayed(text.slice(0, pos));
      if (pos >= text.length) { clearInterval(id); setDisplayed(text); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, enabled]);
  return { displayed, done };
}

/* ── Strip any residual markdown from display strings ── */
function clean(t = "") {
  return t
    .replace(/\*{1,3}([^*]*)\*{1,3}/g, "$1")
    .replace(/\*+/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .trim();
}

/* ── User bubble ── */
function UserBubble({ message }) {
  const { content, files = [] } = message;
  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="flex justify-end">
      <div className="max-w-sm space-y-2">
        {/* File thumbnails */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-end">
            {files.map((f, i) => f.preview
              ? <img key={i} src={f.preview} alt={f.name} className="w-16 h-16 rounded-xl object-cover"/>
              : (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
                  style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"rgba(240,250,242,0.7)", fontFamily:"var(--font-body)" }}>
                  📎 {f.name}
                </div>
              )
            )}
          </div>
        )}
        {content && (
          <div className="px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed"
            style={{ background:"rgba(45,214,104,0.12)", border:"1px solid rgba(45,214,104,0.22)", color:"#f0faf2", fontFamily:"var(--font-body)" }}>
            {content}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main COREX response card ── */
function saveReport(content, title) {
  try {
    const existing = JSON.parse(localStorage.getItem("corex_reports") || "[]");
    const EMOJIS = ["📊","📈","🎯","💡","🚀","🛡️","🔍","💼","📋","⚡"];
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const report = {
      id: Date.now(),
      savedAt: Date.now(),
      title: title || "COREX Response",
      content,
      emoji,
    };
    localStorage.setItem("corex_reports", JSON.stringify([...existing, report]));
    return true;
  } catch { return false; }
}

export default function ResponseCard({ message, onChip, onRegenerate, animate=false }) {
  const { role } = message;
  const [chartType, setChartType] = useState("bar");
  const [copied,    setCopied]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [liked,     setLiked]     = useState(null);
  const [showChart, setShowChart] = useState(!animate);

  if (role === "user") return <UserBubble message={message} />;

  const parsed = parseResponse(message.content);
  const { title, cleanBody, steps, example, graphData, chips, keyMetric } = parsed;

  const { displayed, done } = useTypewriter(clean(cleanBody), 12, animate);
  const bodyText = animate ? displayed : clean(cleanBody);

  useEffect(() => { if (done && animate) setShowChart(true); }, [done, animate]);

  const copy = () => {
    const lines = [
      clean(title),
      clean(cleanBody),
      steps.length > 0 ? steps.map((s,i) => `${i+1}. ${clean(s)}`).join("\n") : "",
      example ? `Example: ${clean(example)}` : "",
    ].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(lines).catch(()=>{});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const { data, options } = graphData
    ? buildChartData(graphData, chartType)
    : { data:null, options:null };

  return (
    <motion.div
      initial={{ opacity:0, y:16 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.45, ease:[0.16,1,0.3,1] }}
      className="w-full">

      {/* COREX label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background:"rgba(45,214,104,0.15)", border:"1px solid rgba(45,214,104,0.3)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
          CX
        </div>
        <span className="text-xs font-bold uppercase tracking-widest"
          style={{ color:"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>COREX</span>
      </div>

      {/* Card */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background:"rgba(14,28,16,0.85)",
          border:"1px solid rgba(45,214,104,0.18)",
          borderLeft:"3px solid #2dd668",
          boxShadow:"0 4px 24px rgba(0,0,0,0.4), -3px 0 20px rgba(45,214,104,0.06)",
        }}>

        {/* Top accent stripe */}
        <div className="h-0.5" style={{ background:"linear-gradient(90deg,#2dd668,rgba(45,214,104,0.2),transparent)" }}/>

        <div className="p-5">

          {/* Title */}
          {title && (
            <h2 className="text-lg font-bold mb-3 leading-snug"
              style={{ fontFamily:"var(--font-body)", color:"#f0faf2" }}>
              {clean(title)}
            </h2>
          )}

          {/* Key metric */}
          {keyMetric && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-4"
              style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)" }}>
              <span className="text-2xl font-extrabold"
                style={{ color:"#2dd668", fontFamily:"var(--font-body)" }}>{keyMetric}</span>
            </div>
          )}

          {/* Body text with typewriter */}
          {bodyText && (
            <div className={`text-sm leading-relaxed mb-4 whitespace-pre-wrap ${animate && !done ? "typing-cursor" : ""}`}
              style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
              {bodyText}
            </div>
          )}

          {/* Action steps */}
          {steps.length > 0 && showChart && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color:"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>
                Action Steps
              </h4>
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.05 }} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background:"rgba(45,214,104,0.12)", border:"1px solid rgba(45,214,104,0.3)" }}>
                      <span className="text-xs font-bold" style={{ color:"#2dd668", fontFamily:"var(--font-body)" }}>{i+1}</span>
                    </div>
                    <p className="text-sm leading-relaxed"
                      style={{ color:"rgba(240,250,242,0.75)", fontFamily:"var(--font-body)" }}>
                      {clean(s)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chart */}
          {showChart && graphData && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color:"rgba(45,214,104,0.6)", fontFamily:"var(--font-body)" }}>
                  {graphData.title || "Performance"}
                </span>
                <div className="flex gap-1 p-0.5 rounded-lg"
                  style={{ background:"rgba(45,214,104,0.06)", border:"1px solid rgba(45,214,104,0.1)" }}>
                  {["bar","line"].map(t => (
                    <button key={t} onClick={() => setChartType(t)}
                      className="px-2.5 py-0.5 rounded-md text-xs font-medium transition-all capitalize"
                      style={{
                        background: chartType===t ? "rgba(45,214,104,0.18)" : "transparent",
                        color:      chartType===t ? "#2dd668" : "rgba(240,250,242,0.4)",
                        fontFamily:"var(--font-body)",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ background:"rgba(5,10,6,0.6)", height:160 }}>
                {chartType === "bar"
                  ? <Bar  data={data} options={options}/>
                  : <Line data={data} options={options}/>
                }
              </div>
            </motion.div>
          )}

          {/* Real Example */}
          {example && showChart && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
              className="mb-4 p-3 rounded-xl text-sm leading-relaxed"
              style={{ background:"rgba(45,214,104,0.04)", border:"1px solid rgba(45,214,104,0.1)", color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
              <span className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                style={{ color:"rgba(45,214,104,0.6)", fontFamily:"var(--font-body)" }}>Real Example</span>
              {clean(example)}
            </motion.div>
          )}

          {/* Follow-up chips */}
          {chips.length > 0 && showChart && (
            <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
              className="flex flex-wrap gap-2 pt-3"
              style={{ borderTop:"1px solid rgba(45,214,104,0.08)" }}>
              {chips.map((chip, i) => (
                <button key={i} onClick={() => onChip?.(chip)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                  style={{ background:"rgba(45,214,104,0.06)", border:"1px solid rgba(45,214,104,0.18)", color:"rgba(240,250,242,0.7)", fontFamily:"var(--font-body)" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(45,214,104,0.15)"; e.currentTarget.style.color="#f0faf2"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="rgba(45,214,104,0.06)"; e.currentTarget.style.color="rgba(240,250,242,0.7)"; }}>
                  {chip}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-1 px-5 py-3"
          style={{ borderTop:"1px solid rgba(45,214,104,0.07)", background:"rgba(5,10,6,0.3)" }}>
          {[
            {
              label: copied ? "Copied!" : "Copy",
              onClick: copy,
              icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
            },
            {
              label:"Regenerate",
              onClick: onRegenerate,
              icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
            },
            {
              label: saved ? "Saved!" : "Save",
              onClick: () => { if (!saved) { saveReport(message.content, title); setSaved(true); } },
              icon:<svg width="12" height="12" viewBox="0 0 24 24" fill={saved?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
            },
          ].map(({ label, onClick, icon }) => (
            <button key={label} onClick={onClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{ color:"rgba(240,250,242,0.4)", fontFamily:"var(--font-body)" }}
              onMouseEnter={e=>{ e.currentTarget.style.color="#f0faf2"; e.currentTarget.style.background="rgba(45,214,104,0.06)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.color="rgba(240,250,242,0.4)"; e.currentTarget.style.background="transparent"; }}>
              {icon}{label}
            </button>
          ))}
          <div className="flex-1"/>
          {/* Thumbs */}
          {[
            { v:"up",   icon:"👍", active:"rgba(45,214,104,0.15)" },
            { v:"down", icon:"👎", active:"rgba(248,113,113,0.15)" },
          ].map(({ v, icon, active }) => (
            <button key={v} onClick={() => setLiked(liked === v ? null : v)}
              className="p-1.5 rounded-lg text-sm transition-all duration-200"
              style={{ background: liked === v ? active : "transparent" }}>
              {icon}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
