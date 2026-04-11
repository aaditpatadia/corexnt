import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Tooltip, Filler, Legend,
} from "chart.js";
import { parseResponse, shouldShowChart, stripMarkdown } from "../utils/parseResponse";
import { generateResponsePDF } from "../utils/generatePDF";

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
  const multiColors = ["#4f9cf9","#f97316","#9CFCAF"];

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
      legend: { display: isMulti, position: "top", labels: { color:"rgba(255,255,255,0.7)", font:{ size:12, family:"var(--font-body)" }, boxWidth:12, padding:16 } },
      tooltip: { backgroundColor:"#1a1a1a", titleColor:"#ffffff", bodyColor:"#dddddd", padding:10, cornerRadius:8 },
    },
    scales: {
      x: { grid:{ color:"rgba(255,255,255,0.06)" }, ticks:{ color:"rgba(255,255,255,0.4)", font:{ size:12, family:"var(--font-body)" } }, border:{ color:"transparent" } },
      y: { grid:{ color:"rgba(255,255,255,0.06)" }, ticks:{ color:"rgba(255,255,255,0.4)", font:{ size:12, family:"var(--font-body)" } }, border:{ color:"transparent" } },
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
              : <div key={i} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:16, fontSize:12, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>
                  📎 {f.name}
                </div>
            )}
          </div>
        )}
        {content && (
          <div style={{
            background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:"20px 20px 4px 20px", padding:"12px 18px",
            fontSize:15, color:"#ffffff", lineHeight:1.6,
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

  const [copied,     setCopied]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [hovered,    setHovered]    = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const chartRef = useRef(null);

  if (role === "user") return <UserBubble message={message}/>;

  const { title, cleanBody, steps, example, graphData, chips, followups } = parseResponse(message.content);
  const showChart = shouldShowChart(graphData);
  const bodyText  = stripMarkdown(cleanBody || "");

  const nextMovesLabel = userType !== "company" ? "This week" : "Next moves";

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

      {/* COREX Intelligence label */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <span style={{ fontSize:11, fontWeight:600, letterSpacing:"1.5px", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", fontFamily:"var(--font-body)" }}>
          COREX Intelligence
        </span>
        {searchUsed && (
          <span style={{
            fontSize:10, fontWeight:600, color:"#9CFCAF",
            background:"rgba(156,252,175,0.1)", border:"1px solid rgba(156,252,175,0.2)",
            borderRadius:20, padding:"2px 8px",
            fontFamily:"var(--font-body)", letterSpacing:"0.5px",
            display:"inline-flex", alignItems:"center", gap:5,
          }}>
            <span style={{ animation:"liveIntelPulse 2s ease-in-out infinite", display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#9CFCAF" }}/>
            Live intel
          </span>
        )}
      </div>

      {/* Title */}
      {title && (
        <h3 style={{ fontSize:17, fontWeight:700, color:"#ffffff", fontFamily:"var(--font-body)", lineHeight:1.35, marginBottom:12 }}>
          {title}
        </h3>
      )}

      {/* Body paragraphs */}
      {bodyText && (
        <div style={{ fontSize:15, lineHeight:1.8, color:"rgba(255,255,255,0.85)", fontFamily:"var(--font-body)" }}>
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
            style={{ marginTop:20, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:20 }}>
            {graphData?.title && (
              <p style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"1px", fontFamily:"var(--font-body)", marginBottom:10 }}>
                {graphData.title}
              </p>
            )}
            <div style={{ height:200 }}>
              {chartType === "bar"
                ? <Bar ref={chartRef} data={barData} options={options}/>
                : <Line ref={chartRef} data={lineData} options={options}/>}
            </div>
          </motion.div>
        );
      })()}

      {/* Next moves / action steps */}
      {steps.length > 0 && (
        <div style={{ marginTop:20, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"16px 18px" }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)", marginBottom:12 }}>
            {nextMovesLabel}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display:"flex", gap:12, marginBottom:10, alignItems:"flex-start" }}>
                <div style={{
                  width:18, height:18, borderRadius:4, flexShrink:0, marginTop:3,
                  border:"1.5px solid rgba(255,255,255,0.25)", background:"transparent",
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" style={{ opacity:0 }}>
                    <polyline points="3 9 7 13 15 5" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                <span style={{ fontSize:14, color:"rgba(255,255,255,0.8)", lineHeight:1.6, fontFamily:"var(--font-body)", wordBreak:"break-word", overflowWrap:"break-word" }}>
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
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", fontFamily:"var(--font-body)", marginBottom:10 }}>
            REAL EXAMPLE
          </p>
          <p style={{
            fontSize:15, color:"rgba(255,255,255,0.7)", lineHeight:1.7,
            padding:"14px 16px", background:"rgba(255,255,255,0.04)",
            borderLeft:"3px solid rgba(255,255,255,0.2)", borderRadius:"0 8px 8px 0",
            fontFamily:"var(--font-body)",
          }}>
            {stripMarkdown(example)}
          </p>
        </div>
      )}

      {/* Follow-up chips */}
      {(chips.length > 0 || (followups && followups.length > 0)) && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:16 }}>
          {[...chips, ...(followups || [])].map((chip, i) => (
            <button key={i} onClick={()=>onChip?.(chip)}
              style={{
                padding:"7px 16px", borderRadius:20, fontSize:13, fontFamily:"var(--font-body)",
                background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
                color:"rgba(255,255,255,0.7)", cursor:"pointer", transition:"all 0.2s ease",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.25)"; e.currentTarget.style.color="#ffffff"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="rgba(255,255,255,0.7)"; }}>
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Copy / Redo / Save / PDF */}
      <AnimatePresence>
        {hovered && !message.streaming && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.12 }}
            style={{ display:"flex", gap:16, marginTop:12, flexWrap:"wrap", alignItems:"center" }}>
            {[
              { label:copied?"Copied ✓":"Copy",   onClick:copy },
              { label:"Regenerate",               onClick:onRegenerate },
              { label:saved?"Saved ✓":"Save",     onClick:()=>{ if(!saved){ saveReport(message.content,title); setSaved(true); } } },
            ].map(({ label, onClick })=>(
              <button key={label} onClick={onClick}
                style={{ fontSize:13, fontFamily:"var(--font-body)", color:"rgba(255,255,255,0.3)", background:"transparent", border:"none", cursor:"pointer", transition:"color 0.15s", display:"flex", alignItems:"center", gap:5, padding:0 }}
                onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.8)"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>
                {label}
              </button>
            ))}
            <button
              onClick={async () => {
                setPdfLoading(true);
                try {
                  let chartImage = null;
                  if (chartRef.current) {
                    try {
                      const canvas = chartRef.current.canvas;
                      if (canvas) chartImage = canvas.toDataURL("image/png");
                    } catch {}
                  }
                  generateResponsePDF({
                    title,
                    body: bodyText,
                    actionSteps: steps,
                    realExample: example,
                    graphData: showChart ? graphData : null,
                    chartImage,
                  });
                } finally {
                  setPdfLoading(false);
                }
              }}
              style={{ fontSize:13, fontFamily:"var(--font-body)", color:"rgba(255,255,255,0.3)", background:"transparent", border:"none", cursor:"pointer", transition:"color 0.15s", display:"flex", alignItems:"center", gap:5, padding:0 }}
              onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.8)"}
              onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>
              {pdfLoading ? "Generating…" : "Download PDF"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
