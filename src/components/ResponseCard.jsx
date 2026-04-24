import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Tooltip, Filler, Legend,
} from "chart.js";
import { parseResponse, shouldShowChart, stripMarkdown } from "../utils/parseResponse";
import { generateResponsePDF } from "../utils/generatePDF";

/* ── Render markdown to styled HTML ── */
function renderMarkdown(text) {
  if (!text) return "";

  // ── Pre-collapse: kill ALL double-blank-lines near list items ────────────────
  let html = text
    // Consecutive numbered items: 1. foo\n\n2. bar → 1. foo\n2. bar
    .replace(/^(\d+\..+)\n\n+(?=\d+\.)/gm, '$1\n')
    // Numbered item → description paragraph (blank line separating them): collapse
    .replace(/^(\d+\..+)\n\n+(?=[^\d\n*\-•])/gm, '$1\n')
    // Description paragraph → next numbered item: collapse
    .replace(/^([^\d\n*\-•#>].+)\n\n+(?=\d+\.)/gm, '$1\n')
    // Consecutive bullet items
    .replace(/^([-*•].+)\n\n+(?=[-*•])/gm, '$1\n')
    // Escape HTML
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Headers
    .replace(/^#### (.+)$/gm, '<h5 style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin:16px 0 4px;font-family:var(--font-body)">$1</h5>')
    .replace(/^### (.+)$/gm, '<h4 style="font-size:15px;font-weight:700;color:rgba(255,255,255,0.8);margin:18px 0 6px;font-family:var(--font-body)">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="font-size:17px;font-weight:700;color:#ffffff;margin:22px 0 8px;font-family:var(--font-body)">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="font-size:20px;font-weight:700;color:#ffffff;margin:26px 0 10px;font-family:var(--font-body)">$1</h2>')
    // Horizontal rule
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:16px 0"/>')
    // ALL-CAPS section labels
    .replace(/^([A-Z][A-Z\s''&\/\-]+:?)$/gm, '<p style="font-size:10.5px;font-weight:700;color:rgba(255,255,255,0.38);letter-spacing:2px;text-transform:uppercase;font-family:var(--font-body);margin:12px 0 3px;padding:0">$1</p>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#ffffff;font-weight:700">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:rgba(255,255,255,0.8)">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);border-radius:4px;padding:2px 6px;font-size:13px;font-family:monospace;color:#9CFCAF">$1</code>')
    // Numbered lists
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ol-item" style="margin:2px 0;color:rgba(255,255,255,0.85);font-family:var(--font-body);list-style:none;padding-left:0;line-height:1.55"><span style="color:#9CFCAF;font-weight:700;min-width:22px;display:inline-block">$1.</span> $2</li>')
    // Unordered lists
    .replace(/^[-*•]\s+(.+)$/gm, '<li style="margin:2px 0;padding-left:16px;color:rgba(255,255,255,0.85);font-family:var(--font-body);list-style:none;position:relative;line-height:1.55"><span style="position:absolute;left:0;color:#9CFCAF">•</span>$1</li>')
    // Blockquote
    .replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid rgba(156,252,175,0.4);padding:6px 14px;margin:8px 0;color:rgba(255,255,255,0.65);background:rgba(156,252,175,0.04);border-radius:0 8px 8px 0;font-family:var(--font-body);font-style:italic">$1</blockquote>')
    // Wrap consecutive li items
    .replace(/(<li[^>]*>.*?<\/li>\n?)+/gs, (match) => `<div style="margin:4px 0">${match}</div>`)
    // Paragraph breaks — keep margin minimal
    .replace(/\n\n+/g, '</p><p style="margin:4px 0;color:rgba(255,255,255,0.85);line-height:1.6;font-family:var(--font-body)">')
    .replace(/\n/g, '<br/>');
  return `<p style="margin:0 0 4px;color:rgba(255,255,255,0.85);line-height:1.6;font-family:var(--font-body)">${html}</p>`;
}

/* ── Legacy clean (for action steps / example sections only) ── */
function cleanAIText(text) {
  if (!text) return "";
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/^\s*[-–—]\s+/gm, "• ")
    .replace(/\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Filler, Legend);

const BAR_COLORS = ["#4f9cf9","#f97316","#22c55e","#a855f7","#f43f5e","#eab308"];

/* ── Link parser ── */
function renderWithLinks(text) {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
  return text.replace(urlRegex, (url) => {
    const clean = url.replace(/[.,;:!?)]+$/, '');
    return `<a href="${clean}" target="_blank" rel="noopener noreferrer" style="color:#6BC3CE;text-decoration:underline;text-underline-offset:3px;">${clean}</a>`;
  });
}

/* ── Markdown table parser — returns {text, tables} with placeholders ── */
function renderMarkdownTable(text) {
  const tables = [];
  const lines = text.split('\n');
  let result = '';
  let inTable = false;
  let tableHTML = '';
  let isFirstDataRow = true;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHTML = '<div class="intel-table-wrap"><table class="intel-table">';
        isFirstDataRow = true;
      }
      if (trimmed.replace(/\|/g, '').replace(/-/g, '').replace(/:/g, '').trim() === '') {
        // separator row — skip, mark header done
        isFirstDataRow = false;
        return;
      }
      const cells = trimmed.split('|').filter(c => c.trim() !== '');
      const tag = isFirstDataRow ? 'th' : 'td';
      tableHTML += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
      if (isFirstDataRow) isFirstDataRow = false;
    } else {
      if (inTable) {
        tableHTML += '</table></div>';
        const placeholder = `\x00TABLE${tables.length}\x00`;
        tables.push(tableHTML);
        tableHTML = '';
        inTable = false;
        isFirstDataRow = true;
        result += placeholder + '\n';
      }
      result += line + '\n';
    }
  });
  if (inTable) {
    tableHTML += '</table></div>';
    const placeholder = `\x00TABLE${tables.length}\x00`;
    tables.push(tableHTML);
    result += placeholder;
  }
  return { text: result, tables };
}

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
  const [copied,   setCopied]   = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { content, files = [] } = message;
  const isLong = (content?.length || 0) > 280;

  const copy = () => {
    navigator.clipboard.writeText(content || "").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
      style={{ display:"flex", justifyContent:"flex-end", marginBottom:20, alignItems:"flex-end", maxWidth:"100%", overflow:"hidden" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", maxWidth:"min(75%, 540px)", minWidth:0, flex:"0 1 auto" }}>
        {files.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"flex-end", marginBottom:6 }}>
            {files.map((f, i) => f.preview
              ? <img key={i} src={f.preview} alt={f.name} style={{ width:60, height:60, borderRadius:14, objectFit:"cover" }}/>
              : <div key={i} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:16, fontSize:12, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>
                  📎 {f.name}
                </div>
            )}
          </div>
        )}
        {content && (
          <div style={{ position:"relative", width:"100%" }}>
            <div style={{
              background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:"20px 20px 4px 20px", padding:"12px 18px",
              fontSize:15, color:"#ffffff", lineHeight:1.65,
              fontFamily:"var(--font-body)",
              maxHeight: isLong && !expanded ? "120px" : "none",
              overflow: "hidden",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              transition:"max-height 0.3s ease",
              boxSizing: "border-box",
            }}>
              {content}
            </div>
            {isLong && !expanded && (
              <div style={{
                position:"absolute", bottom:0, left:0, right:0, height:48,
                background:"linear-gradient(to top, rgba(12,12,18,0.95), transparent)",
                borderRadius:"0 0 4px 20px", pointerEvents:"none",
              }}/>
            )}
          </div>
        )}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:5, justifyContent:"flex-end" }}>
          {isLong && (
            <button
              onClick={() => setExpanded(p=>!p)}
              style={{ fontSize:12, color:"rgba(255,255,255,0.35)", background:"none", border:"none", cursor:"pointer", fontFamily:"var(--font-body)", transition:"color 0.15s", padding:0 }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
            >
              {expanded ? "Show less ↑" : "Show more ↓"}
            </button>
          )}
          {content && (
            <motion.button
              onClick={copy}
              whileTap={{ scale: 0.9 }}
              style={{
                fontSize:11, padding:"3px 10px", borderRadius:20,
                border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)",
                color: copied ? "#9CFCAF" : "rgba(255,255,255,0.3)",
                cursor:"pointer", fontFamily:"var(--font-body)", transition:"all 0.15s",
              }}
            >
              {copied ? "✓" : "Copy"}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Mindmap Card ── */
function MindmapCard({ data }) {
  const [activeNode, setActiveNode] = useState(null);
  const colors = ["#226FF7","#6BC3CE","#9CFCAF","#FFEA71","#f97316","#a855f7"];

  return (
    <motion.div
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      style={{ marginBottom:28, width:"100%" }}
    >
      {/* Central concept */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
        <div style={{
          padding:"12px 28px", borderRadius:100,
          background:"linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
          fontSize:16, fontWeight:700, color:"#000000",
          fontFamily:"var(--font-body)", letterSpacing:"-0.3px",
          boxShadow:"0 4px 24px rgba(107,195,206,0.25)",
        }}>
          {data.center}
        </div>
      </div>

      {/* Branches grid */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",
        gap:12,
      }}>
        {data.branches.map((branch, bi) => {
          const color = colors[bi % colors.length];
          const isActive = activeNode === bi;
          return (
            <motion.div
              key={bi}
              onClick={() => setActiveNode(isActive ? null : bi)}
              whileHover={{ scale:1.02, translateY:-2 }}
              transition={{ duration:0.2 }}
              style={{
                padding:"16px 18px", borderRadius:16, cursor:"pointer",
                border: isActive ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.08)",
                background: isActive ? `${color}10` : "rgba(255,255,255,0.03)",
                transition:"all 0.2s ease",
              }}
            >
              <div style={{
                display:"flex", alignItems:"center", gap:8, marginBottom:10,
              }}>
                <div style={{
                  width:8, height:8, borderRadius:"50%",
                  background:color, flexShrink:0,
                  boxShadow:`0 0 6px ${color}60`,
                }}/>
                <span style={{
                  fontSize:13, fontWeight:700, color:"#ffffff",
                  fontFamily:"var(--font-body)",
                }}>
                  {branch.title}
                </span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {(branch.items || []).map((item, ii) => (
                  <div key={ii} style={{
                    display:"flex", alignItems:"flex-start", gap:6,
                  }}>
                    <span style={{
                      fontSize:9, color:color, marginTop:5, flexShrink:0,
                    }}>●</span>
                    <span style={{
                      fontSize:13, color:"rgba(255,255,255,0.65)",
                      fontFamily:"var(--font-body)", lineHeight:1.5,
                    }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Flowchart Card ── */
function FlowchartCard({ data }) {
  const typeStyles = {
    start:    { bg:"rgba(34,111,247,0.12)",  border:"rgba(34,111,247,0.35)",  color:"#6BB1FF", label:"START"    },
    action:   { bg:"rgba(156,252,175,0.08)", border:"rgba(156,252,175,0.25)", color:"#9CFCAF", label:"ACTION"   },
    decision: { bg:"rgba(255,234,113,0.08)", border:"rgba(255,234,113,0.25)", color:"#FFEA71", label:"DECIDE"   },
    result:   { bg:"rgba(249,115,22,0.08)",  border:"rgba(249,115,22,0.25)",  color:"#f97316", label:"RESULT"   },
    end:      { bg:"rgba(168,85,247,0.1)",   border:"rgba(168,85,247,0.3)",   color:"#a855f7", label:"DONE"     },
  };

  const firstMove = data.firstMove || "";

  return (
    <motion.div
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      style={{ marginBottom:28, width:"100%" }}
    >
      {data.title && (
        <p style={{
          fontSize:11, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase",
          color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)", marginBottom:16,
        }}>
          {data.title}
        </p>
      )}

      <div style={{ maxWidth:560, margin:"0 auto" }}>
        {(data.steps || []).map((step, i) => {
          const t = typeStyles[step.type] || typeStyles.action;
          return (
            <div key={i}>
              <motion.div
                initial={{ opacity:0, x:-12 }}
                animate={{ opacity:1, x:0 }}
                transition={{ delay: i * 0.07, duration:0.3 }}
                style={{
                  display:"flex", gap:14, alignItems:"flex-start",
                  padding:"14px 18px", borderRadius:16,
                  background:t.bg, border:`1px solid ${t.border}`,
                }}
              >
                {/* Number badge */}
                <div style={{
                  width:28, height:28, borderRadius:"50%", flexShrink:0,
                  background:`${t.border}`, border:`1px solid ${t.color}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:700, color:t.color,
                  fontFamily:"var(--font-body)",
                }}>
                  {i + 1}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{
                      fontSize:14, fontWeight:700, color:"#ffffff",
                      fontFamily:"var(--font-body)",
                    }}>
                      {step.label}
                    </span>
                    <span style={{
                      fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:20,
                      background:`${t.border}`, color:t.color,
                      fontFamily:"var(--font-body)", letterSpacing:"1px",
                    }}>
                      {t.label}
                    </span>
                  </div>
                  {step.desc && (
                    <p style={{
                      fontSize:13, color:"rgba(255,255,255,0.6)",
                      fontFamily:"var(--font-body)", lineHeight:1.5, margin:0,
                    }}>
                      {step.desc}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Connector line */}
              {i < (data.steps.length - 1) && (
                <div style={{
                  width:2, height:16, background:"rgba(255,255,255,0.1)",
                  margin:"0 auto", marginLeft:32,
                }}/>
              )}
            </div>
          );
        })}
      </div>

      {firstMove && (
        <motion.div
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.3 }}
          style={{
            marginTop:20, padding:"14px 18px", borderRadius:16,
            background:"rgba(156,252,175,0.06)",
            border:"1px solid rgba(156,252,175,0.2)",
            display:"flex", gap:12, alignItems:"flex-start",
          }}
        >
          <span style={{ fontSize:16, flexShrink:0 }}>⚡</span>
          <div>
            <p style={{
              fontSize:11, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase",
              color:"rgba(156,252,175,0.7)", fontFamily:"var(--font-body)", marginBottom:4,
            }}>
              Your first move, right now
            </p>
            <p style={{
              fontSize:14, color:"rgba(255,255,255,0.85)",
              fontFamily:"var(--font-body)", lineHeight:1.6, margin:0,
            }}>
              {firstMove}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Plan gate banner ── */
function PlanGateBanner({ feature }) {
  return (
    <motion.div
      initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
      style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:16, background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.2)", marginBottom:20 }}
    >
      <span style={{ fontSize:18, flexShrink:0 }}>✦</span>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:"rgba(201,168,76,0.9)", fontFamily:"var(--font-body)", margin:"0 0 2px" }}>
          {feature} is a Nineteen Twentys feature
        </p>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", fontFamily:"var(--font-body)", margin:0 }}>
          Upgrade to unlock visual outputs, flowcharts, and mindmaps.
        </p>
      </div>
    </motion.div>
  );
}

/* ── Extract URLs from rendered text for source display ── */
function extractSources(text) {
  if (!text) return [];
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]()]+/g;
  const matches = [...new Set(text.match(urlRegex) || [])];
  return matches.slice(0, 6).map(url => {
    try {
      const u = new URL(url);
      return { url, domain: u.hostname.replace(/^www\./, '') };
    } catch { return { url, domain: url.slice(0,30) }; }
  });
}

/* ── Perplexity-style follow-ups section ── */
function FollowUpsSection({ followups, chips, onChip }) {
  const all = [...(followups || []), ...(chips || [])].filter(Boolean);
  if (!all.length) return null;
  return (
    <div style={{ marginTop: 24 }}>
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.25)', fontFamily: "var(--font-body)", marginBottom: 10,
      }}>
        Follow-ups
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {all.map((item, i) => (
          <motion.button
            key={i}
            onClick={() => onChip?.(item)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
              fontFamily: "var(--font-body)", fontSize: 14, textAlign: 'left',
              transition: 'all 0.15s ease', width: '100%',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#ffffff'; e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.color='rgba(255,255,255,0.65)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
          >
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, flexShrink: 0 }}>↳</span>
            <span style={{ flex: 1 }}>{item}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, flexShrink: 0 }}>→</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ── Source citations bar ── */
function SourcesBar({ sources }) {
  if (!sources.length) return null;
  return (
    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.2)', fontFamily: "var(--font-body)", marginBottom: 8,
      }}>
        {sources.length} source{sources.length !== 1 ? 's' : ''} referenced
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {sources.map((s, i) => (
          <a
            key={i} href={s.url} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 20,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: 11, fontFamily: "var(--font-body)",
              color: 'rgba(255,255,255,0.45)', textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color='rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
          >
            <span style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, flexShrink: 0 }}>
              {i + 1}
            </span>
            {s.domain}
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── Like / Dislike ── */
function FeedbackRow({ messageId, onRegenerate }) {
  const key = `corex_feedback_${messageId}`;
  const [vote, setVote] = useState(() => localStorage.getItem(key) || null);
  const cast = (v) => {
    const next = vote === v ? null : v;
    setVote(next);
    if (next) localStorage.setItem(key, next); else localStorage.removeItem(key);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
      {[
        { v: 'up',   icon: '↑', tip: 'Good response' },
        { v: 'down', icon: '↓', tip: 'Bad response' },
      ].map(({ v, icon, tip }) => (
        <motion.button
          key={v}
          onClick={() => cast(v)}
          whileTap={{ scale: 0.88 }}
          title={tip}
          style={{
            width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontFamily: "var(--font-body)",
            background: vote === v
              ? (v === 'up' ? 'rgba(156,252,175,0.12)' : 'rgba(248,113,113,0.12)')
              : 'rgba(255,255,255,0.04)',
            color: vote === v
              ? (v === 'up' ? '#9CFCAF' : '#f87171')
              : 'rgba(255,255,255,0.3)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (vote !== v) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { if (vote !== v) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        >
          {icon}
        </motion.button>
      ))}
      {vote === 'down' && (
        <motion.button
          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
          onClick={onRegenerate}
          style={{
            padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.25)',
            background: 'rgba(248,113,113,0.06)', cursor: 'pointer',
            fontSize: 11, fontFamily: "var(--font-body)", color: '#f87171',
          }}
        >
          Regenerate
        </motion.button>
      )}
    </div>
  );
}

/* ── COREX response ── */
export default function ResponseCard({ message, onChip, onRegenerate, onSendMessage, onShare, userType = "creator" }) {
  const { role, searchUsed } = message;

  const [copied,     setCopied]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [hovered,    setHovered]    = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const chartRef = useRef(null);

  // Action buttons state
  const [whyOpen,    setWhyOpen]    = useState(false);
  const [whyLoading, setWhyLoading] = useState(false);
  const [makeItOpen, setMakeItOpen] = useState(false);
  const makeItRef = useRef(null);

  useEffect(() => {
    if (!makeItOpen) return;
    const handler = (e) => {
      if (makeItRef.current && !makeItRef.current.contains(e.target)) {
        setMakeItOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [makeItOpen]);

  if (role === "user") return <UserBubble message={message}/>;

  const { title, cleanBody, steps, example, graphData, mindmapData, flowchartData, chips, followups, clarifyOptions } = parseResponse(message.content);
  const showChart = shouldShowChart(graphData);
  const bodyText  = cleanBody || ""; // keep raw markdown — rendered below
  const sources   = searchUsed ? extractSources(bodyText) : [];
  const msgId     = message.id || message.ts || String(message.content?.length);

  const plan = typeof window !== "undefined" ? (localStorage.getItem("corex_plan") || "free") : "free";
  const isPremiumPlan = plan === "nineteen_twentys" || plan === "canvas_enterprise";
  const isAdminUser   = typeof window !== "undefined" && localStorage.getItem("userEmail") === "corexnt@gmail.com";

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
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
        <span style={{ fontSize:10, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,0.22)", fontFamily:"var(--font-body)" }}>
          COREX
        </span>
        {searchUsed && (
          <span style={{
            fontSize:10, fontWeight:600, color:"#9CFCAF",
            background:"rgba(156,252,175,0.08)", border:"1px solid rgba(156,252,175,0.18)",
            borderRadius:20, padding:"2px 8px",
            fontFamily:"var(--font-body)", letterSpacing:"0.5px",
            display:"inline-flex", alignItems:"center", gap:5,
          }}>
            <span style={{ animation:"liveIntelPulse 2s ease-in-out infinite", display:"inline-block", width:5, height:5, borderRadius:"50%", background:"#9CFCAF" }}/>
            Live intel
            {sources.length > 0 && ` · ${sources.length} sources`}
          </span>
        )}
      </div>

      {/* Title */}
      {title && (
        <h3 style={{ fontSize:17, fontWeight:700, color:"#ffffff", fontFamily:"var(--font-body)", lineHeight:1.35, marginBottom:12 }}>
          {title}
        </h3>
      )}

      {/* Body — full markdown rendered */}
      {bodyText && (()=>{
        // Step 1: extract tables → replace with null-byte placeholders so renderMarkdown won't escape their HTML
        const { text: withPlaceholders, tables } = renderMarkdownTable(bodyText);
        // Step 2: render remaining markdown (headings, bold, lists, etc.)
        let html = renderMarkdown(withPlaceholders);
        // Step 3: re-inject table HTML (was never touched by the escaper)
        tables.forEach((tableHTML, i) => {
          html = html.split(`\x00TABLE${i}\x00`).join(tableHTML);
        });
        // Step 4: linkify URLs
        html = renderWithLinks(html);
        return (
          <div
            className="corex-response-body"
            style={{ fontSize:15, lineHeight:1.8, color:"rgba(255,255,255,0.85)", fontFamily:"var(--font-body)" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })()}

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

      {/* Clarify options — shown as clickable direction cards */}
      {clarifyOptions && clarifyOptions.length > 0 && (
        <motion.div
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.05 }}
          style={{ marginBottom:20, display:"flex", flexWrap:"wrap", gap:10 }}
        >
          {clarifyOptions.map((opt, i) => (
            <motion.button
              key={i}
              onClick={() => onChip?.(opt)}
              whileHover={{ scale:1.02 }}
              whileTap={{ scale:0.97 }}
              style={{
                padding:"10px 18px", borderRadius:24, fontSize:14,
                fontFamily:"var(--font-body)", fontWeight:500,
                background:"rgba(156,252,175,0.07)",
                border:"1px solid rgba(156,252,175,0.25)",
                color:"rgba(255,255,255,0.85)", cursor:"pointer",
                transition:"all 0.15s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(156,252,175,0.14)"; e.currentTarget.style.borderColor="rgba(156,252,175,0.5)"; e.currentTarget.style.color="#ffffff"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(156,252,175,0.07)"; e.currentTarget.style.borderColor="rgba(156,252,175,0.25)"; e.currentTarget.style.color="rgba(255,255,255,0.85)"; }}
            >
              {opt}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Mindmap */}
      {mindmapData && (isPremiumPlan || isAdminUser
        ? <MindmapCard data={mindmapData} />
        : <PlanGateBanner feature="Mindmaps" />
      )}

      {/* Flowchart */}
      {flowchartData && (isPremiumPlan || isAdminUser
        ? <FlowchartCard data={flowchartData} />
        : <PlanGateBanner feature="Flowcharts" />
      )}

      {/* Next moves / action steps — numbered cards */}
      {steps.length > 0 && (
        <div style={{ marginTop:20 }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", fontFamily:"var(--font-body)", marginBottom:12 }}>
            {nextMovesLabel}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"flex-start", gap:12,
                padding:"12px 14px", borderRadius:12,
                background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.06)",
              }}>
                <span style={{
                  width:24, height:24, borderRadius:"50%", flexShrink:0,
                  background:"linear-gradient(135deg, #226FF7, #9CFCAF)",
                  color:"#000", fontSize:11, fontWeight:800,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-body)",
                }}>{i + 1}</span>
                <p style={{ fontSize:15, color:"rgba(255,255,255,0.8)", fontFamily:"var(--font-body)", lineHeight:1.55, margin:0, wordBreak:"break-word", overflowWrap:"break-word" }}>
                  {cleanAIText(stripMarkdown(s))}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real example — styled callout */}
      {example && (
        <div style={{
          marginTop:20, padding:"14px 16px",
          borderRadius:12, background:"rgba(156,252,175,0.04)",
          borderLeft:"3px solid rgba(156,252,175,0.4)",
        }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"rgba(156,252,175,0.6)", marginBottom:8, fontFamily:"var(--font-body)" }}>
            REAL EXAMPLE
          </p>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.7)", fontFamily:"var(--font-body)", lineHeight:1.6, margin:0 }}>
            {cleanAIText(stripMarkdown(example))}
          </p>
        </div>
      )}

      {/* Sources (when web search was used) */}
      {sources.length > 0 && <SourcesBar sources={sources}/>}

      {/* Perplexity-style follow-ups */}
      <FollowUpsSection followups={followups} chips={chips} onChip={onChip}/>

      {/* Like / Dislike feedback */}
      {!message.streaming && (
        <FeedbackRow messageId={msgId} onRegenerate={onRegenerate}/>
      )}

      {/* Copy / Redo / Save / PDF — hover action bar */}
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

      {/* ── Four action buttons (assistant only, always visible) ── */}
      {!message.streaming && (
        <div style={{ marginTop: 16 }}>

          {/* Button row — all 4 inline, no expanding inside */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>

            {/* Button 1: Improve this */}
            <ActionBtn
              label="✦ Improve this"
              onClick={() => onSendMessage?.(
                "Improve and expand on your last response. Make it more specific, add real data, and give sharper recommendations.",
                4
              )}
            />

            {/* Button 2: Why this works (toggle) */}
            <ActionBtn
              label="◎ Why this works"
              active={whyOpen}
              whyActive={whyOpen}
              onClick={() => {
                if (!whyOpen) {
                  setWhyOpen(true);
                  setWhyLoading(true);
                  onSendMessage?.(
                    "Explain the strategic reasoning behind your last response. Why does this approach work for this specific situation? What's the insight that makes this different from generic advice?",
                    2
                  );
                  setTimeout(() => setWhyLoading(false), 800);
                } else {
                  setWhyOpen(false);
                }
              }}
            />

            {/* Button 3: Another direction */}
            <ActionBtn
              label="↺ Another direction"
              onClick={() => onSendMessage?.(
                "Give me a completely different strategic direction for the same brief. Not a variation — a genuinely different angle I haven't considered yet.",
                4
              )}
            />

            {/* Button 4: Make it [mode] — dropdown */}
            <div ref={makeItRef} style={{ position: "relative" }}>
              <ActionBtn
                label="⚡ Make it..."
                active={makeItOpen}
                onClick={() => setMakeItOpen(p => !p)}
              />
              {makeItOpen && (
                <div style={{
                  position: "absolute", bottom: "110%", left: 0,
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "4px",
                  minWidth: "160px",
                  zIndex: 200,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}>
                  {[
                    { label: "More viral",     prompt: "Now make this more viral. Think shareability, emotion, hooks that spread." },
                    { label: "More premium",   prompt: "Now make this more premium. Elevate the positioning, language, and strategy to luxury/aspirational level." },
                    { label: "More emotional", prompt: "Now make this more emotionally resonant. Connect it to identity, aspiration, and human truth." },
                    { label: "More practical", prompt: "Make this more practical and executable. Break it into specific steps I can do this week." },
                  ].map(({ label, prompt }) => (
                    <div
                      key={label}
                      onClick={() => { onSendMessage?.(prompt, 4); setMakeItOpen(false); }}
                      style={{ padding: "8px 12px", fontSize: 13, color: "rgba(255,255,255,0.7)", borderRadius: 8, cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Why this works panel — BELOW the button row, never inside it */}
          {whyOpen && (
            <div style={{
              marginTop: 12,
              background: 'rgba(156,252,175,0.04)',
              borderLeft: '2px solid #9CFCAF',
              padding: '14px 18px',
              borderRadius: '0 8px 8px 0',
            }}>
              <div style={{ fontSize: 10, letterSpacing: '2px', color: '#9CFCAF', marginBottom: 8, fontFamily: "'Instrument Sans', sans-serif", fontWeight: 700 }}>COREX REASONING</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', wordBreak: 'break-word', fontFamily: "'Instrument Sans', sans-serif", lineHeight: 1.6 }}>
                {whyLoading ? 'Thinking...' : 'Reasoning sent to chat — scroll up for the full strategic breakdown.'}
              </div>
            </div>
          )}

        </div>
      )}
    </motion.div>
  );
}

/* ── Shared action button ── */
function ActionBtn({ label, onClick, active, whyActive }) {
  const [hov, setHov] = useState(false);
  const isWhyActive = whyActive && active;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: isWhyActive
          ? 'rgba(156,252,175,0.1)'
          : (active || hov ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'),
        border: `1px solid ${isWhyActive
          ? 'rgba(156,252,175,0.3)'
          : (active || hov ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)')}`,
        borderRadius: '100px',
        padding: '7px 14px',
        fontSize: '12px',
        fontFamily: "'Instrument Sans', sans-serif",
        color: isWhyActive ? '#9CFCAF' : (active || hov ? '#ffffff' : 'rgba(255,255,255,0.6)'),
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
        transform: hov ? 'translateY(-1px)' : 'translateY(0)',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}
