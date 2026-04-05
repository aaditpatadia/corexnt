import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ChatInput    from "../../components/ChatInput";
import ResponseCard from "../../components/ResponseCard";
import { useToast } from "../../components/Toast";

/* ── Helpers ── */
function getGreeting(name) {
  const h = new Date().getHours();
  const t = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${t}${name ? `, ${name.split(" ")[0]}` : ""}`;
}

function saveToHistory(firstUserMsg, allMessages, userType) {
  try {
    const hist = JSON.parse(localStorage.getItem("corex_history") || "[]");
    const sid  = sessionStorage.getItem("corex_session_id") || Date.now().toString();
    const existing = hist.findIndex(h => h.id === sid);
    const safeMessages = allMessages.map(m => ({
      ...m,
      files: m.files?.map(f => ({ name:f.name, type:f.type, preview:f.preview })) ?? [],
    }));
    const entry = {
      id: sid,
      title: firstUserMsg.slice(0, 60),
      messages: safeMessages,
      userType,
      timestamp: Date.now(),
    };
    if (existing >= 0) hist[existing] = entry;
    else hist.unshift(entry);
    localStorage.setItem("corex_history", JSON.stringify(hist.slice(0, 50)));
  } catch {}
}

/* ── Streaming loading indicator ── */
function ThinkingDots({ userType }) {
  const color = userType !== "company" ? "#2dd668" : "#a78bfa";
  return (
    <div className="flex items-center gap-1 py-1">
      {[0,1,2].map(i => (
        <motion.div key={i}
          animate={{ opacity:[0.3,1,0.3], y:[0,-3,0] }}
          transition={{ duration:1.2, repeat:Infinity, delay:i*0.2 }}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background:color }}/>
      ))}
    </div>
  );
}

/* ── StreamingCard — shows raw text while streaming ── */
function StreamingCard({ message, userType }) {
  const isCreator   = userType !== "company";
  const accentColor = isCreator ? "#2dd668" : "#a78bfa";
  const accentRgba  = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";

  const displayText = (message.content || "")
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, "$1")
    .replace(/\*+/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/GRAPH_DATA:[\s\S]*$/m, "")
    .replace(/Chips:.*$/m, "")
    .trim();

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      className="w-full" style={{ maxWidth:"75%" }}>
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
      {displayText ? (
        <div className="text-sm leading-relaxed whitespace-pre-wrap typing-cursor"
          style={{ color:"rgba(255,255,255,0.75)", fontFamily:"var(--font-body)", lineHeight:1.75 }}>
          {displayText}
        </div>
      ) : (
        <ThinkingDots userType={userType}/>
      )}
    </motion.div>
  );
}

/* ── Welcome screen (Dia-style) ── */
function WelcomeScreen({ userType, userName, onChip }) {
  const isCreator   = userType !== "company";
  const accentColor = isCreator ? "#2dd668" : "#a78bfa";
  const accentRgba  = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";
  const subtitle    = isCreator
    ? "Reels, growth, brand deals, trends"
    : "Campaigns, strategy, budgets, intel";
  const chips = isCreator ? [
    "Write me a viral reel script",
    "Audit my Instagram growth",
    "What's trending this week?",
    "Price my brand deal",
  ] : [
    "Build a campaign strategy",
    "Allocate my marketing budget",
    "Audit our brand positioning",
    "Analyse our competitors",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 select-none" style={{ minHeight:"60vh" }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
        className="flex flex-col items-center text-center">

        {/* Logo mark */}
        <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
          transition={{ delay:0.05, type:"spring", stiffness:260, damping:20 }} className="mb-6">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="9" fill={`${accentRgba}0.08)`} stroke={`${accentRgba}0.3)`} strokeWidth="1"/>
            <path d="M8 16c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="16" cy="21" r="3.5" fill={accentColor}/>
          </svg>
        </motion.div>

        <motion.h1 initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          style={{ fontFamily:"var(--font-display)", fontSize:"clamp(22px,3vw,32px)", fontWeight:700, color:"rgba(255,255,255,0.9)", lineHeight:1.2, marginBottom:10 }}>
          {getGreeting(userName)}
        </motion.h1>

        <motion.h2 initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          style={{ fontFamily:"var(--font-display)", fontSize:"clamp(18px,2.4vw,26px)", fontWeight:600, color:"rgba(255,255,255,0.45)", lineHeight:1.3, marginBottom:8 }}>
          What do you want to create today?
        </motion.h2>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
          className="text-sm mb-10" style={{ color:"rgba(255,255,255,0.25)", fontFamily:"var(--font-body)" }}>
          {subtitle}
        </motion.p>

        {/* 2×2 suggestion chips */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.25 }} className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {chips.map((chip, i) => (
            <motion.button key={chip}
              initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay:0.25 + i * 0.05 }}
              whileHover={{ y:-3 }} whileTap={{ scale:0.97 }}
              onClick={() => onChip(chip)}
              className="p-3.5 rounded-2xl text-left text-sm font-medium"
              style={{
                background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)", lineHeight:1.4,
                transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.background=`${accentRgba}0.06)`; e.currentTarget.style.borderColor=`${accentRgba}0.18)`; e.currentTarget.style.color="rgba(255,255,255,0.88)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="rgba(255,255,255,0.6)"; }}>
              {chip}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Main ChatDashboard ── */
export default function ChatDashboard({ userType, userName, onUpgrade, initialMessages }) {
  const toast   = useToast();
  const isCreator = userType !== "company";

  const [messages, setMessages] = useState(() => {
    if (initialMessages) return initialMessages;
    try {
      const saved = sessionStorage.getItem("corex_chat");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Mode-specific backgrounds
  const bgStyle = isCreator
    ? { background:`radial-gradient(ellipse at 30% 20%, rgba(45,214,104,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(45,214,104,0.03) 0%, transparent 60%), #080c09` }
    : { background:`radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(79,70,229,0.03) 0%, transparent 60%), #06040f` };

  useEffect(() => {
    if (!sessionStorage.getItem("corex_session_id")) {
      sessionStorage.setItem("corex_session_id", Date.now().toString());
    }
    if (!localStorage.getItem("corex_joined")) {
      localStorage.setItem("corex_joined", new Date().toLocaleDateString("en-US", { month:"short", year:"numeric" }));
    }
  }, []);

  // Check prefill from TrendEngine / Templates
  useEffect(() => {
    const prefill = sessionStorage.getItem("corex_prefill");
    if (prefill) {
      sessionStorage.removeItem("corex_prefill");
      setTimeout(() => sendMessage(prefill, []), 150);
    }
  }, []);

  // Expose loadConversation via window for TopBar history drawer
  useEffect(() => {
    window.__corex_loadConversation = (conv) => {
      if (conv?.messages) {
        setMessages(conv.messages);
        sessionStorage.setItem("corex_session_id", conv.id);
        try { sessionStorage.setItem("corex_chat", JSON.stringify(conv.messages)); } catch {}
      }
    };
  }, []);

  // Persist to session (no b64)
  useEffect(() => {
    try {
      const safe = messages.map(m => ({
        ...m,
        files: m.files?.map(f => ({ name:f.name, type:f.type, preview:f.preview })) ?? [],
      }));
      sessionStorage.setItem("corex_chat", JSON.stringify(safe));
    } catch {}
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  function trackUsage() {
    const key = `corex_messages_${new Date().toISOString().slice(0,10)}`;
    const used = parseInt(localStorage.getItem(key) || "0", 10);
    localStorage.setItem(key, (used + 1).toString());
  }

  const sendMessage = useCallback(async (text, files = []) => {
    if ((!text?.trim() && !files.length) || loading) return;

    const displayFiles = files.map(({ name, type, preview }) => ({ name, type, preview }));
    const apiFiles     = files.map(({ name, type, b64 })     => ({ name, type, b64 }));

    const userMsg   = { id:Date.now(), role:"user", content:text, files:displayFiles };
    const streamId  = Date.now() + 1;
    const placeholder = { id:streamId, role:"assistant", content:"", streaming:true };

    setMessages(prev => [...prev, userMsg, placeholder]);
    setLoading(true);
    trackUsage();

    const allMsgs = [...messages, userMsg];
    let fullText = "";

    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          messages: allMsgs.map(m => ({ role:m.role, content:m.content })),
          files:    apiFiles,
          userType,
        }),
      });

      const ct = res.headers.get("Content-Type") || "";

      if (ct.includes("text/event-stream")) {
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream:true });
          const lines = buf.split("\n"); buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") break;
            try {
              const p = JSON.parse(raw);
              if (p.delta) {
                fullText += p.delta;
                setMessages(prev => {
                  const updated = [...prev];
                  const idx = updated.findIndex(m => m.id === streamId);
                  if (idx !== -1) updated[idx] = { ...updated[idx], content:fullText };
                  return updated;
                });
              }
            } catch {}
          }
        }
      } else {
        const d = await res.json();
        fullText = d.reply || "Something went wrong.";
      }
    } catch {
      fullText = "Connection error. Try again.\n\nChips: 'Try again' | 'New chat' | 'Help'";
    }

    setMessages(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(m => m.id === streamId);
      if (idx !== -1) updated[idx] = { ...updated[idx], content:fullText, streaming:false };
      const finalMsgs = [...updated];
      const firstUser = finalMsgs.find(m => m.role === "user");
      if (firstUser) saveToHistory(firstUser.content, finalMsgs, userType);
      return finalMsgs;
    });
    setLoading(false);
  }, [messages, loading, userType]);

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem("corex_chat");
    sessionStorage.removeItem("corex_session_id");
    sessionStorage.setItem("corex_session_id", Date.now().toString());
  };

  return (
    <div className="flex flex-col h-full relative" style={bgStyle}>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto scroll-area" style={{ paddingTop:8 }}>
        {messages.length === 0 ? (
          <WelcomeScreen
            userType={userType}
            userName={userName}
            onChip={(chip) => sendMessage(chip, [])}
          />
        ) : (
          <div className="max-w-2xl mx-auto px-5 space-y-6 pb-4 pt-4">
            <AnimatePresence>
              {messages.map(msg =>
                msg.streaming
                  ? <StreamingCard key={msg.id} message={msg} userType={userType}/>
                  : <ResponseCard
                      key={msg.id}
                      message={msg}
                      animate={false}
                      userType={userType}
                      onChip={(chip) => sendMessage(chip, [])}
                      onRegenerate={() => {
                        const prevMsgs = messages.slice(0, -1);
                        const lastUser = [...prevMsgs].reverse().find(m => m.role === "user");
                        if (lastUser) {
                          setMessages(prevMsgs.filter(m => m.id !== msg.id));
                          setTimeout(() => sendMessage(lastUser.content, []), 50);
                        }
                      }}
                    />
              )}
            </AnimatePresence>
            <div ref={bottomRef}/>
          </div>
        )}
      </div>

      {/* New chat link */}
      {messages.length > 0 && (
        <div className="flex-shrink-0 flex items-center justify-center pt-2">
          <button onClick={clearChat}
            className="text-xs transition-all"
            style={{ color:"rgba(255,255,255,0.18)", fontFamily:"var(--font-body)" }}
            onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.4)"}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.18)"}>
            + New chat
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0">
        <ChatInput onSend={sendMessage} disabled={loading} userType={userType}/>
        <div className="text-center pb-2.5" style={{ fontSize:10, color:"rgba(255,255,255,0.14)", fontFamily:"var(--font-body)" }}>
          send · shift+enter new line · Corex v5.2
        </div>
      </div>
    </div>
  );
}
