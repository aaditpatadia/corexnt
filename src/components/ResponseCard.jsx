import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Tooltip, Filler,
} from "chart.js";
import { parseResponse, shouldShowChart, stripMarkdown } from "../utils/parseResponse";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Filler);

/* ── Save to reports ── */
function saveReport(content, title) {
  try {
    const existing = JSON.parse(localStorage.getItem("corex_reports") || "[]");
    const EMOJIS   = ["📊","📈","🎯","💡","🚀","🛡️","🔍","💼","📋","⚡"];
    localStorage.setItem("corex_reports", JSON.stringify([
      ...existing,
      { id:Date.now(), savedAt:Date.now(), title:title||"COREX Response", content, emoji:EMOJIS[existing.length%EMOJIS.length] },
    ]));
    return true;
  } catch { return false; }
}

/* ── Chart builder ── */
function buildChart(graphData, type, isCreator) {
  const accent = isCreator ? "#2dd668" : "#a78bfa";
  const accentA = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";
  const data = {
    labels: graphData.labels,
    datasets: [{
      data: graphData.values,
      ...(type === "bar"
        ? { backgroundColor:`${accentA}0.7)`, borderRadius:6, borderSkipped:false }
        : { borderColor:accent, borderWidth:2, pointBackgroundColor:accent, pointRadius:3, fill:true, backgroundColor:`${accentA}0.07)`, tension:0.4 }),
    }],
  };
  const options = {
    responsive:true, maintainAspectRatio:false, animation:{ duration:600 },
    plugins:{ legend:{ display:false }, tooltip:{ backgroundColor:"rgba(5,10,6,0.95)", borderColor:`${accentA}0.25)`, borderWidth:1, titleColor:"#f0faf2", bodyColor:"rgba(240,250,242,0.6)", padding:8 } },
    scales:{
      x:{ grid:{ color:"rgba(255,255,255,0.04)" }, ticks:{ color:"rgba(255,255,255,0.3)", font:{ size:10, family:"var(--font-body)" } }, border:{ color:"transparent" } },
      y:{ display:false },
    },
  };
  return { data, options };
}

/* ── User bubble ── */
function UserBubble({ message }) {
  const { content, files = [] } = message;
  return (
    <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} className="flex justify-end">
      <div style={{ maxWidth:"65%" }} className="space-y-2">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-end">
            {files.map((f, i) => f.preview
              ? <img key={i} src={f.preview} alt={f.name} className="w-14 h-14 rounded-2xl object-cover"/>
              : <div key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs"
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>
                  📎 {f.name}
                </div>
            )}
          </div>
        )}
        {content && (
          <div className="px-4 py-2.5 text-sm leading-relaxed"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.85)", fontFamily:"var(--font-body)", borderRadius:"20px 20px 4px 20px", fontSize:14 }}>
            {content}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Section label ── */
function SectionLabel({ text }) {
  return (
    <p className="mt-4 mb-2" style={{ fontSize:10, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", fontFamily:"var(--font-body)" }}>
      {text}
    </p>
  );
}

/* ── COREX response — clean, no card wrapper ── */
export default function ResponseCard({ message, onChip, onRegenerate, userType = "creator" }) {
  const { role } = message;
  const isCreator   = userType !== "company";
  const accentColor = isCreator ? "#2dd668" : "#a78bfa";
  const accentRgba  = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";

  const [chartType, setChartType] = useState("bar");
  const [copied,    setCopied]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [hovered,   setHovered]   = useState(false);

  if (role === "user") return <UserBubble message={message}/>;

  const { title, cleanBody, steps, example, graphData, chips } = parseResponse(message.content);
  const showChart = shouldShowChart(graphData);
  const bodyText  = stripMarkdown(cleanBody || "");

  const copy = () => {
    const parts = [title, bodyText,
      steps.length ? "Action Steps:\n" + steps.map((s,i)=>`${i+1}. ${s}`).join("\n") : "",
      example ? "Real Example:\n" + example : "",
    ].filter(Boolean);
    navigator.clipboard.writeText(parts.join("\n\n")).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.3, ease:[0.16,1,0.3,1] }}
      className="w-full"
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}>

      {/* COREX label */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="w-4 h-4 rounded flex items-center justify-center"
          style={{ background:`${accentRgba}0.12)` }}>
          <svg width="9" height="9" viewBox="0 0 32 32" fill="none">
            <path d="M8 16c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round"/>
            <circle cx="16" cy="21" r="4" fill={accentColor}/>
          </svg>
        </div>
        <span style={{ fontSize:10, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase", color:accentColor, fontFamily:"var(--font-body)" }}>
          COREX
        </span>
      </div>

      {/* Title */}
      {title && (
        <h3 style={{ fontSize:16, fontWeight:700, color:"rgba(255,255,255,0.92)", fontFamily:"var(--font-body)", lineHeight:1.35, marginBottom:10 }}>
          {title}
        </h3>
      )}

      {/* Body paragraphs — split on double newline for proper paragraph spacing */}
      {bodyText && (
        <div style={{ fontSize:15, lineHeight:1.75, color:"rgba(255,255,255,0.78)", fontFamily:"var(--font-body)" }}>
          {bodyText.split(/\n\n+/).map((para, i) => (
            para.trim() && <p key={i} style={{ marginBottom:12 }}>{para.trim()}</p>
          ))}
        </div>
      )}

      {/* Chart */}
      {showChart && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
          className="my-4 rounded-xl overflow-hidden"
          style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", padding:"14px 14px 10px" }}>
          <div className="flex items-center justify-end mb-2">
            <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background:"rgba(255,255,255,0.04)" }}>
              {["bar","line"].map(t => (
                <button key={t} onClick={()=>setChartType(t)}
                  className="px-2 py-0.5 rounded text-xs capitalize transition-all"
                  style={{ background:chartType===t?`${accentRgba}0.15)`:"transparent", color:chartType===t?accentColor:"rgba(255,255,255,0.3)", fontFamily:"var(--font-body)" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height:140 }}>
            {(()=>{ const {data,options}=buildChart(graphData,chartType,isCreator);
              return chartType==="bar"?<Bar data={data} options={options}/>:<Line data={data} options={options}/>;
            })()}
          </div>
        </motion.div>
      )}

      {/* Action steps */}
      {steps.length > 0 && (
        <div>
          <SectionLabel text="Action Steps"/>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:14, color:"rgba(255,255,255,0.72)", fontFamily:"var(--font-body)", lineHeight:1.6 }}>
                <span style={{ flexShrink:0, fontWeight:700, color:accentColor, fontSize:13, marginTop:2 }}>{i+1}.</span>
                <span>{stripMarkdown(s)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real example */}
      {example && (
        <div>
          <SectionLabel text="Real Example"/>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)", lineHeight:1.65, paddingLeft:12, borderLeft:`2px solid ${accentRgba}0.3)` }}>
            {stripMarkdown(example)}
          </p>
        </div>
      )}

      {/* Follow-up chips */}
      {chips.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:14 }}>
          {chips.map((chip, i) => (
            <button key={i} onClick={()=>onChip?.(chip)}
              style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontFamily:"var(--font-body)", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.55)", cursor:"none", transition:"all 0.18s ease" }}
              onMouseEnter={e=>{ e.currentTarget.style.background=`${accentRgba}0.08)`; e.currentTarget.style.borderColor=`${accentRgba}0.2)`; e.currentTarget.style.color="rgba(255,255,255,0.85)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="rgba(255,255,255,0.55)"; }}>
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Hover action buttons */}
      <AnimatePresence>
        {hovered && !message.streaming && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.12 }}
            style={{ display:"flex", gap:4, marginTop:8 }}>
            {[
              { label:copied?"Copied":"Copy",    onClick:copy },
              { label:"Redo",                    onClick:onRegenerate },
              { label:saved?"Saved":"Save",      onClick:()=>{ if(!saved){ saveReport(message.content,title); setSaved(true); } } },
            ].map(({ label, onClick })=>(
              <button key={label} onClick={onClick}
                style={{ fontSize:11, fontFamily:"var(--font-body)", color:"rgba(255,255,255,0.22)", padding:"2px 8px", borderRadius:6, background:"transparent", border:"none", cursor:"none", transition:"color 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.55)"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.22)"}>
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
