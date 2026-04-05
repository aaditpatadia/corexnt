import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Tooltip, Filler,
} from "chart.js";
import { parseResponse, shouldShowChart, stripMarkdown } from "../utils/parseResponse";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Filler);

/* ── Save report to localStorage ── */
function saveReport(content, title) {
  try {
    const existing = JSON.parse(localStorage.getItem("corex_reports") || "[]");
    const EMOJIS = ["📊","📈","🎯","💡","🚀","🛡️","🔍","💼","📋","⚡"];
    const emoji  = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    localStorage.setItem("corex_reports", JSON.stringify([
      ...existing,
      { id:Date.now(), savedAt:Date.now(), title: title || "COREX Response", content, emoji },
    ]));
    return true;
  } catch { return false; }
}

/* ── Chart builder ── */
function buildChartData(graphData, type = "bar", isCreator = true) {
  const color = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";
  const data = {
    labels: graphData.labels,
    datasets: [{
      data: graphData.values,
      ...(type === "bar"
        ? { backgroundColor:`${color}0.75)`, borderRadius:5, borderSkipped:false }
        : {
            borderColor: isCreator ? "#2dd668" : "#a78bfa",
            borderWidth:2.5,
            pointBackgroundColor: isCreator ? "#2dd668" : "#a78bfa",
            pointRadius:4,
            fill:true,
            backgroundColor:`${color}0.08)`,
            tension:0.4,
          }
      ),
    }],
  };
  const options = {
    responsive:true, maintainAspectRatio:false,
    animation:{ duration:700 },
    plugins:{
      legend:{ display:false },
      tooltip:{
        backgroundColor:"rgba(5,10,6,0.95)", borderColor:`${color}0.3)`, borderWidth:1,
        titleColor:"#f0faf2", bodyColor:"rgba(240,250,242,0.7)", padding:10,
      },
    },
    scales:{
      x:{
        grid:{ color:`${color}0.06)` },
        ticks:{ color:"rgba(240,250,242,0.35)", font:{ size:11, family:"var(--font-body)" } },
        border:{ color:"transparent" },
      },
      y:{ display:false },
    },
  };
  return { data, options };
}

/* ── User bubble ── */
function UserBubble({ message, userType }) {
  const { content, files = [] } = message;
  const isCreator = userType !== "company";
  const bubbleBg  = isCreator ? "rgba(45,214,104,0.1)" : "rgba(124,58,237,0.1)";
  const bubbleBdr = isCreator ? "rgba(45,214,104,0.18)" : "rgba(124,58,237,0.18)";

  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="flex justify-end">
      <div style={{ maxWidth:"70%" }} className="space-y-2">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-end">
            {files.map((f, i) => f.preview
              ? <img key={i} src={f.preview} alt={f.name} className="w-16 h-16 rounded-2xl object-cover"/>
              : (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
                  style={{ background:bubbleBg, border:`1px solid ${bubbleBdr}`, color:"rgba(240,250,242,0.7)", fontFamily:"var(--font-body)" }}>
                  📎 {f.name}
                </div>
              )
            )}
          </div>
        )}
        {content && (
          <div className="px-4 py-3 text-sm leading-relaxed"
            style={{ background:bubbleBg, border:`1px solid ${bubbleBdr}`, color:"rgba(255,255,255,0.9)", fontFamily:"var(--font-body)", borderRadius:"18px 18px 4px 18px" }}>
            {content}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── COREX assistant response — clean, minimal, no heavy card ── */
export default function ResponseCard({ message, onChip, onRegenerate, animate=false, userType="creator" }) {
  const { role } = message;
  const isCreator = userType !== "company";
  const [chartType, setChartType] = useState("bar");
  const [copied,    setCopied]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [hovered,   setHovered]   = useState(false);

  if (role === "user") return <UserBubble message={message} userType={userType}/>;

  const parsed = parseResponse(message.content);
  const { title, cleanBody, steps, example, graphData, chips } = parsed;

  // Only show chart if data is meaningful and from explicit GRAPH_DATA
  const showChart = shouldShowChart(graphData);

  const displayText = stripMarkdown(cleanBody || "");

  const copy = () => {
    const parts = [title, displayText, steps.map((s,i) => `${i+1}. ${s}`).join("\n"), example ? `Example: ${example}` : ""].filter(Boolean);
    navigator.clipboard.writeText(parts.join("\n\n")).catch(()=>{});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const accentColor = isCreator ? "#2dd668" : "#a78bfa";
  const accentRgba  = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";

  return (
    <motion.div
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.35, ease:[0.16,1,0.3,1] }}
      className="w-full"
      style={{ maxWidth:"75%" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>

      {/* Corex label */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{ background:`${accentRgba}0.12)`, border:`1px solid ${accentRgba}0.25)` }}>
          <svg width="10" height="10" viewBox="0 0 32 32" fill="none">
            <path d="M8 16c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={accentColor} strokeWidth="3" strokeLinecap="round"/>
            <circle cx="16" cy="21" r="4" fill={accentColor}/>
          </svg>
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest"
          style={{ color:`${accentRgba}0.65)`, fontFamily:"var(--font-body)" }}>Corex</span>
      </div>

      {/* Title */}
      {title && (
        <h3 className="text-base font-bold mb-2 leading-snug"
          style={{ fontFamily:"var(--font-body)", color:"rgba(255,255,255,0.92)" }}>
          {title}
        </h3>
      )}

      {/* Body text — clean prose */}
      {displayText && (
        <div className={`text-sm leading-relaxed mb-3 whitespace-pre-wrap ${message.streaming && !message.streaming_done ? "typing-cursor" : ""}`}
          style={{ color:"rgba(255,255,255,0.75)", fontFamily:"var(--font-body)", lineHeight:1.75 }}>
          {displayText}
        </div>
      )}

      {/* Chart — ONLY when shouldShowChart returns true */}
      {showChart && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="mb-4 rounded-2xl overflow-hidden"
          style={{ background:"rgba(5,10,6,0.6)", border:`1px solid ${accentRgba}0.1)`, height:180, padding:"12px" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1 p-0.5 rounded-lg" style={{ background:`${accentRgba}0.06)`, border:`1px solid ${accentRgba}0.1)` }}>
              {["bar","line"].map(t => (
                <button key={t} onClick={() => setChartType(t)}
                  className="px-2 py-0.5 rounded-md text-xs font-medium transition-all capitalize"
                  style={{
                    background: chartType===t ? `${accentRgba}0.18)` : "transparent",
                    color:      chartType===t ? accentColor : "rgba(240,250,242,0.35)",
                    fontFamily:"var(--font-body)",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height:128 }}>
            {(() => { const { data, options } = buildChartData(graphData, chartType, isCreator);
              return chartType === "bar"
                ? <Bar  data={data} options={options}/>
                : <Line data={data} options={options}/>;
            })()}
          </div>
        </motion.div>
      )}

      {/* Action steps */}
      {steps.length > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.05 }} className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:`${accentRgba}0.5)`, fontFamily:"var(--font-body)" }}>
            Action Steps
          </p>
          <div className="space-y-1.5">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm" style={{ color:"rgba(255,255,255,0.7)", fontFamily:"var(--font-body)" }}>
                <span className="flex-shrink-0 text-xs font-bold mt-0.5" style={{ color:accentColor }}>
                  {i + 1}.
                </span>
                <span className="leading-relaxed">{stripMarkdown(s)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Real Example */}
      {example && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
          className="mb-3 px-3 py-2.5 rounded-xl text-sm leading-relaxed"
          style={{ background:`${accentRgba}0.04)`, borderLeft:`2px solid ${accentRgba}0.3)`, color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>
          <span className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color:`${accentRgba}0.5)`, fontFamily:"var(--font-body)" }}>Real Example</span>
          {stripMarkdown(example)}
        </motion.div>
      )}

      {/* Follow-up chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {chips.map((chip, i) => (
            <button key={i} onClick={() => onChip?.(chip)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 chip-hover"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.55)", fontFamily:"var(--font-body)" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="rgba(255,255,255,0.85)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color="rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; }}>
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Action buttons — only on hover, very small and muted */}
      <AnimatePresence>
        {hovered && !message.streaming && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.15 }}
            className="flex items-center gap-1">
            {[
              {
                label: copied ? "Copied" : "Copy",
                onClick: copy,
                icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
              },
              {
                label:"Redo",
                onClick: onRegenerate,
                icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
              },
              {
                label: saved ? "Saved" : "Save",
                onClick: () => { if (!saved) { saveReport(message.content, title); setSaved(true); } },
                icon:<svg width="11" height="11" viewBox="0 0 24 24" fill={saved?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
              },
            ].map(({ label, onClick, icon }) => (
              <button key={label} onClick={onClick}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all"
                style={{ color:"rgba(255,255,255,0.25)", fontFamily:"var(--font-body)" }}
                onMouseEnter={e=>{ e.currentTarget.style.color="rgba(255,255,255,0.6)"; e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.color="rgba(255,255,255,0.25)"; e.currentTarget.style.background="transparent"; }}>
                {icon}{label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
