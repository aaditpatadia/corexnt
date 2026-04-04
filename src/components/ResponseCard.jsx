import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Tooltip, Filler,
} from "chart.js";
import { parseResponse } from "../utils/parseResponse";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Filler);

/* ── Chart config ── */
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
            fill:true,
            backgroundColor:"rgba(45,214,104,0.08)",
            tension:0.4,
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
        backgroundColor:"rgba(5,10,6,0.95)",
        borderColor:"rgba(45,214,104,0.3)",
        borderWidth:1,
        titleColor:"#f0faf2",
        bodyColor:"rgba(240,250,242,0.7)",
        padding:10,
      },
    },
    scales:{
      x:{
        grid:{ color:"rgba(45,214,104,0.05)" },
        ticks:{ color:"rgba(240,250,242,0.4)", font:{size:11} },
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
  const [done, setDone] = useState(!enabled);
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

/* ── Toast ── */
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity:0, y:30, x:"-50%" }} animate={{ opacity:1, y:0, x:"-50%" }} exit={{ opacity:0, y:20, x:"-50%" }}
      className="fixed bottom-8 left-1/2 z-[9998] px-5 py-3 rounded-2xl text-sm font-medium"
      style={{ background:"rgba(10,20,12,0.97)", border:"1px solid rgba(45,214,104,0.3)", color:"#f0faf2", whiteSpace:"nowrap", boxShadow:"0 8px 40px rgba(0,0,0,0.6)" }}>
      {msg}
    </motion.div>
  );
}

/* ── User bubble ── */
function UserBubble({ content }) {
  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="flex justify-end">
      <div className="max-w-sm px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed"
        style={{ background:"rgba(45,214,104,0.12)", border:"1px solid rgba(45,214,104,0.22)", color:"#f0faf2" }}>
        {content}
      </div>
    </motion.div>
  );
}

/* ── Main COREX card ── */
export default function ResponseCard({ message, onChip, onRegenerate, animate=false }) {
  const { role, content } = message;
  const [chartType, setChartType] = useState("bar");
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null);
  const [toast, setToast] = useState("");
  const [showChart, setShowChart] = useState(!animate);

  if (role === "user") return <UserBubble content={content} />;

  const parsed = parseResponse(content);
  const { title, cleanBody, steps, example, graphData, chips, keyMetric } = parsed;

  // Strip any remaining ** or ## from display text
  const cleanDisplay = (t) => t.replace(/\*\*/g, "").replace(/^##\s*/gm, "").trim();

  const { displayed, done } = useTypewriter(cleanDisplay(cleanBody), 12, animate);
  const bodyText = animate ? displayed : cleanDisplay(cleanBody);

  useEffect(() => { if (done && animate) setShowChart(true); }, [done, animate]);

  const copy = () => {
    const plain = [title, cleanDisplay(cleanBody), steps.map((s,i)=>`${i+1}. ${s}`).join("\n"), example].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(plain);
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };
  const share = () => { setToast("Link copied!"); };

  const chartData = graphData;
  const { data, options } = chartData ? buildChartData(chartData, chartType) : { data:null, options:null };

  return (
    <>
      <motion.div
        initial={{ opacity:0, y:16 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.45, ease:[0.16,1,0.3,1] }}
        className="w-full"
      >
        {/* COREX label */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background:"rgba(45,214,104,0.15)", border:"1px solid rgba(45,214,104,0.3)", color:"#2dd668", fontFamily:"Sora,sans-serif" }}>
            CX
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color:"rgba(45,214,104,0.7)" }}>COREX</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background:"rgba(14,28,16,0.85)",
            borderLeft:"3px solid #2dd668",
            border:"1px solid rgba(45,214,104,0.18)",
            borderLeftWidth:3,
            borderLeftColor:"#2dd668",
            boxShadow:"0 4px 24px rgba(0,0,0,0.4), -3px 0 20px rgba(45,214,104,0.06)",
          }}>

          {/* Top accent */}
          <div className="h-0.5" style={{ background:"linear-gradient(90deg,#2dd668,rgba(45,214,104,0.2),transparent)" }} />

          <div className="p-5">
            {/* Title */}
            <h2 className="text-lg font-bold mb-2 leading-snug" style={{ fontFamily:"Sora,sans-serif", color:"#f0faf2" }}>
              {cleanDisplay(title)}
            </h2>

            {/* Key metric highlight */}
            {keyMetric && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-4"
                style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)" }}>
                <span className="text-2xl font-extrabold" style={{ color:"#2dd668", fontFamily:"Sora,sans-serif" }}>{keyMetric}</span>
              </div>
            )}

            {/* Body text (typewriter) */}
            {bodyText && (
              <div className={`text-sm leading-relaxed mb-4 whitespace-pre-wrap ${animate && !done ? "typing-cursor" : ""}`}
                style={{ color:"var(--text-secondary)" }}>
                {bodyText}
              </div>
            )}

            {/* Action steps */}
            {steps.length > 0 && showChart && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"rgba(45,214,104,0.7)" }}>Action Steps</h4>
                <div className="space-y-2">
                  {steps.map((s, i) => (
                    <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                      className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                        style={{ background:"rgba(45,214,104,0.12)", border:"1px solid rgba(45,214,104,0.3)" }}>
                        <span className="text-xs font-bold" style={{ color:"#2dd668" }}>{i+1}</span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color:"rgba(240,250,242,0.75)" }}>
                        {cleanDisplay(s)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Chart — ALWAYS shown */}
            {showChart && chartData && (
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color:"rgba(45,214,104,0.6)" }}>
                    {chartData.title || "Performance"}
                  </span>
                  <div className="flex gap-1 p-0.5 rounded-lg" style={{ background:"rgba(45,214,104,0.06)", border:"1px solid rgba(45,214,104,0.1)" }}>
                    {["bar","line"].map((t) => (
                      <button key={t} onClick={() => setChartType(t)}
                        className="px-2.5 py-0.5 rounded-md text-xs font-medium transition-all capitalize"
                        style={{ background: chartType===t?"rgba(45,214,104,0.18)":"transparent", color: chartType===t?"#2dd668":"rgba(240,250,242,0.4)" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background:"rgba(5,10,6,0.6)", height:160 }}>
                  {chartType === "bar"
                    ? <Bar data={data} options={options} />
                    : <Line data={data} options={options} />
                  }
                </div>
              </motion.div>
            )}

            {/* Real Example */}
            {example && showChart && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
                className="mb-4 p-3 rounded-xl text-sm leading-relaxed"
                style={{ background:"rgba(45,214,104,0.04)", border:"1px solid rgba(45,214,104,0.1)", color:"var(--text-secondary)" }}>
                <span className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color:"rgba(45,214,104,0.6)" }}>Real Example</span>
                {cleanDisplay(example)}
              </motion.div>
            )}

            {/* Follow-up chips */}
            {chips.length > 0 && showChart && (
              <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
                className="flex flex-wrap gap-2 pt-3"
                style={{ borderTop:"1px solid rgba(45,214,104,0.08)" }}>
                {chips.map((chip, i) => (
                  <button key={i} onClick={() => onChip(chip)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                    style={{ background:"rgba(45,214,104,0.06)", border:"1px solid rgba(45,214,104,0.18)", color:"rgba(240,250,242,0.7)" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background="rgba(45,214,104,0.15)"; e.currentTarget.style.color="#f0faf2"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="rgba(45,214,104,0.06)"; e.currentTarget.style.color="rgba(240,250,242,0.7)"; }}>
                    {chip}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-1 px-5 py-3" style={{ borderTop:"1px solid rgba(45,214,104,0.07)", background:"rgba(5,10,6,0.3)" }}>
            {[
              { label: copied?"Copied!":"Copy", onClick:copy, icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> },
              { label:"Regenerate", onClick:onRegenerate, icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> },
              { label:"Share", onClick:share, icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg> },
            ].map(({label,onClick,icon}) => (
              <button key={label} onClick={onClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{ color:"rgba(240,250,242,0.4)" }}
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
            ].map(({v,icon,active}) => (
              <button key={v} onClick={() => setLiked(liked===v?null:v)}
                className="p-1.5 rounded-lg text-sm transition-all duration-200"
                style={{ background: liked===v ? active : "transparent" }}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>{toast && <Toast msg={toast} onClose={() => setToast("")} />}</AnimatePresence>
    </>
  );
}
