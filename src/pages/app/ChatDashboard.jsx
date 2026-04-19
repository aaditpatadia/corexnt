import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatInput    from "../../components/ChatInput";
import ResponseCard from "../../components/ResponseCard";
import { stripMarkdown } from "../../utils/parseResponse";
import { getProfileContext } from "../../utils/userProfile";
import { deduct, getCredits, COSTS, translate } from "../../utils/credits";
import { isSessionLimited, getCooldownRemaining, incrementSessionCount, resetSession, formatCountdown, getPlanLimit } from "../../utils/sessionLimits";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
const deductCredits = deduct; // backward compat alias

const ADMIN_EMAIL = "corexnt@gmail.com";

/* ── Helpers ── */
function isAdminEmail() { return (localStorage.getItem("userEmail") || "") === ADMIN_EMAIL; }

function getGreeting(name) {
  const h = new Date().getHours();
  const t = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return name ? `Good ${t}, ${name.split(" ")[0]}` : `Good ${t}`;
}

function saveToHistory(firstUserMsg, allMessages, userType) {
  try {
    const hist     = JSON.parse(localStorage.getItem("corex_history") || "[]");
    const sid      = sessionStorage.getItem("corex_session_id") || Date.now().toString();
    const existing = hist.findIndex(h => h.id === sid);
    const safe     = allMessages.map(m => ({
      ...m, files: m.files?.map(f => ({ name: f.name, type: f.type, preview: f.preview })) ?? [],
    }));
    const entry = { id: sid, title: firstUserMsg.slice(0, 60), messages: safe, userType, timestamp: Date.now(), updatedAt: Date.now() };
    if (existing >= 0) hist[existing] = entry; else hist.unshift(entry);
    localStorage.setItem("corex_history", JSON.stringify(hist.slice(0, 50)));
  } catch {}
}

/* ── BRANCHES parser — supports both old pipe format and new TITLE/BODY format ── */
function parseBranches(text) {
  // New format: BRANCH_A_TITLE / BRANCH_A_BODY
  const aTitle = text.match(/BRANCH_A_TITLE:\s*([^\n]+)/);
  const aBody  = text.match(/BRANCH_A_BODY:\s*([^\n]+)/);
  const bTitle = text.match(/BRANCH_B_TITLE:\s*([^\n]+)/);
  const bBody  = text.match(/BRANCH_B_BODY:\s*([^\n]+)/);
  const cTitle = text.match(/BRANCH_C_TITLE:\s*([^\n]+)/);
  const cBody  = text.match(/BRANCH_C_BODY:\s*([^\n]+)/);
  const t      = text.match(/THINKING:\s*([^\n]+)/);

  if (aTitle && bTitle && cTitle) {
    return {
      branches: [
        { label: "A", title: aTitle[1].trim(), desc: (aBody?.[1] || "").trim() },
        { label: "B", title: bTitle[1].trim(), desc: (bBody?.[1] || "").trim() },
        { label: "C", title: cTitle[1].trim(), desc: (cBody?.[1] || "").trim() },
      ],
      thinking: t?.[1]?.trim() || "",
    };
  }

  // Legacy pipe format: BRANCH_A: title | desc
  const a = text.match(/BRANCH_A:\s*([^|\n]+)\|\s*([^\n]+)/);
  const b = text.match(/BRANCH_B:\s*([^|\n]+)\|\s*([^\n]+)/);
  const c = text.match(/BRANCH_C:\s*([^|\n]+)\|\s*([^\n]+)/);
  if (!a || !b || !c) return null;
  return {
    branches: [
      { label: "A", title: a[1].trim(), desc: a[2].trim() },
      { label: "B", title: b[1].trim(), desc: b[2].trim() },
      { label: "C", title: c[1].trim(), desc: c[2].trim() },
    ],
    thinking: t?.[1]?.trim() || "",
  };
}

/* ── Branch Cards ── */
function BranchCards({ data, onSelect, userMessage }) {
  const [selected, setSelected] = useState(null);
  const preview = (userMessage || "").split(" ").slice(0, 4).join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: 28, width: "100%" }}
    >
      {preview && (
        <p style={{
          fontSize: 11, fontFamily: "'Instrument Sans', sans-serif",
          color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase",
          marginBottom: 14, textAlign: "center",
        }}>
          Three directions for "{preview}…"
        </p>
      )}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 820, margin: "0 auto" }}
        className="branch-grid"
      >
        {data.branches.map((branch, i) => {
          const isSelected = selected === i;
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                setSelected(i);
                setTimeout(() => onSelect(branch.title), 300);
              }}
              whileHover={{ translateY: -3 }}
              style={{
                padding: 20,
                borderRadius: 16,
                border: isSelected ? "1px solid rgba(156,252,175,0.5)" : "1px solid rgba(255,255,255,0.07)",
                background: isSelected ? "rgba(156,252,175,0.05)" : "#111111",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "rgba(156,252,175,0.3)";
                  e.currentTarget.style.background = "rgba(156,252,175,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.background = "#111111";
                }
              }}
            >
              <span style={{ fontSize: 10, fontFamily: "'Instrument Sans', sans-serif", color: "rgba(255,255,255,0.3)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 8 }}>
                {branch.label}
              </span>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 18, fontWeight: 400, color: "#ffffff", lineHeight: 1.3, margin: "0 0 10px" }}>
                {branch.title}
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Instrument Sans', sans-serif", lineHeight: 1.6, flex: 1 }}>
                {branch.desc}
              </p>
              <span style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'Instrument Sans', sans-serif", transition: "color 0.2s" }}>
                Explore this direction →
              </span>
            </motion.button>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        {data.thinking && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'Instrument Sans', sans-serif", fontStyle: "italic", marginBottom: 6 }}>
            {data.thinking}
          </p>
        )}
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'Instrument Sans', sans-serif" }}>
          Selecting a direction costs 4 credits
        </p>
      </div>
    </motion.div>
  );
}

/* ── Thinking animation ── */
const THINKING_PHRASES = [
  "Analysing your idea…",
  "Pulling live market data…",
  "Building creative directions…",
  "Scanning the competitive space…",
  "Checking what's working right now…",
  "Considering angles you haven't tried…",
  "Crafting a strategy…",
  "Looking at the full picture…",
  "Connecting the dots…",
  "Benchmarking against real brands…",
  "Digging into what the data says…",
  "Finding the move nobody's making…",
];

const IMAGE_THINKING_PHRASES = [
  "Oh okay, I see it — analysing…",
  "Got it, reading the image now…",
  "Nice, let me look at this closely…",
  "I can see it — breaking it down…",
  "Okay, I've got the visual — analysing…",
];

function ThinkingCard({ hasImage }) {
  const phrases = hasImage ? IMAGE_THINKING_PHRASES : THINKING_PHRASES;
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    setIdx(0);
    const t = setInterval(() => setIdx(i => (i + 1) % phrases.length), hasImage ? 2200 : 1800);
    return () => clearInterval(t);
  }, [hasImage]);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: "'Instrument Sans', sans-serif" }}>
          COREX
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
          {[0,1,2,3].map(i => (
            <motion.div
              key={i}
              animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
              style={{ width: 3, height: 18, borderRadius: 99, background: "rgba(156,252,175,0.6)", transformOrigin: "bottom" }}
            />
          ))}
        </div>
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500 }}
        >
          {phrases[idx]}
        </motion.span>
      </div>
    </motion.div>
  );
}

/* ── Word-reveal card ── */
function RevealCard({ message }) {
  const [visibleWords, setVisibleWords] = useState(0);
  const fullText = stripMarkdown(
    (message.content || "")
      .replace(/GRAPH_DATA:[\s\S]*$/m, "")
      .replace(/Chips:.*$/m, "")
      .replace(/FOLLOWUPS:[\s\S]*$/m, "")
      .replace(/BRANCH_[ABC]:.*$/gm, "")
      .replace(/THINKING:.*$/m, "")
      .trim()
  );
  const words = fullText.split(/(\s+)/);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisibleWords(prev => {
        const next = prev + 6;
        if (next >= words.length) { clearInterval(intervalRef.current); return words.length; }
        return next;
      });
    }, 32);
    return () => clearInterval(intervalRef.current);
  }, [message.content]);

  const visible = words.slice(0, visibleWords).join("");

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'Instrument Sans', sans-serif",
          }}
        >
          COREX
        </span>
        {message.searchUsed && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(156,252,175,0.8)",
              background: "rgba(156,252,175,0.08)",
              border: "1px solid rgba(156,252,175,0.2)",
              borderRadius: 20,
              padding: "1px 7px",
              fontFamily: "'Instrument Sans', sans-serif",
            }}
          >
            ● Live intel
          </span>
        )}
      </div>
      {visible ? (
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.85)",
            fontFamily: "'Instrument Sans', sans-serif",
            whiteSpace: "pre-wrap",
          }}
        >
          {visible}
          <span style={{ opacity: 0.3 }}>|</span>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 4, paddingTop: 4 }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(156,252,175,0.6)" }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Limit banner ── */
function LimitBanner({ onUpgrade }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: "12px 20px",
        borderRadius: 14,
        background: "rgba(248,113,113,0.08)",
        border: "1px solid rgba(248,113,113,0.2)",
        margin: "8px 0",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontFamily: "'Instrument Sans', sans-serif", marginBottom: 6 }}>
        You've run out of credits.
      </p>
      <button
        onClick={onUpgrade}
        style={{
          fontSize: 13,
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          fontFamily: "'Instrument Sans', sans-serif",
          background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Upgrade for unlimited →
      </button>
    </motion.div>
  );
}

/* ── Welcome screen ── */
function WelcomeScreen({ userName, onQuickStart }) {
  const name = localStorage.getItem("corex_user_name") || userName?.split(" ")[0] || "there";
  const brandName = localStorage.getItem("corex_brand_name") || "";

  const chips = brandName
    ? [
        `Brief ${brandName}'s next campaign`,
        `What's ${brandName}'s next move?`,
        "Find what our competitors are doing",
        "Plan a shoot — product or campaign",
      ]
    : [
        "Build a content strategy",
        "Plan a shoot — product or campaign",
        "Map my market positioning",
        "Write 5 ad hooks right now",
      ];

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100%", padding:"60px 24px 200px", textAlign:"center", position:"relative" }}>
      {/* Background glow */}
      <div style={{ position:"absolute", top:"25%", left:"50%", transform:"translateX(-50%)", width:500, height:400, borderRadius:"50%", background:"radial-gradient(ellipse at 50% 50%, rgba(156,252,175,0.05) 0%, transparent 65%)", pointerEvents:"none" }}/>

      <motion.div
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.55, ease:[0.16,1,0.3,1] }}
        style={{ display:"flex", flexDirection:"column", alignItems:"center", position:"relative", zIndex:1, maxWidth:560 }}
      >
        {/* Logo mark */}
        <div style={{
          width:48, height:48, borderRadius:"50%",
          background:"linear-gradient(#000,#000) padding-box, linear-gradient(135deg,#226FF7,#6BC3CE,#9CFCAF,#FFEA71) border-box",
          border:"2px solid transparent", marginBottom:24,
        }}/>

        <motion.p initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
          style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:"clamp(24px,4vw,28px)", color:"#ffffff", margin:"0 0 4px", lineHeight:1.2 }}>
          Hey {name},
        </motion.p>

        <motion.p initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14 }}
          style={{ fontFamily:"'Instrument Sans', sans-serif", fontWeight:400, fontSize:"clamp(15px,2.5vw,22px)", color:"rgba(255,255,255,0.45)", textAlign:"center", margin:0, lineHeight:1.4 }}>
          What are we building{brandName ? ` for ${brandName}` : ""}?
        </motion.p>

        {/* Quick-start chips 2x2 grid */}
        <motion.div
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
          style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:40, width:"100%", maxWidth:560 }}
        >
          {chips.map((s, i) => (
            <motion.button
              key={i}
              onClick={() => onQuickStart?.(s)}
              initial={{ opacity:0, y:8 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay:0.25 + i * 0.07, ease:[0.16,1,0.3,1] }}
              whileHover={{ translateY:-1 }}
              whileTap={{ scale:0.97 }}
              style={{
                padding:"14px 18px", borderRadius:12, fontSize:14,
                fontFamily:"'Instrument Sans', sans-serif", textAlign:"left",
                background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)",
                color:"rgba(255,255,255,0.75)", cursor:"pointer",
                transition:"all 0.2s cubic-bezier(0.16,1,0.3,1)",
                lineHeight:1.4,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              {s}
            </motion.button>
          ))}
        </motion.div>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.55 }}
          style={{ marginTop:28, fontSize:12, color:"rgba(255,255,255,0.18)", fontFamily:"'Instrument Sans', sans-serif", letterSpacing:"0.5px" }}>
          or type anything below ↓
        </motion.p>
      </motion.div>
    </div>
  );
}

/* ── Main ChatDashboard ── */
export default function ChatDashboard({ userType, userName, onUpgrade }) {
  const [messages,    setMessages]    = useState(() => {
    try { const s = sessionStorage.getItem("corex_chat"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [loading,     setLoading]     = useState(false);
  const [revealing,   setRevealing]   = useState(null);
  const [limitHit,    setLimitHit]    = useState(false);
  const [showLimit,   setShowLimit]   = useState(false);
  const [limitReason, setLimitReason] = useState("credits"); // "credits" | "projects" | "messages"
  const [credits,     setCredits]     = useState(getCredits);
  const [shareToast,  setShareToast]  = useState(false);
  const [cooldownMs,  setCooldownMs]  = useState(0);
  const bottomRef    = useRef(null);
  const scrollRef    = useRef(null);

  useEffect(() => {
    if (!sessionStorage.getItem("corex_session_id"))
      sessionStorage.setItem("corex_session_id", Date.now().toString());
    if (!localStorage.getItem("corex_joined"))
      localStorage.setItem("corex_joined", new Date().toISOString());
  }, []);

  // Credits refresh — every 5s and on window focus
  useEffect(() => {
    const refresh = () => setCredits(getCredits());
    const interval = setInterval(refresh, 5000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(interval); window.removeEventListener('focus', refresh); };
  }, []);

  // Session limit countdown — ticks every second
  useEffect(() => {
    const tick = () => {
      const plan = localStorage.getItem("corex_plan") || "free";
      const remaining = getCooldownRemaining(plan);
      setCooldownMs(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Prefill from other pages
  useEffect(() => {
    const p = sessionStorage.getItem("corex_prefill");
    if (p) { sessionStorage.removeItem("corex_prefill"); setTimeout(() => sendMessage(p, []), 150); }
  }, []);

  // Expose global handlers for AppShell
  useEffect(() => {
    window.__corex_newChat = () => {
      setMessages([]);
      setRevealing(null);
      sessionStorage.removeItem("corex_chat");
      sessionStorage.setItem("corex_session_id", Date.now().toString());
    };
    window.__corex_loadConversation = (conv) => {
      if (conv?.messages) {
        setMessages(conv.messages);
        setRevealing(null);
        sessionStorage.setItem("corex_session_id", conv.id);
        try { sessionStorage.setItem("corex_chat", JSON.stringify(conv.messages)); } catch {}
      }
    };
    return () => { delete window.__corex_newChat; delete window.__corex_loadConversation; };
  }, []);

  // Persist session
  useEffect(() => {
    try {
      sessionStorage.setItem("corex_chat", JSON.stringify(
        messages.map(m => ({ ...m, files: m.files?.map(f => ({ name: f.name, type: f.type, preview: f.preview })) ?? [] }))
      ));
    } catch {}
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text, files = []) => {
    if ((!text?.trim() && !files.length) || loading) return;

    const isNewChat  = messages.length === 0;
    const histCount  = (() => { try { return JSON.parse(localStorage.getItem("corex_history")||"[]").length; } catch { return 0; } })();
    if (!isAdminEmail() && isNewChat && histCount >= 5) { setLimitReason("projects"); setShowLimit(true); return; }

    // Per-session message limit based on plan
    const planTier = localStorage.getItem("corex_plan") || "free";
    if (!isAdminEmail() && isSessionLimited(planTier)) {
      // Already blocked — banner is shown below input; do nothing
      return;
    }

    // Per-project: free users limited to 5 user messages per conversation
    const userMsgCount = messages.filter(m => m.role === "user").length;
    if (!isAdminEmail() && planTier === "free" && userMsgCount >= 5) { setLimitReason("messages"); setShowLimit(true); return; }

    // Calculate credit cost and check balance
    const hasImage = files.some(f => f.type?.startsWith("image/"));
    const textLower = (text || "").toLowerCase();
    const isBriefRequest = /brief|campaign|strategy|positioning|audit/.test(textLower);
    const isComplex = (text?.length || 0) > 50;
    const cost = hasImage ? COSTS.file
      : isBriefRequest ? COSTS.brief
      : isComplex ? COSTS.smart
      : COSTS.basic;
    if (!isAdminEmail() && !deduct(cost)) { setLimitReason("credits"); setShowLimit(true); return; }

    // Increment session message counter (only reached when message is actually sent)
    if (!isAdminEmail()) incrementSessionCount();

    const displayFiles = files.map(({ name, type, preview }) => ({ name, type, preview }));
    const apiFiles     = files.map(({ name, type, b64 })     => ({ name, type, b64 }));
    const userMsg      = { id: Date.now(), role: "user", content: text, files: displayFiles };
    const assistantId  = Date.now() + 1;

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const fullHistory   = [...messages, userMsg];
    const contextWindow = fullHistory.slice(-15);
    const profileContext = getProfileContext(userType);

    const isFirstMessage = messages.length === 0;
    let sessionContext = profileContext;
    if (isFirstMessage) {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
      const timeStr = now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
      const recentHistory = (() => {
        try {
          return JSON.parse(localStorage.getItem("corex_history") || "[]")
            .slice(0, 3).map(h => h.title).filter(Boolean);
        } catch { return []; }
      })();
      const planTier = localStorage.getItem("corex_plan") || "free";
      sessionContext = (profileContext || "") +
        `\n\nSESSION CONTEXT:\nDate: ${dateStr}, ${timeStr}\nPlan: ${planTier}\n` +
        (recentHistory.length > 0 ? `Recent: ${recentHistory.join(" | ")}\n` : "");
    }

    let reply      = "";
    let searchUsed = false;
    try {
      const userProfile = (() => {
        try { return JSON.parse(localStorage.getItem("corex_user_profile") || "null"); }
        catch { return null; }
      })();
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages:         contextWindow.map(m => ({ role: m.role, content: m.content || "" })),
          files:            apiFiles,
          userType,
          userProfile,
          profileContext:   sessionContext,
          conversationTurn: isFirstMessage ? 1 : fullHistory.filter(m => m.role === "user").length,
          attachedDocs:     JSON.parse(localStorage.getItem("corex_attached_docs") || "[]"),
          sharedLinks:      JSON.parse(localStorage.getItem("corex_shared_links")   || "[]"),
          plan:             localStorage.getItem("corex_plan") || "free",
          adminModel:       localStorage.getItem("userEmail") === "corexnt@gmail.com"
                              ? (localStorage.getItem("corex_model_override") || undefined)
                              : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      reply      = data.reply || "Something went wrong. Try again.";
      searchUsed = !!data.usedWebSearch;
    } catch {
      reply = `Connection error. Please try again.\n\nFOLLOWUPS: ["Try again", "New idea"]`;
    }

    // Credits already deducted by deduct(cost) above; refresh display
    setCredits(getCredits());

    const assistantMsg = { id: assistantId, role: "assistant", content: reply, streaming: false, searchUsed };
    setMessages(prev => {
      const updated = [...prev, assistantMsg];
      const first   = updated.find(m => m.role === "user");
      if (first) saveToHistory(first.content, updated, userType);
      return updated;
    });

    setRevealing(assistantId);
    setLoading(false);
    setTimeout(() => setRevealing(null), 8000);
  }, [messages, loading, userType]);

  // Share handler — saves conversation snapshot to Firestore + localStorage and copies link
  const handleShare = useCallback(async (message) => {
    const shareId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const shareData = {
      messages: messages.map(m => ({ role: m.role, content: m.content || "" })).filter(m => m.content),
      title: messages.find(m => m.role === "user")?.content?.slice(0, 60) || "Shared conversation",
      ts: Date.now(),
      shareId,
    };

    // Save to Firestore (primary)
    if (db) {
      await setDoc(doc(db, "shared_chats", shareId), shareData).catch(() => {});
    }

    // Also save to localStorage as backup
    localStorage.setItem(`corex_shared_${shareId}`, JSON.stringify(shareData));

    const link = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  }, [messages]);

  // Handler when user picks a branch
  const handleBranchSelect = useCallback((branchTitle) => {
    sendMessage(`Let's go with "${branchTitle}". Deepen this direction.`, []);
  }, [sendMessage]);

  return (
    <div
      style={{
        background: "#000000",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {showLimit && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:24 }}>
          <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.05 }}
            style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.1)", borderRadius:28, padding:"40px 36px", maxWidth:400, width:"100%", textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>
              {limitReason === "credits" ? "⚡" : "🔒"}
            </div>
            <h3 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:26, color:"#ffffff", marginBottom:8 }}>
              {limitReason === "credits" && "You're out of credits"}
              {limitReason === "projects" && "5 project limit reached"}
              {limitReason === "messages" && "Session limit reached"}
            </h3>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", fontFamily:"'Instrument Sans', sans-serif", lineHeight:1.6, marginBottom:28 }}>
              {limitReason === "credits" && "Your free credits are used up. Top up to keep creating — packs start at ₹299."}
              {limitReason === "projects" && "Free accounts can create 5 projects. Upgrade to unlock unlimited creative sessions."}
              {limitReason === "messages" && "Free accounts get 5 messages per session. Upgrade for unlimited back-and-forth."}
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {limitReason === "credits" ? (
                <button
                  onClick={() => { setShowLimit(false); window.dispatchEvent(new CustomEvent("corex:openCredits")); }}
                  style={{ padding:"14px 0", borderRadius:100, border:"none", cursor:"pointer", background:"linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)", color:"#000000", fontSize:15, fontWeight:700, fontFamily:"'Instrument Sans', sans-serif" }}>
                  Top up credits →
                </button>
              ) : (
                <button onClick={onUpgrade}
                  style={{ padding:"14px 0", borderRadius:100, border:"none", cursor:"pointer", background:"linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)", color:"#000000", fontSize:15, fontWeight:700, fontFamily:"'Instrument Sans', sans-serif" }}>
                  Upgrade to Pro →
                </button>
              )}
              <button onClick={() => setShowLimit(false)}
                style={{ padding:"12px 0", borderRadius:100, border:"1px solid rgba(255,255,255,0.12)", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:14, fontFamily:"'Instrument Sans', sans-serif", cursor:"pointer" }}>
                Go back
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* Messages scrollable area */}
      <div
        ref={scrollRef}
        className="scroll-area"
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          position: "relative",
        }}
      >
        {messages.length === 0 ? (
          <WelcomeScreen userName={userName} onQuickStart={text => sendMessage(text, [])} />
        ) : (
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto",
              padding: "24px 24px 32px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <AnimatePresence>
              {messages.map(msg => {
                // Branches response
                if (msg.role === "assistant" && msg.id !== revealing) {
                  const branches = parseBranches(msg.content || "");
                  const prevUser = messages.slice(0, messages.findIndex(m => m.id === msg.id)).reverse().find(m => m.role === "user");
                  if (branches) {
                    return (
                      <BranchCards
                        key={msg.id}
                        data={branches}
                        onSelect={handleBranchSelect}
                        userMessage={prevUser?.content || ""}
                      />
                    );
                  }
                }

                // Revealing (word by word)
                if (msg.role === "assistant" && msg.id === revealing) {
                  const branches = parseBranches(msg.content || "");
                  const prevUser2 = messages.slice(0, messages.findIndex(m => m.id === msg.id)).reverse().find(m => m.role === "user");
                  if (branches) {
                    return (
                      <BranchCards
                        key={msg.id}
                        data={branches}
                        onSelect={handleBranchSelect}
                        userMessage={prevUser2?.content || ""}
                      />
                    );
                  }
                  return <RevealCard key={msg.id} message={msg} />;
                }

                // Normal response card
                return (
                  <ResponseCard
                    key={msg.id}
                    message={msg}
                    userType={userType}
                    onChip={chip => sendMessage(chip, [])}
                    onShare={() => handleShare(msg)}
                    onRegenerate={() => {
                      const prev = messages.slice(0, messages.findIndex(m => m.id === msg.id));
                      const last = [...prev].reverse().find(m => m.role === "user");
                      if (last) { setMessages(prev); setTimeout(() => sendMessage(last.content, []), 50); }
                    }}
                    onSendMessage={(prompt, cost) => {
                      const cur = getCredits();
                      if (cur < cost) { setLimitReason("credits"); setShowLimit(true); return; }
                      deduct(cost);
                      setCredits(getCredits());
                      sendMessage(prompt, []);
                    }}
                  />
                );
              })}
            </AnimatePresence>

            {loading && <ThinkingCard hasImage={messages.length > 0 && messages[messages.length-1]?.files?.some(f => f.type?.startsWith("image/"))} />}
            {limitHit && !loading && <LimitBanner onUpgrade={onUpgrade} />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input — always visible flex footer, never overlaps messages */}
      <div
        style={{
          flexShrink: 0,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "#000000",
        }}
      >
        {/* Session limit banner — shown above input when user hits their plan's session cap */}
        {(() => {
          const plan = localStorage.getItem("corex_plan") || "free";
          const limited = isSessionLimited(plan);
          if (!limited) return null;
          const remaining = getCooldownRemaining(plan);
          const { messages: planMessages } = getPlanLimit(plan);
          return (
            <div style={{
              background: "rgba(255,234,113,0.06)",
              border: "1px solid rgba(255,234,113,0.2)",
              borderRadius: 14,
              padding: "16px 20px",
              margin: "0 16px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              fontFamily: "'Instrument Sans', sans-serif",
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#FFEA71", margin: "0 0 4px" }}>
                  ⚡ {planMessages} message session complete
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                  {remaining > 0
                    ? `Continue in ${formatCountdown(remaining)} · or upgrade for longer sessions`
                    : "Session reset — you can continue chatting"}
                </p>
              </div>
              <button
                onClick={() => {
                  // NOTE: AppShell exposes window.__corex_openCredits to open the credit modal.
                  // We dispatch a custom event that AppShell listens for.
                  window.dispatchEvent(new CustomEvent("corex:openCredits"));
                }}
                style={{
                  padding: "9px 18px",
                  borderRadius: 100,
                  fontSize: 13,
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #226FF7, #FFEA71)",
                  color: "#000",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Upgrade to SPARK →
              </button>
            </div>
          );
        })()}
        <ChatInput onSend={sendMessage} disabled={loading || limitHit || isSessionLimited(localStorage.getItem("corex_plan") || "free")} userType={userType} embedded />
        <div style={{
          textAlign: "center",
          fontSize: 11,
          color: credits < 10 ? "rgba(255,234,113,0.8)" : "rgba(255,255,255,0.3)",
          fontFamily: "'Instrument Sans', sans-serif",
          paddingBottom: 8,
          animation: credits < 10 ? "pulse 2s ease-in-out infinite" : "none",
        }}>
          {translate(credits)} · {credits} credits remaining
        </div>
      </div>

      {/* Share toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
              background: "#111", border: "1px solid rgba(156,252,175,0.3)",
              borderRadius: 12, padding: "10px 18px",
              fontSize: 13, color: "#9CFCAF", fontFamily: "'Instrument Sans', sans-serif",
              zIndex: 1100, whiteSpace: "nowrap",
            }}
          >
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Branch grid responsive styles */}
      <style>{`
        @media (max-width: 700px) {
          .branch-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
