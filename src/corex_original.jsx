import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   COREX — Creative Operating System
   API: Uses artifact proxy (no CORS issues, no exposed keys)
   Voice: Web Speech API with microphone permissions
   Graphs: Pure SVG, zero overlaps, animated
═══════════════════════════════════════════════════════════════ */

const SYSTEM_PROMPT = `You are Corex — the world's most advanced Creative Operating System for brands, creators, and marketers.

YOUR PERSONALITY: You're like that one brilliant friend who knows everything about marketing but explains it like you're texting — casual, direct, zero fluff. You always give SPECIFIC answers with REAL numbers. Never vague. Never generic.

CRITICAL LANGUAGE RULE: Write like you're explaining to a smart 16-year-old. Short sentences. Simple words. If a concept is complex, use a real analogy. Every sentence must be immediately actionable.

RESPONSE FORMAT — follow this EXACTLY every single time:

## WHAT TO DO
One or two sentences. The most direct answer possible. What should they actually do.

## HOW TO DO IT
Numbered steps. Maximum 6. Each step is one simple action.

## WHY IT WORKS
Two or three sentences. Simple explanation. Use an analogy from real life.

## REAL EXAMPLE
One specific brand or creator with actual numbers. Make it Indian when relevant.

## DO THIS NOW
One action they can complete in the next 10 minutes.

---

SPECIAL RULES:
- If someone asks about creator pricing: give exact rupee ranges based on their follower count
- Creator pricing formula: Under 10K = ₹5,000–15,000/post. 10K-50K = ₹15,000–50,000. 50K-200K = ₹50,000–2,00,000. 200K-1M = ₹2,00,000–8,00,000. 1M+ = ₹8,00,000–50,00,000+. Reach matters more than followers — 2M reach at 10K followers = charge at 50K tier.
- If someone asks for Reel ideas: give 3 complete ideas with hook + full script + format + why it works
- If someone asks about budget: give exact percentage splits
- If someone mentions their niche or numbers: use those details in your answer — make it personal
- Always end with chips tag

When showing data/metrics, include a chart using this exact format:
<chart type="bar" title="Title" color="#5B4EFF">
[{"l":"Label","v":42},{"l":"Label2","v":78}]
</chart>

Use charts for: budget splits (use type="donut"), growth over time (use type="line"), comparisons (use type="bar"), funnel stages (use type="funnel").

Always end EVERY response with:
<chips>["specific next step 1", "specific next step 2", "specific next step 3"]</chips>`;

/* ─── ENGINES ────────────────────────────────────────────────── */
const ENGINES = [
  { id:"narrative", icon:"◈", label:"Narrative", color:"#F97316", desc:"Brand & positioning",
    s:["Write my brand positioning","Define my tone of voice","Build messaging pillars","Create my brand story","Write a tagline","Design my category"] },
  { id:"content",   icon:"◫", label:"Content",   color:"#3B82F6", desc:"Content systems & hooks",
    s:["Build my content system","Generate 10 hooks","Plan weekly content calendar","Write Instagram captions","Reel script for my niche","Build content pillars"] },
  { id:"growth",    icon:"◬", label:"Growth",    color:"#22C55E", desc:"Budget math & channels",
    s:["Build growth strategy","How to allocate ₹50,000?","Best channels for my niche?","Set my KPIs","Calculate my CAC","Build paid media plan"] },
  { id:"experience",icon:"◉", label:"Experience",color:"#A855F7", desc:"Funnel & conversion",
    s:["Map my customer journey","Fix my conversion rate","Improve my onboarding","Design my sales funnel","Audit my landing page","Build retention strategy"] },
  { id:"trend",     icon:"✦", label:"Trend",     color:"#F43F5E", desc:"Viral trends & culture",
    s:["Create a viral trend","Give me 3 Reel ideas this week","Hijack a cultural moment","What trends to ride now?","Build a viral campaign","Create a challenge"] },
  { id:"creator",   icon:"⬡", label:"Creator",   color:"#F59E0B", desc:"Reels, scripts & money",
    s:["Write a full Reel script","What should I charge brands?","Turn audience into buyers","Build my creator flywheel","Price my brand deals","Launch my digital product"] },
];

const THINKING_MSGS = [
  "Building your system…",
  "Thinking the 19twentys way…",
  "Pulling the sharpest strategy…",
  "Cutting through the noise…",
  "Making it simple for you…",
  "Channelling Hormozi × Seth Godin…",
  "Running the growth engine…",
  "Applying creator intelligence…",
  "Finding the real insight…",
  "No fluff — just the signal…",
  "Structuring your execution plan…",
  "Checking what actually works in 2025…",
];

/* ─── DESIGN TOKENS ──────────────────────────────────────────── */
const LIGHT = {
  bg:"#F5F4F1", surface:"#FAFAF9", card:"#FFFFFF",
  border:"rgba(0,0,0,0.06)", borderSt:"rgba(0,0,0,0.11)",
  text:"#111110", sub:"#3F3E3A", mute:"#9A9894",
  accent:"#5B4EFF", accentSoft:"rgba(91,78,255,0.08)", accentGlow:"rgba(91,78,255,0.2)",
  green:"#16A34A", greenSoft:"rgba(22,163,74,0.09)",
  red:"#E11D48", redSoft:"rgba(225,29,72,0.08)",
  userBg:"#111110", userText:"#FFF",
  glass:"rgba(245,244,241,0.94)",
  sh:"0 1px 2px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.05)",
  shMd:"0 4px 24px rgba(0,0,0,0.08)",
  shLg:"0 16px 56px rgba(0,0,0,0.12)",
};
const DARK = {
  bg:"#0C0C0D", surface:"#111113", card:"#18181B",
  border:"rgba(255,255,255,0.07)", borderSt:"rgba(255,255,255,0.12)",
  text:"#FAFAF9", sub:"#A09F9C", mute:"#616060",
  accent:"#7C6FFF", accentSoft:"rgba(124,111,255,0.11)", accentGlow:"rgba(124,111,255,0.22)",
  green:"#4ADE80", greenSoft:"rgba(74,222,128,0.09)",
  red:"#FB7185", redSoft:"rgba(251,113,133,0.09)",
  userBg:"#7C6FFF", userText:"#FFF",
  glass:"rgba(12,12,13,0.94)",
  sh:"0 1px 2px rgba(0,0,0,0.4),0 4px 16px rgba(0,0,0,0.35)",
  shMd:"0 4px 24px rgba(0,0,0,0.5)",
  shLg:"0 16px 56px rgba(0,0,0,0.65)",
};

/* ─── CSS ────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%;overflow:hidden}
  body{font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:rgba(128,128,128,0.18);border-radius:99px}
  textarea,button,input{font-family:inherit}
  button:focus,textarea:focus,input:focus{outline:none}
  button{cursor:pointer;border:none;background:none;padding:0}
  select{font-family:inherit;cursor:pointer}

  .cx-grain::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9998;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    background-size:200px;opacity:0.48;}

  @keyframes up   {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes in   {from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)}}
  @keyframes fade {from{opacity:0}to{opacity:1}}
  @keyframes spin {to{transform:rotate(360deg)}}
  @keyframes dot  {0%,80%,100%{transform:scale(0.45);opacity:0.15}40%{transform:scale(1);opacity:1}}
  @keyframes sub  {from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes think{0%,100%{opacity:0.25}50%{opacity:1}}
  @keyframes breathe{0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,0.5)}70%{box-shadow:0 0 0 9px rgba(244,63,94,0)}}
  @keyframes chipIn{from{opacity:0;transform:translateY(6px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes barUp{from{transform:scaleY(0)}to{transform:scaleY(1)}}
  @keyframes lineIn{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}
  @keyframes widthIn{from{width:0%}to{width:var(--w)}}

  .msg   {animation:up   0.4s cubic-bezier(0.16,1,0.3,1) both}
  .s0    {animation:in   0.32s 0.04s cubic-bezier(0.16,1,0.3,1) both}
  .s1    {animation:in   0.32s 0.10s cubic-bezier(0.16,1,0.3,1) both}
  .s2    {animation:in   0.32s 0.16s cubic-bezier(0.16,1,0.3,1) both}
  .s3    {animation:in   0.32s 0.22s cubic-bezier(0.16,1,0.3,1) both}
  .s4    {animation:in   0.32s 0.28s cubic-bezier(0.16,1,0.3,1) both}
  .s5    {animation:in   0.32s 0.34s cubic-bezier(0.16,1,0.3,1) both}
  .s6    {animation:in   0.32s 0.40s cubic-bezier(0.16,1,0.3,1) both}
  .cin   {animation:chipIn 0.26s cubic-bezier(0.34,1.56,0.64,1) both}
  .fade  {animation:fade 0.35s ease both}
  .tkdot {animation:think 1.4s ease infinite}
  .cursor{display:inline-block;width:2px;height:14px;background:currentColor;margin-left:2px;
    vertical-align:middle;animation:blink 0.9s step-end infinite}
  .card  {transition:box-shadow 0.2s,transform 0.2s,border-color 0.2s}
  .card:hover{transform:translateY(-1px)}
  .chip  {transition:all 0.18s cubic-bezier(0.34,1.56,0.64,1)}
  .chip:hover{transform:translateY(-2px)!important}
  .mic-on{animation:breathe 1s ease-in-out infinite}
  .bar-anim{transform-origin:bottom;animation:barUp 0.7s cubic-bezier(0.16,1,0.3,1) both}
  .line-anim{stroke-dasharray:800;animation:lineIn 1.4s ease both}
`;

/* ─── SVG ICONS ──────────────────────────────────────────────── */
const MicIcon = ({ active, color = "#9A9894", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="8.5" y="1.5" width="7" height="13" rx="3.5" fill={active?"#F43F5E":color} stroke={active?"#F43F5E":color} strokeWidth="1"/>
    <path d="M4.5 11.5C4.5 15.642 7.858 19 12 19C16.142 19 19.5 15.642 19.5 11.5" stroke={active?"#F43F5E":color} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="12" y1="19" x2="12" y2="23" stroke={active?"#F43F5E":color} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="9" y1="23" x2="15" y2="23" stroke={active?"#F43F5E":color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const SendIcon = ({ color = "#fff" }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SpeakIcon = ({ active }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill={active?"#F43F5E":"currentColor"} opacity={active?1:0.7}/>
    {active
      ? <line x1="17" y1="8" x2="22" y2="16" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round"/>
      : <>
          <path d="M15.54 8.46C16.48 9.4 17 10.67 17 12C17 13.33 16.48 14.6 15.54 15.54" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M18.37 5.63C20.07 7.33 21 9.61 21 12C21 14.39 20.07 16.67 18.37 18.37" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </>
    }
  </svg>
);

/* ─── CHARTS (zero overlap, animated, beautiful) ─────────────── */
function BarChart({ data, color = "#5B4EFF", dark = false }) {
  const max = Math.max(...data.map(d => d.v), 1);
  const n = data.length;
  const W = 340, BH = 120, TOP = 24, GAP = 8;
  const slotW = W / n;
  const barW = Math.min(slotW - GAP * 2, 48);
  const needRotate = n > 4 || data.some(d => (d.l||"").length > 7);
  const labSpace = needRotate ? 38 : 18;
  const totalH = TOP + BH + 6 + labSpace;

  return (
    <svg viewBox={`0 0 ${W} ${totalH}`} style={{width:"100%",height:"auto",display:"block",overflow:"visible"}}>
      <defs>
        <linearGradient id={`bg${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.65"/>
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const bh = Math.max(4, (d.v / max) * BH);
        const cx = slotW * i + slotW / 2;
        const bx = cx - barW / 2;
        const by = TOP + BH - bh;
        const raw = String(d.l || "");
        const label = raw.length > 11 ? raw.slice(0, 10) + "…" : raw;
        const labX = cx;
        const labY = TOP + BH + 6 + (needRotate ? 4 : 12);
        return (
          <g key={i}>
            {/* bg track */}
            <rect x={bx} y={TOP} width={barW} height={BH} rx={5} fill={color} opacity={0.07}/>
            {/* bar with gradient */}
            <rect x={bx} y={by} width={barW} height={bh} rx={5}
              fill={`url(#bg${color.slice(1)})`}
              className="bar-anim" style={{animationDelay:`${i*0.06}s`}}/>
            {/* value label — always above bar with enough space */}
            <text x={cx} y={Math.max(by - 5, TOP + 10)}
              textAnchor="middle" fontSize={8.5} fill={color} fontWeight="700">
              {d.v}{d.unit || ""}
            </text>
            {/* axis label */}
            {needRotate ? (
              <text x={labX} y={TOP + BH + 14}
                transform={`rotate(-38,${labX},${TOP+BH+14})`}
                textAnchor="end" fontSize={8} fill={dark?"#636260":"#8E8E93"} fontWeight="500">
                {label}
              </text>
            ) : (
              <text x={labX} y={labY}
                textAnchor="middle" fontSize={8.5} fill={dark?"#636260":"#8E8E93"} fontWeight="500">
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, color = "#22C55E" }) {
  const vals = data.map(d => d.v);
  const max = Math.max(...vals, 1), min = Math.min(...vals);
  const range = max - min || 1;
  const W = 320, H = 100, PX = 20, PY = 16;
  const dW = W - PX * 2, dH = H - PY * 2;
  const n = data.length;
  const px = i => PX + (dW / Math.max(n-1,1)) * i;
  const py = v => PY + dH - ((v-min)/range) * dH;
  const pts = data.map((d,i) => `${px(i)},${py(d.v)}`).join(" ");
  const area = `${px(0)},${PY+dH} ${pts} ${px(n-1)},${PY+dH}`;
  const gid = `lg${color.replace(/\W/g,"")}`;
  const every = n > 7 ? Math.ceil(n/6) : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H+22}`} style={{width:"100%",height:"auto",display:"block",overflow:"visible"}}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" className="line-anim"/>
      {data.map((d,i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(d.v)} r={4} fill={color}/>
          <circle cx={px(i)} cy={py(d.v)} r={7} fill={color} opacity={0.12}/>
          {i%every===0 && (
            <text x={px(i)} y={H+16} textAnchor="middle" fontSize={8.5} fill="#8E8E93">{d.l}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

function DonutChart({ data }) {
  const COLORS = ["#5B4EFF","#22C55E","#F59E0B","#F43F5E","#A855F7","#3B82F6","#F97316"];
  const total = data.reduce((s,d) => s+d.v, 0) || 1;
  let cum = -90;
  const CX = 54, CY = 54, R = 44;
  const slices = data.map((d,i) => {
    const a = (d.v/total)*360;
    const s = cum*Math.PI/180; cum += a;
    const e = cum*Math.PI/180;
    const x1=CX+R*Math.cos(s),y1=CY+R*Math.sin(s);
    const x2=CX+R*Math.cos(e),y2=CY+R*Math.sin(e);
    return { path:`M${CX} ${CY}L${x1} ${y1}A${R} ${R} 0 ${a>180?1:0} 1 ${x2} ${y2}Z`,
      color:COLORS[i%COLORS.length], ...d };
  });
  return (
    <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
      <svg viewBox="0 0 108 108" style={{width:108,height:108,flexShrink:0}}>
        {slices.map((s,i)=>(
          <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2"
            style={{transition:"opacity 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.8"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}/>
        ))}
        <circle cx={CX} cy={CY} r={26} fill="currentColor"/>
        <text x={CX} y={CY+4} textAnchor="middle" fontSize={11} fontWeight="700" fill="currentColor" opacity="0.5">100%</text>
      </svg>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:6,minWidth:130}}>
        {slices.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:9,height:9,borderRadius:3,background:s.color,flexShrink:0}}/>
            <span style={{fontSize:12.5,color:"#8E8E93",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.l}</span>
            <span style={{fontSize:12.5,fontWeight:700,flexShrink:0}}>{s.v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FunnelChart({ data }) {
  const COLORS = ["#5B4EFF","#22C55E","#F59E0B","#F43F5E","#A855F7"];
  const maxV = data[0]?.v || 100;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {data.map((d,i) => {
        const pct = Math.min(100, (d.v/maxV)*100);
        const c = COLORS[i%COLORS.length];
        const raw = String(d.l||"");
        const label = raw.length > 24 ? raw.slice(0,23)+"…" : raw;
        return (
          <div key={i}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:12,color:"#8E8E93",maxWidth:"68%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>
              <span style={{fontSize:12,fontWeight:700,color:c}}>{d.v}%</span>
            </div>
            <div style={{width:"100%",height:22,background:"rgba(0,0,0,0.06)",borderRadius:7,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${c},${c}CC)`,
                borderRadius:7,transition:"width 1s cubic-bezier(0.16,1,0.3,1)"}}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── PARSE AI RESPONSE ──────────────────────────────────────── */
function parseAI(text) {
  // chips
  const chips = [];
  const cm = text.match(/<chips>([\s\S]*?)<\/chips>/);
  if (cm) { try { chips.push(...JSON.parse(cm[1].trim())); } catch {} }

  // chart
  let chart = null;
  const chm = text.match(/<chart type="([^"]+)" title="([^"]+)" color="([^"]*)">\s*([\s\S]*?)\s*<\/chart>/);
  if (chm) {
    try { chart = { type:chm[1], title:chm[2], color:chm[3]||"#5B4EFF", data:JSON.parse(chm[4]) }; }
    catch {}
  }

  const clean = text
    .replace(/<chips>[\s\S]*?<\/chips>/g,"")
    .replace(/<chart[\s\S]*?<\/chart>/g,"")
    .trim();

  return { body:clean, chips, chart };
}

/* ─── MARKDOWN RENDER ────────────────────────────────────────── */
const ri = (text, T) => {
  if (!text) return null;
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/).map((p,i) => {
    if (p.startsWith("**")&&p.endsWith("**")) return <strong key={i} style={{fontWeight:600,color:T.text}}>{p.slice(2,-2)}</strong>;
    if (p.startsWith("*") &&p.endsWith("*") ) return <em key={i}>{p.slice(1,-1)}</em>;
    if (p.startsWith("`") &&p.endsWith("`") ) return <code key={i} style={{background:T.accentSoft,color:T.accent,padding:"1px 6px",borderRadius:4,fontSize:"0.85em"}}>{p.slice(1,-1)}</code>;
    return <span key={i}>{p}</span>;
  });
};

function MdRender({ text, T }) {
  if (!text) return null;
  const lines = text.split("\n");
  const out = []; let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("## ")) {
      out.push(<div key={i} style={{fontSize:9.5,fontWeight:700,color:T.mute,textTransform:"uppercase",
        letterSpacing:"0.13em",marginTop:22,marginBottom:9}}>{l.slice(3)}</div>);
    } else if (l.startsWith("### ")) {
      out.push(<div key={i} style={{fontSize:14.5,fontWeight:600,color:T.text,marginTop:14,marginBottom:5,lineHeight:1.3}}>{ri(l.slice(4),T)}</div>);
    } else if (l.startsWith("- ")||l.startsWith("• ")) {
      const b=[]; while(i<lines.length&&(lines[i].startsWith("- ")||lines[i].startsWith("• "))){b.push(lines[i].replace(/^[-•] /,""));i++;}
      out.push(<div key={`ul${i}`} style={{margin:"6px 0"}}>
        {b.map((x,bi)=>(
          <div key={bi} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:6}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:T.accent,flexShrink:0,marginTop:8,opacity:0.6}}/>
            <span style={{fontSize:14,color:T.sub,lineHeight:1.65}}>{ri(x,T)}</span>
          </div>))}</div>);
      continue;
    } else if (l.match(/^\d+\. /)) {
      const nums=[]; const si=i;
      while(i<lines.length&&lines[i].match(/^\d+\. /)){nums.push(lines[i].replace(/^\d+\. /,""));i++;}
      out.push(<div key={`ol${si}`} style={{margin:"6px 0"}}>
        {nums.map((x,bi)=>(
          <div key={bi} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:6}}>
            <div style={{minWidth:22,height:22,borderRadius:"50%",background:T.accentSoft,color:T.accent,
              fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{bi+1}</div>
            <span style={{fontSize:14,color:T.sub,lineHeight:1.65}}>{ri(x,T)}</span>
          </div>))}</div>);
      continue;
    } else if (l.startsWith("---")) {
      out.push(<div key={i} style={{height:1,background:T.border,margin:"14px 0"}}/>);
    } else if (l.trim()==="") {
      out.push(<div key={i} style={{height:6}}/>);
    } else {
      out.push(<p key={i} style={{fontSize:14,color:T.sub,lineHeight:1.72,marginBottom:3}}>{ri(l,T)}</p>);
    }
    i++;
  }
  return <>{out}</>;
}

/* ─── STREAMING TEXT ─────────────────────────────────────────── */
function StreamText({ fullText, T, onComplete }) {
  const [shown, setShown] = useState("");
  const [done, setDone]   = useState(false);
  const iRef = useRef(null);

  useEffect(() => {
    if (!fullText) return;
    setShown(""); setDone(false);
    let pos = 0;
    iRef.current = setInterval(() => {
      pos = Math.min(pos + 8, fullText.length);
      setShown(fullText.slice(0, pos));
      if (pos >= fullText.length) {
        clearInterval(iRef.current);
        setDone(true);
        onComplete?.();
      }
    }, 14);
    return () => clearInterval(iRef.current);
  }, [fullText]);

  return (
    <div>
      <MdRender text={shown} T={T}/>
      {!done && <span className="cursor" style={{color:T.accent}}/>}
    </div>
  );
}

/* ─── SECTION CARD ───────────────────────────────────────────── */
function SCard({ label, accent, cls, T, children }) {
  return (
    <div className={`card ${cls||""}`} style={{
      background:T.card, border:`1px solid ${T.border}`,
      borderRadius:15, overflow:"hidden", boxShadow:T.sh}}>
      <div style={{padding:"9px 15px 8px",borderBottom:`1px solid ${T.border}`,
        display:"flex",alignItems:"center",gap:8,background:T.surface}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:accent||T.accent,flexShrink:0}}/>
        <span style={{fontSize:9.5,fontWeight:700,color:accent||T.mute,
          textTransform:"uppercase",letterSpacing:"0.12em"}}>{label}</span>
      </div>
      <div style={{padding:"15px 16px 16px"}}>{children}</div>
    </div>
  );
}

/* ─── CHART CARD ─────────────────────────────────────────────── */
function ChartCard({ chart, T }) {
  if (!chart) return null;
  return (
    <div className="card s4" style={{
      background:T.card, border:`1px solid ${T.border}`,
      borderRadius:15, padding:"16px 18px 14px", boxShadow:T.sh}}>
      <div style={{fontSize:9.5,fontWeight:700,color:T.mute,textTransform:"uppercase",
        letterSpacing:"0.12em",marginBottom:16}}>{chart.title}</div>
      <div style={{paddingBottom:2}}>
        {chart.type==="bar"    && <BarChart    data={chart.data} color={chart.color}/>}
        {chart.type==="line"   && <LineChart   data={chart.data} color={chart.color}/>}
        {chart.type==="donut"  && <DonutChart  data={chart.data}/>}
        {chart.type==="funnel" && <FunnelChart data={chart.data}/>}
      </div>
    </div>
  );
}

/* ─── THINKING BUBBLE ────────────────────────────────────────── */
function ThinkBubble({ T }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p+1) % THINKING_MSGS.length), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{background:T.card,borderRadius:15,padding:"14px 18px",
      border:`1px solid ${T.border}`,boxShadow:T.sh,
      display:"flex",alignItems:"center",gap:12}}>
      <div style={{display:"flex",gap:4,flexShrink:0}}>
        {[0,1,2].map(i=>(
          <div key={i} className="tkdot" style={{width:6,height:6,borderRadius:"50%",
            background:T.accent,animationDelay:`${i*0.18}s`}}/>
        ))}
      </div>
      <span key={idx} className="fade" style={{fontSize:13,color:T.mute,fontStyle:"italic"}}>
        {THINKING_MSGS[idx]}
      </span>
    </div>
  );
}

/* ─── FULL RESPONSE COMPONENT ────────────────────────────────── */
function FullResponse({ msg, isLast, onChip, T }) {
  const { aiBody, aiChart, aiChips, fresh, engineId } = msg;
  const [phase, setPhase] = useState(fresh ? "streaming" : "done");
  const eng = ENGINES.find(e => e.id === engineId);
  const accent = eng?.color || T.accent;

  // split body into ## sections
  const sections = [];
  let cur = { head:"", lines:[] };
  for (const line of (aiBody||"").split("\n")) {
    if (line.startsWith("## ")) {
      if (cur.head || cur.lines.some(l=>l.trim())) sections.push({...cur});
      cur = { head:line.slice(3), lines:[] };
    } else cur.lines.push(line);
  }
  if (cur.head || cur.lines.some(l=>l.trim())) sections.push(cur);

  const [speaking, setSpeaking] = useState(false);

  const readAloud = () => {
    if (speaking) { window.speechSynthesis?.cancel(); setSpeaking(false); return; }
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = (aiBody||"")
      .replace(/##+ ?/g,"").replace(/\*{1,3}/g,"")
      .replace(/`[^`]*`/g,"").replace(/<[^>]+>/g,"")
      .replace(/→/g,"").trim().slice(0, 700);
    const u = new SpeechSynthesisUtterance(clean);
    // pick female voice
    const voices = window.speechSynthesis.getVoices();
    const female = voices.find(v =>
      (v.name.toLowerCase().includes("female") ||
       v.name.toLowerCase().includes("samantha") ||
       v.name.toLowerCase().includes("victoria") ||
       v.name.toLowerCase().includes("karen") ||
       v.name.toLowerCase().includes("moira") ||
       v.name.toLowerCase().includes("fiona") ||
       v.name.toLowerCase().includes("veena") ||
       v.name.toLowerCase().includes("lekha") ||
       v.name.toLowerCase().includes("heera") ||
       v.name.toLowerCase().includes("zira")) && !v.name.toLowerCase().includes("male")
    ) || voices.find(v => v.lang.startsWith("en") && v.gender === "female")
      || voices.find(v => v.lang.startsWith("en-IN"))
      || voices.find(v => v.lang.startsWith("en"));
    if (female) u.voice = female;
    u.rate = 1.05; u.pitch = 1.05; u.lang = "en-IN";
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {sections.map((sec, si) => (
        <SCard key={si} label={sec.head||"System"} accent={accent} cls={`s${Math.min(si,6)}`} T={T}>
          {si === 0 && phase === "streaming"
            ? <StreamText fullText={sec.lines.join("\n")} T={T} onComplete={()=>setPhase("done")}/>
            : <MdRender   text={sec.lines.join("\n")} T={T}/>}
        </SCard>
      ))}

      {phase === "done" && aiChart && <ChartCard chart={aiChart} T={T}/>}

      {phase === "done" && isLast && aiChips?.length > 0 && (
        <div className="s5" style={{display:"flex",flexWrap:"wrap",gap:7,paddingTop:2}}>
          {aiChips.map((c,i) => (
            <button key={i} className="cin chip" onClick={()=>onChip(c)}
              style={{animationDelay:`${i*0.07}s`,padding:"7px 14px",borderRadius:99,
                fontSize:13,fontWeight:500,color:T.accent,background:T.accentSoft,
                border:`1px solid ${T.accentGlow}`}}
              onMouseEnter={e=>{e.currentTarget.style.background=T.accent;e.currentTarget.style.color="#fff";}}
              onMouseLeave={e=>{e.currentTarget.style.background=T.accentSoft;e.currentTarget.style.color=T.accent;}}>
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Read aloud button */}
      <button onClick={readAloud}
        style={{alignSelf:"flex-start",display:"flex",alignItems:"center",gap:6,padding:"5px 12px",
          borderRadius:99,fontSize:12,fontWeight:500,
          color:speaking?T.red:T.mute, background:T.surface, border:`1px solid ${T.border}`,
          transition:"all 0.15s"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=speaking?T.red:T.mute;}}>
        <SpeakIcon active={speaking}/>
        <span>{speaking ? "Stop" : "Read aloud"}</span>
      </button>
    </div>
  );
}

/* ─── ENGINE PICKER ──────────────────────────────────────────── */
function EngPicker({ onSelect, onClose, T }) {
  return (
    <div style={{position:"absolute",bottom:"calc(100% + 10px)",left:0,right:0,
      background:T.card,border:`1px solid ${T.borderSt}`,borderRadius:18,
      boxShadow:T.shLg,padding:10,zIndex:200,animation:"sub 0.22s ease both"}}>
      <div style={{fontSize:9.5,fontWeight:700,color:T.mute,letterSpacing:"0.12em",
        textTransform:"uppercase",padding:"3px 8px 10px"}}>Choose Engine</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
        {ENGINES.map(e=>(
          <button key={e.id} onClick={()=>{onSelect(e);onClose();}}
            style={{padding:"11px 8px",borderRadius:12,textAlign:"left",background:"transparent",
              transition:"all 0.15s",border:"1.5px solid transparent"}}
            onMouseEnter={el=>{el.currentTarget.style.background=`${e.color}13`;el.currentTarget.style.borderColor=`${e.color}40`;}}
            onMouseLeave={el=>{el.currentTarget.style.background="transparent";el.currentTarget.style.borderColor="transparent";}}>
            <div style={{fontSize:19,marginBottom:5,color:e.color}}>{e.icon}</div>
            <div style={{fontSize:12.5,fontWeight:700,color:T.text,marginBottom:2,letterSpacing:"-0.01em"}}>{e.label}</div>
            <div style={{fontSize:10,color:T.mute,lineHeight:1.35}}>{e.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function EngSugg({ engine, onSelect, T }) {
  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,
      padding:"14px 15px",marginBottom:10,boxShadow:T.sh,animation:"sub 0.22s ease both"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <span style={{fontSize:22,color:engine.color}}>{engine.icon}</span>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.text,letterSpacing:"-0.02em"}}>{engine.label}</div>
          <div style={{fontSize:11,color:T.mute}}>{engine.desc}</div>
        </div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {engine.s.map((s,i)=>(
          <button key={i} onClick={()=>onSelect(s)}
            style={{padding:"7px 13px",borderRadius:99,fontSize:13,fontWeight:500,
              color:T.sub,background:`${engine.color}0F`,border:`1px solid ${engine.color}28`,
              transition:"all 0.16s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=engine.color;e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${engine.color}0F`;e.currentTarget.style.color=T.sub;}}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── VOICE HOOK ─────────────────────────────────────────────── */
function useVoiceInput(onResult) {
  const [listening,  setListening]  = useState(false);
  const [supported,  setSupported]  = useState(false);
  const [permError,  setPermError]  = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) setSupported(true);
  }, []);

  const start = async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    // request mic permission explicitly
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setPermError(true);
      return;
    }

    if (recRef.current) { try { recRef.current.stop(); } catch {} }

    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "en-IN";

    r.onstart  = () => setListening(true);
    r.onerror  = () => { setListening(false); };
    r.onend    = () => setListening(false);
    r.onresult = (e) => {
      let final = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final.trim()) { onResult(final.trim()); setListening(false); r.stop(); }
    };

    recRef.current = r;
    try { r.start(); } catch {}
  };

  const stop = () => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  };

  const toggle = () => { if (listening) stop(); else start(); };
  return { listening, supported, permError, toggle };
}

/* ─── BUBBLE ─────────────────────────────────────────────────── */
function Bubble({ msg, isLast, onChip, T }) {
  const isUser = msg.role === "user";
  const eng    = ENGINES.find(e => e.id === msg.engineId);

  return (
    <div className="msg" style={{display:"flex",flexDirection:"column",
      alignItems:isUser?"flex-end":"flex-start",gap:5}}>
      {!isUser && eng && (
        <div style={{fontSize:11,color:eng.color,fontWeight:600,
          marginLeft:1,marginBottom:1,display:"flex",alignItems:"center",gap:5}}>
          <span>{eng.icon}</span><span>{eng.label} Engine</span>
        </div>
      )}
      <div style={{maxWidth:isUser?"72%":"100%",width:isUser?undefined:"100%"}}>
        {isUser ? (
          <div style={{background:T.userBg,borderRadius:"18px 18px 4px 18px",
            padding:"12px 16px",fontSize:14,color:T.userText,lineHeight:1.6,
            boxShadow:T.shMd}}>
            {msg.content}
          </div>
        ) : msg.thinking ? (
          <ThinkBubble T={T}/>
        ) : msg.aiBody ? (
          <FullResponse msg={msg} isLast={isLast} onChip={onChip} T={T}/>
        ) : (
          <div style={{background:T.card,borderRadius:"4px 18px 18px 18px",
            padding:"14px 18px",border:`1px solid ${T.border}`,boxShadow:T.sh}}>
            <MdRender text={msg.content||""} T={T}/>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────── */
export default function Corex() {
  const [dark,      setDark]      = useState(false);
  const [msgs,      setMsgs]      = useState([]);
  const [hist,      setHist]      = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [engine,    setEngine]    = useState(null);
  const [picker,    setPicker]    = useState(false);
  const [showSugg,  setShowSugg]  = useState(false);

  const bottomRef = useRef(null);
  const taRef     = useRef(null);
  const wrapRef   = useRef(null);

  const T = dark ? DARK : LIGHT;

  const { listening, supported: voiceSupported, permError, toggle: toggleVoice } =
    useVoiceInput((text) => { setInput(text); setTimeout(() => sendMsg(text), 300); });

  // resize textarea
  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = "auto";
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 160) + "px";
  }, [input]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  useEffect(() => {
    const h = e => { if (picker && wrapRef.current && !wrapRef.current.contains(e.target)) setPicker(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [picker]);

  // boot
  useEffect(() => {
    setMsgs([{
      role:"assistant", id:1, engineId:null, fresh:false,
      aiBody:`## Welcome to Corex ✦

I'm your Creative Operating System — for creators, brand managers, and marketers who want to move fast.

**What makes me different:**
- I give specific answers with real numbers — not generic tips
- I explain everything in plain, simple language
- I build systems you can execute today
- I know Indian market benchmarks, creator pricing, brand strategy, and growth math

## How to use me
Just ask anything. Creator pricing, Reel scripts, brand strategy, budget allocation, viral trends — I handle it all.

Or tap the **+** button to choose a specialised engine.`,
      aiChart: null,
      aiChips: ["What should I charge as a creator with 10K followers?","Give me 3 Reel ideas for this week","Build a content system for me","How do I grow from 0 followers?"],
    }]);
  }, []);

  /* ── SEND MESSAGE ── */
  const sendMsg = useCallback(async (rawInput) => {
    const raw = (rawInput ?? input).trim();
    if (!raw || loading) return;
    setInput(""); setShowSugg(false); setLoading(true);

    const uid = Date.now();
    setMsgs(prev => [...prev, { role:"user", id:uid, content:raw }]);

    const aid = uid + 1;
    setMsgs(prev => [...prev, { role:"assistant", id:aid, thinking:true, content:"", engineId:engine?.id }]);

    const enginePrefix = engine
      ? `[Context: User is using the ${engine.label} Engine for ${engine.desc}. Keep your answer focused on that.]\n\n`
      : "";
    const userMsg  = { role:"user", content: enginePrefix + raw };
    const newHist  = [...hist.slice(-10), userMsg]; // keep last 10 for context

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1400,
          system: SYSTEM_PROMPT,
          messages: newHist,
        }),
      });

      let fullText = "";

      if (res.ok) {
        const data = await res.json();
        fullText = data.content?.map(b => b.text || "").join("") || "";
      } else if (res.status === 429) {
        fullText = `## Slow down a little ⚡\n\nYou're sending messages really fast. Wait 10 seconds and try again.\n\n<chips>["Try again","Ask something else"]</chips>`;
      } else {
        const errText = await res.text().catch(() => "");
        fullText = `## Something went wrong\n\nError ${res.status}. ${errText ? "Details: " + errText.slice(0,200) : ""}\n\nTry refreshing and sending again.\n\n<chips>["Try again","Start fresh"]</chips>`;
      }

      const { body, chips, chart } = parseAI(fullText);

      setMsgs(prev => prev.map(m => m.id === aid ? {
        ...m,
        thinking: false,
        fresh: true,
        aiBody: body,
        aiChart: chart,
        aiChips: chips.length ? chips : ["Tell me more","Give me an example","What's the next step?"],
        content: "",
      } : m));

      setHist([...newHist, { role:"assistant", content:fullText }]);

    } catch (err) {
      const msg = err.message || "Unknown error";
      setMsgs(prev => prev.map(m => m.id === aid ? {
        ...m,
        thinking: false,
        fresh: false,
        aiBody: `## Connection issue\n\nCouldn't reach the AI. Check your internet connection and try again.\n\nError: ${msg}\n\n<chips>["Try again","Start fresh"]</chips>`,
        aiChart: null,
        aiChips: ["Try again"],
        content: "",
      } : m));
    }

    setLoading(false);
  }, [input, loading, hist, engine]);

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing) {
      e.preventDefault();
      if (input.trim() && !loading) sendMsg(input);
    }
  };

  const deliver = (text) => sendMsg(text);

  const newChat = () => {
    setMsgs([]); setHist([]); setInput("");
    setEngine(null); setShowSugg(false); setPicker(false);
    setTimeout(() => setMsgs([{
      role:"assistant", id:Date.now(), engineId:null, fresh:false,
      aiBody:`## Fresh start ✦\n\nWhat are we building? Tell me your niche, goal, or what's not working — and I'll build you a system.\n\n**Examples:**\n- "I have 10K followers, what should I charge for brand deals?"\n- "Give me 3 Reel ideas for my fitness brand"\n- "How do I allocate a ₹1L marketing budget?"\n- "Write me a full Reel script for Instagram"`,
      aiChart:null,
      aiChips:["Brand strategy","Content system","Growth plan","Reel ideas","Creator pricing","Viral trend"],
    }]), 100);
  };

  const lastIdx = msgs.length - 1;

  return (
    <>
      <style>{CSS}</style>
      <div className="cx-grain" style={{display:"flex",flexDirection:"column",height:"100vh",
        background:T.bg,color:T.text,transition:"background 0.3s,color 0.3s"}}>

        {/* ══ TOP BAR ══ */}
        <div style={{height:56,flexShrink:0,display:"flex",alignItems:"center",
          justifyContent:"space-between",padding:"0 18px",
          background:T.glass, backdropFilter:"blur(28px) saturate(180%)",
          WebkitBackdropFilter:"blur(28px) saturate(180%)",
          borderBottom:`1px solid ${T.border}`, zIndex:100}}>

          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:10,flexShrink:0,
              background:`linear-gradient(135deg,${T.accent} 0%,#A78BFA 100%)`,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:`0 2px 14px ${T.accentGlow}`}}>
              <span style={{fontFamily:"Syne,sans-serif",fontSize:15,fontWeight:800,color:"#fff",letterSpacing:"-0.06em"}}>C</span>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:T.text,letterSpacing:"-0.04em",fontFamily:"Syne,sans-serif",lineHeight:1}}>Corex</div>
              <div style={{fontSize:8.5,color:T.mute,letterSpacing:"0.08em",textTransform:"uppercase",lineHeight:1,marginTop:2}}>Creative OS</div>
            </div>
            {engine && (
              <div style={{display:"flex",alignItems:"center",gap:5,marginLeft:5}}>
                <span style={{color:T.mute,fontSize:10}}>·</span>
                <span style={{fontSize:12.5,color:engine.color,fontWeight:600}}>{engine.icon} {engine.label}</span>
                <button onClick={()=>{setEngine(null);setShowSugg(false);}}
                  style={{fontSize:9,color:T.mute,padding:"1px 5px",borderRadius:99,
                    border:`1px solid ${T.border}`,marginLeft:2,lineHeight:1.7}}>✕</button>
              </div>
            )}
          </div>

          {/* Right controls */}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginRight:4}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#22C55E",
                boxShadow:"0 0 7px #22C55E"}}/>
              <span style={{fontSize:11,color:T.mute,fontWeight:500}}>Live</span>
            </div>

            {/* Dark mode toggle */}
            <button onClick={()=>setDark(d=>!d)}
              style={{width:50,height:28,borderRadius:99,position:"relative",
                background:dark?T.accent:"rgba(0,0,0,0.08)",border:"none",
                transition:"background 0.3s",cursor:"pointer"}}>
              <div style={{position:"absolute",top:3,left:dark?24:3,width:22,height:22,borderRadius:"50%",
                background:"#fff",boxShadow:"0 1px 5px rgba(0,0,0,0.22)",
                transition:"left 0.28s cubic-bezier(0.34,1.56,0.64,1)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>
                {dark?"🌙":"☀️"}
              </div>
            </button>

            <button onClick={newChat}
              style={{fontSize:12.5,fontWeight:600,color:T.sub,padding:"6px 13px",borderRadius:99,
                border:`1px solid ${T.border}`,background:T.card,
                transition:"all 0.15s",letterSpacing:"-0.01em"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.sub;}}>
              New chat
            </button>
          </div>
        </div>

        {/* ══ MESSAGES ══ */}
        <div style={{flex:1,overflowY:"auto",padding:"28px 0 12px"}}>
          <div style={{maxWidth:700,margin:"0 auto",padding:"0 18px",
            display:"flex",flexDirection:"column",gap:22}}>
            {msgs.map((msg,idx)=>(
              <Bubble key={msg.id} msg={msg} isLast={idx===lastIdx} onChip={deliver} T={T}/>
            ))}
            <div ref={bottomRef}/>
          </div>
        </div>

        {/* ══ INPUT AREA ══ */}
        <div style={{flexShrink:0,padding:"8px 18px 20px",
          background:T.glass, backdropFilter:"blur(28px)",
          WebkitBackdropFilter:"blur(28px)",
          borderTop:`1px solid ${T.border}`}}>
          <div style={{maxWidth:700,margin:"0 auto",position:"relative"}} ref={wrapRef}>

            {picker && <EngPicker onSelect={e=>{setEngine(e);setShowSugg(true);}} onClose={()=>setPicker(false)} T={T}/>}
            {showSugg && engine && <EngSugg engine={engine} onSelect={s=>{setShowSugg(false);sendMsg(s);}} T={T}/>}

            {/* perm error banner */}
            {permError && (
              <div style={{padding:"8px 12px",borderRadius:9,background:T.redSoft,
                border:`1px solid ${T.red}30`,fontSize:12,color:T.red,marginBottom:8}}>
                🎤 Microphone access denied. Allow microphone in your browser settings and refresh.
              </div>
            )}

            {/* voice listening indicator */}
            {listening && (
              <div style={{padding:"8px 14px",borderRadius:10,background:T.card,
                border:`1.5px solid rgba(244,63,94,0.4)`,
                fontSize:13,color:"#F43F5E",fontWeight:500,marginBottom:8,
                display:"flex",alignItems:"center",gap:8}}>
                <div className="tkdot" style={{width:8,height:8,borderRadius:"50%",background:"#F43F5E"}}/>
                Listening… speak now
              </div>
            )}

            {/* main input box */}
            <div style={{display:"flex",alignItems:"flex-end",gap:7,
              background:T.card, borderRadius:20,
              border:`1.5px solid ${T.borderSt}`,
              padding:"8px 8px 8px 8px",
              boxShadow:T.shMd,
              transition:"box-shadow 0.2s,border-color 0.2s"}}
              onFocusCapture={e=>{e.currentTarget.style.boxShadow=`0 0 0 4px ${T.accentGlow}`;e.currentTarget.style.borderColor=T.accent;}}
              onBlurCapture={e=>{e.currentTarget.style.boxShadow=T.shMd;e.currentTarget.style.borderColor=T.borderSt;}}>

              {/* + engine picker */}
              <button onClick={e=>{e.stopPropagation();setPicker(p=>!p);setShowSugg(false);}}
                title="Choose an engine"
                style={{width:38,height:38,borderRadius:12,flexShrink:0,display:"flex",
                  alignItems:"center",justifyContent:"center",
                  background:picker?T.accentSoft:(engine?`${engine.color}13`:T.surface),
                  color:picker?T.accent:(engine?engine.color:T.mute),
                  border:`1.5px solid ${picker?T.accent+"55":"transparent"}`,
                  transition:"all 0.16s",
                  fontSize:engine?17:21,fontWeight:200}}>
                {engine ? engine.icon : "+"}
              </button>

              {/* textarea */}
              <textarea ref={taRef} value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={listening ? "Listening… speak now" : (engine ? `Ask ${engine.label} anything…` : "Ask anything — Reel ideas, pricing, brand strategy, growth…")}
                rows={1} disabled={loading}
                style={{flex:1,resize:"none",border:"none",background:"transparent",
                  fontSize:14,color:T.text,lineHeight:1.55,maxHeight:160,overflowY:"auto",
                  paddingTop:6,paddingLeft:4,letterSpacing:"-0.01em"}}/>

              {/* mic button */}
              {voiceSupported && (
                <button onClick={toggleVoice}
                  title={listening ? "Stop listening" : "Speak your question"}
                  className={listening ? "mic-on" : ""}
                  style={{width:38,height:38,borderRadius:12,flexShrink:0,display:"flex",
                    alignItems:"center",justifyContent:"center",
                    background:listening?"rgba(244,63,94,0.12)":T.surface,
                    border:`1.5px solid ${listening?"rgba(244,63,94,0.45)":"transparent"}`,
                    transition:"all 0.18s"}}>
                  <MicIcon active={listening} color={T.mute} size={17}/>
                </button>
              )}

              {/* send */}
              <button onClick={()=>{if(input.trim()&&!loading)sendMsg(input);}}
                disabled={!input.trim()||loading}
                title="Send"
                style={{width:38,height:38,borderRadius:12,flexShrink:0,display:"flex",
                  alignItems:"center",justifyContent:"center",
                  background:input.trim()&&!loading?T.accent:T.surface,
                  border:`1.5px solid ${input.trim()&&!loading?T.accent+"70":"transparent"}`,
                  boxShadow:input.trim()&&!loading?`0 2px 14px ${T.accentGlow}`:"none",
                  transition:"all 0.18s"}}
                onMouseEnter={e=>{if(input.trim()&&!loading){e.currentTarget.style.opacity="0.88";e.currentTarget.style.transform="scale(1.05)";}}}
                onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="scale(1)";}}>
                {loading
                  ? <div style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",
                      borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
                  : <SendIcon color={input.trim()&&!loading?"#fff":T.mute}/>}
              </button>
            </div>

            {/* hint bar */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",
              gap:12,marginTop:8,fontSize:11,color:T.mute}}>
              <span>
                <kbd style={{background:T.surface,padding:"1px 5px",borderRadius:4,
                  fontSize:10,border:`1px solid ${T.border}`}}>↵</kbd> send
              </span>
              {voiceSupported && (
                <span style={{display:"flex",alignItems:"center",gap:4}}>
                  <MicIcon active={false} color={T.mute} size={12}/> speak
                </span>
              )}
              <span>tap <b style={{color:T.sub,fontWeight:700}}>+</b> for engines</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
