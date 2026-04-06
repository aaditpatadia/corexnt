import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Tooltip, Filler, Legend,
} from "chart.js";
import { parseResponse, shouldShowChart, stripMarkdown } from "../utils/parseResponse";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Filler, Legend);

const BAR_COLORS = ["#4f9cf9","#f97316","#22c55e","#a855f7","#f43f5e","#eab308"];

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
function buildChart(graphData) {
  const isMulti   = Array.isArray(graphData.datasets) && graphData.datasets.length > 1;
  const multiColors = ["#4f9cf9","#f97316","#888888"];

  const datasets = isMulti
    ? graphData.datasets.map((ds, i) => ({
        label: ds.label || `Dataset ${i+1}`,
        data:  ds.values,
        backgroundColor: multiColors[i] || BAR_COLORS[i],
        borderColor:     multiColors[i] || BAR_COLORS[i],
        borderRadius: 6,
        borderSkipped: false,
      }))
    : [{
        data:            graphData.values,
        backgroundColor: graphData.values.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
        borderRadius:    6,
        borderSkipped:   false,
      }];

  const barData  = { labels: graphData.labels, datasets };
  const lineData = {
    labels: graphData.labels,
    datasets: isMulti
      ? graphData.datasets.map((ds, i) => ({
          label:              ds.label || `Dataset ${i+1}`,
          data:               ds.values,
          borderColor:        multiColors[i] || BAR_COLORS[i],
          backgroundColor:    `${multiColors[i] || BAR_COLORS[i]}1a`,
          pointBackgroundColor: multiColors[i] || BAR_COLORS[i],
          pointRadius: 5, pointHoverRadius: 7,
          fill: true, tension: 0.4, borderWidth: 2,
        }))
      : [{
          data:               graphData.values,
          borderColor:        "#4f9cf9",
          backgroundColor:    "rgba(79,156,249,0.1)",
          pointBackgroundColor: "#4f9cf9",
          pointRadius: 5, pointHoverRadius: 7,
          fill: true, tension: 0.4, borderWidth: 2,
        }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 600 },
    plugins: {
      legend: { display: isMulti, position: "top", labels: { color:"#1a1a1a", font:{ size:12, family:"var(--font-body)" }, boxWidth:12, padding:16 } },
      tooltip: { backgroundColor:"#1a1a1a", titleColor:"#ffffff", bodyColor:"#dddddd", padding:10, cornerRadius:8 },
    },
    scales: {
      x: { grid:{ color:"rgba(0,0,0,0.06)" }, ticks:{ color:"#888888", font:{ size:12, family:"var(--font-body)" } }, border:{ color:"transparent" } },
      y: { grid:{ color:"rgba(0,0,0,0.06)" }, ticks:{ color:"#888888", font:{ size:12, family:"var(--font-body)" } }, border:{ color:"transparent" } },
    },
  };

  return { barData, lineData, options };
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
              : <div key={i} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:16, fontSize:12, background:"#f0f0eb", border:"1px solid #e8e8e3", color:"#555555", fontFamily:"var(--font-body)" }}>
                  📎 {f.name}
                </div>
            )}
          </div>
        )}
        {content && (
          <div style={{
            background:"#ffffff", border:"1px solid #e8e8e3",
            borderRadius:"20px 20px 4px 20px", padding:"12px 18px",
            fontSize:16, color:"#1a1a1a", lineHeight:1.6,
            fontFamily:"var(--font-body)",
            boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
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

  const [copied,  setCopied]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [hovered, setHovered] = useState(false);

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
          <span style={{ fontSize:10, fontWeight:600, color:"#1a7a3c", background:"#e8f5ee", border:"1px solid #c8e6d4", borderRadius:20, padding:"1px 7px", fontFamily:"var(--font-body)", letterSpacing:"0.5px" }}>
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
      {showChart && (()=>{
        const { barData, lineData, options } = buildChart(graphData);
        const isMulti = Array.isArray(graphData.datasets) && graphData.datasets.length > 1;
        const chartType = isMulti ? "line" : "bar";
        return (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
            style={{ marginTop:20, background:"#ffffff", border:"1px solid #e8e8e3", borderRadius:12, padding:20 }}>
            <div style={{ height:200 }}>
              {chartType === "bar"
                ? <Bar data={barData} options={options}/>
                : <Line data={lineData} options={options}/>}
            </div>
          </motion.div>
        );
      })()}

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
                  background:"#e8f5ee", border:"1px solid #c8e6d4",
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
            fontSize:15, color:"#444444", lineHeight:1.7,
            padding:"14px 16px", background:"#ffffff",
            borderLeft:"3px solid #1a7a3c", borderRadius:"0 8px 8px 0",
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
                background:"#ffffff", border:"1px solid #e0e0da",
                color:"#444444", cursor:"pointer", transition:"all 0.2s ease",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#e8f5ee"; e.currentTarget.style.borderColor="#1a7a3c"; e.currentTarget.style.color="#1a7a3c"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#ffffff"; e.currentTarget.style.borderColor="#e0e0da"; e.currentTarget.style.color="#444444"; }}>
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
