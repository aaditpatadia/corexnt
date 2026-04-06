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
  const accent  = isCreator ? "#2dd668" : "#a78bfa";
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
    <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
      style={{ display:"flex", justifyContent:"flex-end", marginBottom:20 }}>
      <div style={{ maxWidth:"65%" }}>
        {files.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"flex-end", marginBottom:6 }}>
            {files.map((f, i) => f.preview
              ? <img key={i} src={f.preview} alt={f.name} style={{ width:56, height:56, borderRadius:16, objectFit:"cover" }}/>
              : <div key={i} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:16, fontSize:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>
                  📎 {f.name}
                </div>
            )}
          </div>
        )}
        {content && (
          <div style={{
            background:"#ffffff", border:"1px solid #e0e0e0",
            borderRadius:"20px 20px 4px 20px", padding:"12px 18px",
            fontSize:16, color:"#1a1a1a", lineHeight:1.6,
            fontFamily:"var(--font-body)",
          }}>
            {content}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── COREX response ── */
export default function ResponseCard({ message, onChip, onRegenerate, userType = "creator" }) {
  const { role, searchUsed } = message;
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
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.3, ease:[0.16,1,0.3,1] }}
      style={{ display:"flex", flexDirection:"column", marginBottom:28 }}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}>

      {/* COREX label */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <span style={{ fontSize:11, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase", color:"#1a7a3c", fontFamily:"var(--font-body)" }}>
          COREX
        </span>
        {searchUsed && (
          <span style={{ fontSize:10, fontWeight:600, color:"#2dd668", background:"rgba(45,214,104,0.1)", border:"1px solid rgba(45,214,104,0.2)", borderRadius:20, padding:"1px 7px", fontFamily:"var(--font-body)", letterSpacing:"0.5px" }}>
            ● Live data
          </span>
        )}
      </div>

      {/* Title */}
      {title && (
        <h3 style={{ fontSize:17, fontWeight:700, color:"#1a1a1a", fontFamily:"var(--font-body)", lineHeight:1.35, marginBottom:12 }}>
          {title}
        </h3>
      )}

      {/* Body paragraphs */}
      {bodyText && (
        <div style={{ fontSize:16, lineHeight:1.8, color:"#1a1a1a", fontFamily:"var(--font-body)" }}>
          {bodyText.split(/\n\n+/).map((para, i) => (
            para.trim() && <p key={i} style={{ marginBottom:14 }}>{para.trim()}</p>
          ))}
        </div>
      )}

      {/* Chart */}
      {showChart && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
          style={{ marginTop:20, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:16 }}>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
            <div style={{ display:"flex", gap:2, padding:2, borderRadius:8, background:"rgba(255,255,255,0.04)" }}>
              {["bar","line"].map(t => (
                <button key={t} onClick={()=>setChartType(t)}
                  style={{
                    padding:"2px 10px", borderRadius:6, fontSize:11, textTransform:"capitalize",
                    background:chartType===t?`${accentRgba}0.15)`:"transparent",
                    color:chartType===t?accentColor:"rgba(255,255,255,0.3)",
                    fontFamily:"var(--font-body)", border:"none", cursor:"none", transition:"all 0.15s",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height:180 }}>
            {(()=>{ const {data,options}=buildChart(graphData,chartType,isCreator);
              return chartType==="bar"?<Bar data={data} options={options}/>:<Line data={data} options={options}/>;
            })()}
          </div>
        </motion.div>
      )}

      {/* Action steps */}
      {steps.length > 0 && (
        <div style={{ marginTop:20 }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase", color:"#888888", fontFamily:"var(--font-body)", marginBottom:10 }}>
            ACTION STEPS
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display:"flex", gap:12, marginBottom:10, alignItems:"flex-start" }}>
                <div style={{
                  width:24, height:24, borderRadius:"50%", flexShrink:0,
                  background:"rgba(26,122,60,0.1)", border:"1px solid rgba(26,122,60,0.25)",
                  color:"#1a7a3c", fontSize:12, fontWeight:600,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-body)",
                }}>
                  {i+1}
                </div>
                <span style={{ fontSize:15, color:"#333333", lineHeight:1.6, paddingTop:3, fontFamily:"var(--font-body)" }}>
                  {stripMarkdown(s)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real example */}
      {example && (
        <div style={{ marginTop:20 }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase", color:"#888888", fontFamily:"var(--font-body)", marginBottom:10 }}>
            REAL EXAMPLE
          </p>
          <p style={{
            fontSize:15, color:"#555555", lineHeight:1.7,
            padding:"14px 16px", background:"rgba(26,122,60,0.04)",
            borderLeft:"2px solid rgba(26,122,60,0.3)", borderRadius:"0 8px 8px 0",
            fontFamily:"var(--font-body)",
          }}>
            {stripMarkdown(example)}
          </p>
        </div>
      )}

      {/* Follow-up chips */}
      {chips.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:16 }}>
          {chips.map((chip, i) => (
            <button key={i} onClick={()=>onChip?.(chip)}
              style={{
                padding:"7px 16px", borderRadius:20, fontSize:13, fontFamily:"var(--font-body)",
                background:"#ffffff", border:"1px solid #e0e0e0",
                color:"#444444", cursor:"pointer", transition:"all 0.2s ease",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(26,122,60,0.06)"; e.currentTarget.style.borderColor="rgba(26,122,60,0.25)"; e.currentTarget.style.color="#1a7a3c"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#ffffff"; e.currentTarget.style.borderColor="#e0e0e0"; e.currentTarget.style.color="#444444"; e.currentTarget.style.transform=""; }}>
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Copy / Redo / Save */}
      <AnimatePresence>
        {hovered && !message.streaming && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.12 }}
            style={{ display:"flex", gap:16, marginTop:12 }}>
            {[
              { label:copied?"Copied ✓":"Copy",   onClick:copy },
              { label:"Regenerate",               onClick:onRegenerate },
              { label:saved?"Saved ✓":"Save",     onClick:()=>{ if(!saved){ saveReport(message.content,title); setSaved(true); } } },
            ].map(({ label, onClick })=>(
              <button key={label} onClick={onClick}
                style={{ fontSize:13, fontFamily:"var(--font-body)", color:"#aaaaaa", background:"transparent", border:"none", cursor:"pointer", transition:"color 0.15s", display:"flex", alignItems:"center", gap:5, padding:0 }}
                onMouseEnter={e=>e.currentTarget.style.color="#1a7a3c"}
                onMouseLeave={e=>e.currentTarget.style.color="#aaaaaa"}>
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
