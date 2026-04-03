import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useAuth } from "./Auth";
import Login from "./Login";
import Signup from "./Signup";

/* ─── ENGINES ──────────────────────────────────────────────────── */
const ENGINES = [
  { id: "narrative", icon: "◈", label: "Narrative", color: "#F97316", desc: "Brand & positioning",
    s: ["Write my brand positioning", "Define my tone of voice", "Build messaging pillars", "Write a tagline"] },
  { id: "content",   icon: "◫", label: "Content",   color: "#3B82F6", desc: "Content & hooks",
    s: ["Build my content system", "Generate 10 hooks", "Write a Reel script", "Plan content calendar"] },
  { id: "growth",    icon: "◬", label: "Growth",    color: "#22C55E", desc: "Budget & channels",
    s: ["Build growth strategy", "Allocate ₹50,000 budget", "Set my KPIs", "Calculate my CAC"] },
  { id: "experience",icon: "◉", label: "Experience",color: "#A855F7", desc: "Funnel & journey",
    s: ["Map my customer journey", "Fix conversion rate", "Design my sales funnel", "Audit landing page"] },
  { id: "trend",     icon: "✦", label: "Trend",     color: "#F43F5E", desc: "Viral & culture",
    s: ["Create a viral trend", "Give me 3 Reel ideas", "Hijack a cultural moment", "Build viral campaign"] },
  { id: "creator",   icon: "⬡", label: "Creator",   color: "#F59E0B", desc: "Reels & money",
    s: ["What should I charge brands?", "Write a Reel script", "Build creator flywheel", "Launch digital product"] },
];

const THINKING = [
  "Building your system…",
  "Thinking the 19twentys way…",
  "Pulling the sharpest strategy…",
  "Cutting through the noise…",
  "Channelling Hormozi × Seth Godin…",
  "Running the growth engine…",
  "Applying creator intelligence…",
  "Finding the real insight…",
  "No fluff — just signal…",
  "Checking what works in 2025…",
];

const SUGGESTIONS = [
  "What should I charge as a creator with 10K followers?",
  "Give me 3 Reel ideas for this week",
  "Build my content system from scratch",
  "How do I grow from 0 followers?",
  "Write a full Reel script for Instagram",
  "How do I allocate a ₹1L marketing budget?",
  "Create a viral trend for my brand",
  "Map my customer journey end to end",
];

const CHART_COLORS = ["#7C6FFF", "#22C55E", "#F59E0B", "#F43F5E", "#A855F7", "#3B82F6", "#F97316"];

/* ─── GRAPH PARSER ─────────────────────────────────────────────── */
function parseGraphLine(line) {
  // "Graph: Reels: 20000 Stories: 15000 Posts: 12000"
  const withoutPrefix = line.replace(/^Graph:\s*/i, "");
  const regex = /([A-Za-z0-9 %₹\/\-]+):\s*(\d[\d,]*)/g;
  const data = [];
  let m;
  while ((m = regex.exec(withoutPrefix)) !== null) {
    data.push({ name: m[1].trim(), value: parseInt(m[2].replace(/,/g, ""), 10) });
  }
  return data.length >= 2 ? data : null;
}

/* ─── RECHARTS TOOLTIP ─────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(18,18,20,0.95)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FAFAF9",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#7C6FFF" }}>{payload[0].value?.toLocaleString()}</div>
    </div>
  );
};

/* ─── RESPONSE RENDERER ────────────────────────────────────────── */
function ResponseRenderer({ text, T }) {
  const lines = text.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { heading: line.slice(3).trim(), content: [], graphData: null };
    } else if (line.match(/^Graph:/i) && current) {
      const parsed = parseGraphLine(line);
      if (parsed) current.graphData = parsed;
    } else if (line.startsWith("Chips:") || line.startsWith("chips:")) {
      // skip — handled separately
    } else if (current) {
      current.content.push(line);
    }
  }
  if (current) sections.push(current);

  const SECTION_ICONS = {
    "What To Do": { icon: "→", color: "#22C55E" },
    "How To Do It": { icon: "#", color: "#3B82F6" },
    "When To Do It": { icon: "◷", color: "#F59E0B" },
    "Why It Works": { icon: "✦", color: "#A855F7" },
    "Real Example": { icon: "◉", color: "#F97316" },
    "Data / Graph": { icon: "◎", color: "#7C6FFF" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {sections.map((sec, i) => {
        const meta = SECTION_ICONS[sec.heading] || { icon: "▸", color: T.accent };
        const bodyText = sec.content.join("\n").trim();

        return (
          <div key={i} className="cx-section" style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: T.sh,
            animation: `fadeUp 0.3s ${i * 0.06}s cubic-bezier(0.16,1,0.3,1) both`,
          }}>
            {/* Section header */}
            <div style={{
              padding: "9px 16px 8px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", gap: 8,
              background: T.surface,
            }}>
              <span style={{ fontSize: 12, color: meta.color, fontWeight: 700 }}>{meta.icon}</span>
              <span style={{
                fontSize: 9.5, fontWeight: 700, color: meta.color,
                textTransform: "uppercase", letterSpacing: "0.12em",
              }}>{sec.heading}</span>
            </div>

            {/* Section body */}
            <div style={{ padding: "14px 16px 15px" }}>
              {bodyText && (
                <div className="cx-md">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.72, marginBottom: 8 }}>{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong style={{ fontWeight: 600, color: T.text }}>{children}</strong>
                      ),
                      em: ({ children }) => <em style={{ fontStyle: "italic" }}>{children}</em>,
                      ul: ({ children }) => (
                        <ul style={{ listStyle: "none", padding: 0, margin: "6px 0" }}>{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol style={{ listStyle: "none", padding: 0, margin: "6px 0" }}>{children}</ol>
                      ),
                      li: ({ children, ordered, index }) => (
                        <li style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
                          {ordered ? (
                            <span style={{
                              minWidth: 22, height: 22, borderRadius: "50%",
                              background: T.accentSoft, color: T.accent,
                              fontSize: 11, fontWeight: 700, display: "flex",
                              alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                            }}>{(index || 0) + 1}</span>
                          ) : (
                            <span style={{
                              width: 5, height: 5, borderRadius: "50%",
                              background: T.accent, flexShrink: 0, marginTop: 8, opacity: 0.6,
                            }} />
                          )}
                          <span style={{ fontSize: 14, color: T.sub, lineHeight: 1.65 }}>{children}</span>
                        </li>
                      ),
                      code: ({ children }) => (
                        <code style={{
                          background: T.accentSoft, color: T.accent,
                          padding: "1px 6px", borderRadius: 4, fontSize: "0.85em",
                        }}>{children}</code>
                      ),
                      h3: ({ children }) => (
                        <h3 style={{ fontSize: 14.5, fontWeight: 600, color: T.text, marginTop: 12, marginBottom: 5 }}>{children}</h3>
                      ),
                    }}
                  >
                    {bodyText}
                  </ReactMarkdown>
                </div>
              )}

              {/* Chart */}
              {sec.graphData && (
                <div style={{ marginTop: bodyText ? 16 : 0 }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={sec.graphData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                      barCategoryGap="35%">
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#636260", fontFamily: "Inter" }}
                        axisLine={false} tickLine={false}
                        interval={0}
                        angle={sec.graphData.length > 4 ? -30 : 0}
                        textAnchor={sec.graphData.length > 4 ? "end" : "middle"}
                        height={sec.graphData.length > 4 ? 50 : 30}
                      />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {sec.graphData.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── PARSE CHIPS ──────────────────────────────────────────────── */
function parseChips(text) {
  const match = text.match(/^Chips:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\|\s*"([^"]+)"/m);
  if (match) return [match[1], match[2], match[3]];
  return [];
}

/* ─── COPY BUTTON ──────────────────────────────────────────────── */
function CopyBtn({ text, T }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "5px 11px", borderRadius: 99, fontSize: 11.5, fontWeight: 500,
      color: copied ? T.green : T.mute, background: T.surface,
      border: `1px solid ${T.border}`, cursor: "pointer", transition: "all 0.15s",
    }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

/* ─── THINKING BUBBLE ──────────────────────────────────────────── */
function ThinkingBubble({ T }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % THINKING.length), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      background: T.card, borderRadius: 15, padding: "14px 18px",
      border: `1px solid ${T.border}`, boxShadow: T.sh,
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: T.accent,
            animation: `dotBounce 1.2s ease ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
      <span key={idx} style={{ fontSize: 13, color: T.mute, fontStyle: "italic", animation: "fadeIn 0.4s ease" }}>
        {THINKING[idx]}
      </span>
    </div>
  );
}

/* ─── BUBBLE ───────────────────────────────────────────────────── */
function Bubble({ msg, isLast, onChip, onRegen, T }) {
  const isUser = msg.role === "user";
  const chips  = !isUser && isLast ? parseChips(msg.content || "") : [];
  const eng    = ENGINES.find(e => e.id === msg.engineId);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      gap: 5, animation: "fadeUp 0.38s cubic-bezier(0.16,1,0.3,1) both",
    }}>
      {!isUser && eng && (
        <div style={{ fontSize: 11, color: eng.color, fontWeight: 600, marginLeft: 1, marginBottom: 1 }}>
          {eng.icon} {eng.label} Engine
        </div>
      )}
      <div style={{ maxWidth: isUser ? "70%" : "100%", width: isUser ? undefined : "100%" }}>
        {isUser ? (
          <div style={{
            background: T.userBg, borderRadius: "18px 18px 4px 18px",
            padding: "12px 16px", fontSize: 14, color: T.userText,
            lineHeight: 1.6, boxShadow: T.shMd,
          }}>
            {msg.content}
          </div>
        ) : msg.thinking ? (
          <ThinkingBubble T={T} />
        ) : (
          <div>
            <ResponseRenderer text={msg.content || ""} T={T} />

            {/* chips */}
            {chips.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
                {chips.map((c, i) => (
                  <button key={i} onClick={() => onChip(c)} style={{
                    padding: "7px 14px", borderRadius: 99, fontSize: 13,
                    fontWeight: 500, color: T.accent, background: T.accentSoft,
                    border: `1px solid ${T.accentGlow}`, cursor: "pointer",
                    transition: "all 0.18s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.accentSoft; e.currentTarget.style.color = T.accent; }}>
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* action row */}
            {isLast && !msg.thinking && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <CopyBtn text={msg.content || ""} T={T} />
                <button onClick={onRegen} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 11px", borderRadius: 99, fontSize: 11.5, fontWeight: 500,
                  color: T.mute, background: T.surface, border: `1px solid ${T.border}`,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.color = T.mute; e.currentTarget.style.borderColor = T.border; }}>
                  ↺ Regenerate
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ENGINE PICKER ────────────────────────────────────────────── */
function EnginePicker({ onSelect, onClose, T }) {
  return (
    <div style={{
      position: "absolute", bottom: "calc(100% + 10px)", left: 0, right: 0,
      background: T.card, border: `1px solid ${T.borderSt}`, borderRadius: 18,
      boxShadow: T.shLg, padding: 10, zIndex: 200, animation: "fadeUp 0.2s ease both",
    }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: T.mute, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px 10px" }}>
        Choose Engine
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
        {ENGINES.map(e => (
          <button key={e.id} onClick={() => { onSelect(e); onClose(); }} style={{
            padding: "11px 8px", borderRadius: 12, textAlign: "left",
            background: "transparent", transition: "all 0.15s", border: "1.5px solid transparent",
            cursor: "pointer",
          }}
            onMouseEnter={el => { el.currentTarget.style.background = `${e.color}13`; el.currentTarget.style.borderColor = `${e.color}40`; }}
            onMouseLeave={el => { el.currentTarget.style.background = "transparent"; el.currentTarget.style.borderColor = "transparent"; }}>
            <div style={{ fontSize: 19, marginBottom: 5, color: e.color }}>{e.icon}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, marginBottom: 2, letterSpacing: "-0.01em" }}>{e.label}</div>
            <div style={{ fontSize: 10, color: T.mute, lineHeight: 1.35 }}>{e.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function EngineSugg({ engine, onSelect, T }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
      padding: "14px 15px", marginBottom: 10, boxShadow: T.sh,
      animation: "fadeUp 0.22s ease both",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 22, color: engine.color }}>{engine.icon}</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>{engine.label}</div>
          <div style={{ fontSize: 11, color: T.mute }}>{engine.desc}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {engine.s.map((s, i) => (
          <button key={i} onClick={() => onSelect(s)} style={{
            padding: "7px 13px", borderRadius: 99, fontSize: 13, fontWeight: 500,
            color: T.sub, background: `${engine.color}0F`, border: `1px solid ${engine.color}28`,
            cursor: "pointer", transition: "all 0.16s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = engine.color; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${engine.color}0F`; e.currentTarget.style.color = T.sub; }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── SEND ICON ────────────────────────────────────────────────── */
const SendIcon = ({ color = "#fff" }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MicIcon = ({ active, color = "#636260", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="8.5" y="1.5" width="7" height="13" rx="3.5" fill={active ? "#F43F5E" : color} />
    <path d="M4.5 11.5C4.5 15.64 7.86 19 12 19C16.14 19 19.5 15.64 19.5 11.5" stroke={active ? "#F43F5E" : color} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="12" y1="19" x2="12" y2="23" stroke={active ? "#F43F5E" : color} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="9" y1="23" x2="15" y2="23" stroke={active ? "#F43F5E" : color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/* ─── MAIN APP ─────────────────────────────────────────────────── */
export default function CorexApp() {
  const { user, loading: authLoading, logout } = useAuth();
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"

  const [msgs,     setMsgs]     = useState([]);
  const [hist,     setHist]     = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [engine,   setEngine]   = useState(null);
  const [picker,   setPicker]   = useState(false);
  const [showSugg, setShowSugg] = useState(false);
  const [listening,setListening]= useState(false);
  const [voiceOk,  setVoiceOk]  = useState(false);
  const [lastUser, setLastUser] = useState("");

  const bottomRef = useRef(null);
  const taRef     = useRef(null);
  const wrapRef   = useRef(null);
  const recRef    = useRef(null);

  const T = {
    bg: "#0C0C0D", surface: "#111113", card: "#18181B",
    border: "rgba(255,255,255,0.07)", borderSt: "rgba(255,255,255,0.12)",
    text: "#FAFAF9", sub: "#A09F9C", mute: "#616060",
    accent: "#7C6FFF", accentSoft: "rgba(124,111,255,0.11)", accentGlow: "rgba(124,111,255,0.25)",
    green: "#4ADE80", greenSoft: "rgba(74,222,128,0.09)",
    red: "#FB7185", redSoft: "rgba(251,113,133,0.09)",
    userBg: "#7C6FFF", userText: "#FFF",
    sh: "0 1px 2px rgba(0,0,0,0.4),0 4px 16px rgba(0,0,0,0.35)",
    shMd: "0 4px 24px rgba(0,0,0,0.5)",
    shLg: "0 16px 56px rgba(0,0,0,0.65)",
  };

  // voice setup
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) setVoiceOk(true);
  }, []);

  // resize textarea
  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = "auto";
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 160) + "px";
  }, [input]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    const h = e => { if (picker && wrapRef.current && !wrapRef.current.contains(e.target)) setPicker(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [picker]);

  // boot
  useEffect(() => {
    if (user) {
      setMsgs([{
        role: "assistant", id: 1, thinking: false, engineId: null,
        content: `## What To Do\nStart by asking me anything about your brand, content, growth, or creator strategy.\n\n## How To Do It\n- Type your question below\n- Or tap **+** to choose a specialised engine\n- Or click a suggestion below\n\n## When To Do It\nRight now. Every question gets a full system, not just tips.\n\n## Why It Works\nI'm trained on deep marketing knowledge — real brands, real numbers, real strategies that work in 2025.\n\n## Real Example\nRanveer Allahbadia started with zero. By asking the right questions about content positioning early, he built a ₹100Cr+ brand.\n\n## Data / Graph\nGraph: Brand Strategy: 89 Content Systems: 82 Growth Planning: 78 Creator Revenue: 75\n\nChips: "What should I charge as a creator?" | "Give me 3 Reel ideas" | "Build my content system"`,
      }]);
    }
  }, [user]);

  const sendMsg = useCallback(async (rawInput) => {
    const raw = (rawInput ?? input).trim();
    if (!raw || loading) return;
    setInput(""); setShowSugg(false); setLoading(true);
    setLastUser(raw);

    const uid = Date.now();
    setMsgs(prev => [...prev, { role: "user", id: uid, content: raw }]);
    const aid = uid + 1;
    setMsgs(prev => [...prev, { role: "assistant", id: aid, thinking: true, content: "", engineId: engine?.id }]);

    const prefix = engine ? `[User is in the ${engine.label} Engine for ${engine.desc}. Focus on that.]\n\n` : "";
    const userMsg = { role: "user", content: prefix + raw };
    const newHist = [...hist.slice(-12), userMsg];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: raw }),
      });

      let text = "";
      if (res.ok) {
        const data = await res.json();
        text = data.reply || "";
      } else if (res.status === 429) {
        text = `## What To Do\nWait 10 seconds then try again.\n\n## Why It Works\nYou've sent messages too fast. The system needs a moment.\n\n## Data / Graph\nGraph: Wait: 10\n\nChips: "Try again" | "Ask something else" | "New topic"`;
      } else {
        const err = await res.text().catch(() => "");
        text = `## What To Do\nRefresh the page and try again.\n\n## Why It Works\nA server error occurred.\n\n## Data / Graph\nGraph: Error: 1\n\nChips: "Try again" | "New chat" | "Different question"`;
        console.error("API error:", res.status, err);
      }

      setMsgs(prev => prev.map(m => m.id === aid ? { ...m, thinking: false, content: text } : m));
      setHist([...newHist, { role: "assistant", content: text }]);
    } catch (err) {
      const text = `## What To Do\nCheck your internet and try again.\n\n## Why It Works\nConnection issue — not your fault.\n\n## Data / Graph\nGraph: Retry: 1\n\nChips: "Try again" | "New chat" | "Different question"`;
      setMsgs(prev => prev.map(m => m.id === aid ? { ...m, thinking: false, content: text } : m));
    }

    setLoading(false);
  }, [input, loading, hist, engine]);

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing) {
      e.preventDefault();
      if (input.trim() && !loading) sendMsg(input);
    }
  };

  const handleRegen = () => { if (lastUser) sendMsg(lastUser); };

  const toggleVoice = async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (listening) { recRef.current?.stop(); setListening(false); return; }

    try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { return; }

    const r = new SR();
    r.continuous = false; r.interimResults = true; r.lang = "en-IN";
    r.onstart  = () => setListening(true);
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    r.onresult = e => {
      let final = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final.trim()) { setInput(final.trim()); r.stop(); setTimeout(() => sendMsg(final.trim()), 300); }
    };
    recRef.current = r;
    r.start();
  };

  const newChat = () => {
    setMsgs([]); setHist([]); setInput("");
    setEngine(null); setShowSugg(false); setPicker(false);
    setTimeout(() => setMsgs([{
      role: "assistant", id: Date.now(), thinking: false, engineId: null,
      content: `## What To Do\nAsk me anything — brand strategy, Reel ideas, creator pricing, growth plans.\n\n## How To Do It\n- Type your question\n- Or tap **+** for a specialised engine\n- Share your niche, numbers, and goal for personalised advice\n\n## When To Do It\nNow. Every message gets a full structured system.\n\n## Why It Works\nPersonalised strategy beats generic advice every time.\n\n## Real Example\nMamaEarth grew from 0 to ₹2,000Cr by focusing on one positioning: toxin-free baby products. One clear strategy.\n\n## Data / Graph\nGraph: Clear Strategy: 94 Generic Advice: 23\n\nChips: "Brand strategy" | "Reel ideas" | "Creator pricing"`,
    }]), 100);
  };

  const lastIdx = msgs.length - 1;

  // ── AUTH WALL ──
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0C0C0D", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 20, height: 20, border: "2px solid rgba(124,111,255,0.3)", borderTopColor: "#7C6FFF", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!user) {
    return authMode === "login"
      ? <Login onSwitch={() => setAuthMode("signup")} />
      : <Signup onSwitch={() => setAuthMode("login")} />;
  }

  // ── MAIN UI ──
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0C0C0D;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:99px}
        textarea,button,input{font-family:inherit}
        button:focus,textarea:focus{outline:none}
        button{cursor:pointer;border:none;background:none;padding:0}
        textarea::placeholder{color:rgba(255,255,255,0.25)}

        @keyframes fadeUp  {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
        @keyframes spin    {to{transform:rotate(360deg)}}
        @keyframes dotBounce{0%,80%,100%{transform:scale(0.45);opacity:0.15}40%{transform:scale(1);opacity:1}}
        @keyframes breathe {0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,0.5)}70%{box-shadow:0 0 0 9px rgba(244,63,94,0)}}

        .cx-grain::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9998;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size:200px;opacity:0.45;}

        .cx-section:hover{box-shadow:0 4px 24px rgba(124,111,255,0.1)!important}
        .cx-md p:last-child{margin-bottom:0}

        @keyframes listening{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
      `}</style>

      <div className="cx-grain" style={{
        display: "flex", flexDirection: "column", height: "100vh",
        background: T.bg, color: T.text,
      }}>

        {/* ═══ TOPBAR ═══ */}
        <div style={{
          height: 56, flexShrink: 0, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 20px",
          background: "rgba(12,12,13,0.94)",
          backdropFilter: "blur(28px) saturate(180%)",
          borderBottom: `1px solid ${T.border}`, zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg,#7C6FFF,#A78BFA)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 800, color: "#fff",
              fontFamily: "'Syne',sans-serif", letterSpacing: "-0.06em",
              boxShadow: "0 2px 14px rgba(124,111,255,0.4)",
            }}>C</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: "'Syne',sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}>Corex</div>
              <div style={{ fontSize: 8.5, color: T.mute, textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1, marginTop: 2 }}>Creative OS</div>
            </div>
            {engine && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 6 }}>
                <span style={{ color: T.mute, fontSize: 10 }}>·</span>
                <span style={{ fontSize: 12.5, color: engine.color, fontWeight: 600 }}>{engine.icon} {engine.label}</span>
                <button onClick={() => { setEngine(null); setShowSugg(false); }} style={{ fontSize: 9, color: T.mute, padding: "1px 5px", borderRadius: 99, border: `1px solid ${T.border}`, marginLeft: 2, lineHeight: 1.7 }}>✕</button>
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 7px #22C55E" }} />
              <span style={{ fontSize: 11, color: T.mute }}>Live</span>
            </div>
            <div style={{ fontSize: 12.5, color: T.sub, fontWeight: 500 }}>
              {user.name?.split(" ")[0]}
            </div>
            <button onClick={newChat} style={{
              fontSize: 12.5, fontWeight: 600, color: T.sub, padding: "6px 13px",
              borderRadius: 99, border: `1px solid ${T.border}`, background: T.card,
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.sub; }}>
              New
            </button>
            <button onClick={logout} style={{
              fontSize: 12.5, fontWeight: 500, color: T.mute, padding: "6px 12px",
              borderRadius: 99, border: `1px solid ${T.border}`, background: "transparent",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = T.red; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.mute; e.currentTarget.style.borderColor = T.border; }}>
              Sign out
            </button>
          </div>
        </div>

        {/* ═══ MESSAGES ═══ */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 0 16px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", flexDirection: "column", gap: 22 }}>

            {/* Suggestions (empty state) */}
            {msgs.length <= 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMsg(s)} style={{
                    padding: "8px 14px", borderRadius: 99, fontSize: 13, fontWeight: 450,
                    color: T.sub, background: T.card, border: `1px solid ${T.border}`,
                    cursor: "pointer", transition: "all 0.16s",
                    animation: `fadeIn 0.4s ${i * 0.05}s ease both`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; e.currentTarget.style.background = T.accentSoft; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.sub; e.currentTarget.style.background = T.card; }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {msgs.map((msg, idx) => (
              <Bubble key={msg.id} msg={msg} isLast={idx === lastIdx}
                onChip={sendMsg} onRegen={handleRegen} T={T} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* ═══ INPUT BAR ═══ */}
        <div style={{
          flexShrink: 0, padding: "8px 20px 20px",
          background: "rgba(12,12,13,0.94)",
          backdropFilter: "blur(28px)",
          borderTop: `1px solid ${T.border}`,
          position: "sticky", bottom: 0,
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }} ref={wrapRef}>

            {picker && <EnginePicker onSelect={e => { setEngine(e); setShowSugg(true); }} onClose={() => setPicker(false)} T={T} />}
            {showSugg && engine && <EngineSugg engine={engine} onSelect={s => { setShowSugg(false); sendMsg(s); }} T={T} />}

            {listening && (
              <div style={{
                padding: "8px 14px", borderRadius: 10, background: T.card,
                border: "1.5px solid rgba(244,63,94,0.4)",
                fontSize: 13, color: "#F43F5E", fontWeight: 500, marginBottom: 8,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F43F5E", animation: "listening 0.8s ease infinite" }} />
                Listening… speak now
              </div>
            )}

            {/* Input box */}
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 7,
              background: T.card, borderRadius: 20,
              border: `1.5px solid ${T.borderSt}`,
              padding: "8px 8px 8px 8px",
              boxShadow: T.shMd,
              transition: "box-shadow 0.2s, border-color 0.2s",
            }}
              onFocusCapture={e => { e.currentTarget.style.boxShadow = `0 0 0 4px rgba(124,111,255,0.2)`; e.currentTarget.style.borderColor = T.accent; }}
              onBlurCapture={e => { e.currentTarget.style.boxShadow = T.shMd; e.currentTarget.style.borderColor = T.borderSt; }}>

              {/* Engine picker button */}
              <button onClick={e => { e.stopPropagation(); setPicker(p => !p); setShowSugg(false); }}
                title="Choose engine"
                style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: picker ? T.accentSoft : (engine ? `${engine.color}13` : T.surface),
                  color: picker ? T.accent : (engine ? engine.color : T.mute),
                  border: `1.5px solid ${picker ? T.accent + "55" : "transparent"}`,
                  transition: "all 0.16s", fontSize: engine ? 17 : 21,
                }}>
                {engine ? engine.icon : "+"}
              </button>

              {/* Textarea */}
              <textarea ref={taRef} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={listening ? "Listening…" : (engine ? `Ask ${engine.label} anything…` : "Ask anything — Reel ideas, pricing, brand strategy, growth…")}
                rows={1} disabled={loading}
                style={{
                  flex: 1, resize: "none", border: "none", background: "transparent",
                  fontSize: 14, color: T.text, lineHeight: 1.55, maxHeight: 160,
                  overflowY: "auto", paddingTop: 6, paddingLeft: 4, letterSpacing: "-0.01em",
                }} />

              {/* Mic */}
              {voiceOk && (
                <button onClick={toggleVoice} title="Voice input"
                  style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: listening ? "rgba(244,63,94,0.12)" : T.surface,
                    border: `1.5px solid ${listening ? "rgba(244,63,94,0.45)" : "transparent"}`,
                    transition: "all 0.18s",
                    animation: listening ? "breathe 1s ease-in-out infinite" : "none",
                  }}>
                  <MicIcon active={listening} color={T.mute} size={17} />
                </button>
              )}

              {/* Send */}
              <button onClick={() => { if (input.trim() && !loading) sendMsg(input); }}
                disabled={!input.trim() || loading}
                style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: input.trim() && !loading ? T.accent : T.surface,
                  border: `1.5px solid ${input.trim() && !loading ? T.accent + "70" : "transparent"}`,
                  boxShadow: input.trim() && !loading ? `0 2px 14px rgba(124,111,255,0.4)` : "none",
                  transition: "all 0.18s",
                }}
                onMouseEnter={e => { if (input.trim() && !loading) { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "scale(1.05)"; } }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}>
                {loading
                  ? <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  : <SendIcon color={input.trim() && !loading ? "#fff" : T.mute} />}
              </button>
            </div>

            {/* Hint */}
            <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: T.mute, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <span><kbd style={{ background: T.surface, padding: "1px 5px", borderRadius: 4, fontSize: 10, border: `1px solid ${T.border}` }}>↵</kbd> send</span>
              {voiceOk && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MicIcon active={false} color={T.mute} size={12} /> speak</span>}
              <span>tap <b style={{ color: T.sub }}>+</b> for engines</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
