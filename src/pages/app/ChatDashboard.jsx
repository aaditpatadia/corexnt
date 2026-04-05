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

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "Just now";
}

function saveToHistory(firstUserMsg, allMessages, userType) {
  try {
    const hist = JSON.parse(localStorage.getItem("corex_history") || "[]");
    const sid  = sessionStorage.getItem("corex_session_id") || Date.now().toString();
    const existing = hist.findIndex(h => h.id === sid);
    // Strip b64 from messages before saving to localStorage
    const safeMessages = allMessages.map(m => ({
      ...m,
      files: m.files?.map(f => ({ name:f.name, type:f.type, preview:f.preview })) ?? [],
    }));
    const entry = {
      id:        sid,
      title:     firstUserMsg.slice(0, 50),
      messages:  safeMessages,
      userType,
      timestamp: Date.now(),
    };
    if (existing >= 0) hist[existing] = entry;
    else hist.unshift(entry);
    localStorage.setItem("corex_history", JSON.stringify(hist.slice(0, 50)));
  } catch { /* storage full — ignore */ }
}

/* ── Dashboard home (shown when no messages) ── */
function DashboardHome({ userName, userType, msgLeft, onChipClick, onLoadConversation }) {
  const navigate   = useNavigate();
  const dateKey    = new Date().toISOString().slice(0,10);
  const used       = 10 - msgLeft;
  const joinedRaw  = localStorage.getItem("corex_joined") || Date.now().toString();
  const joined     = new Date(parseInt(joinedRaw)).toLocaleDateString("en-US", { month:"short", year:"numeric" });
  const allHist    = (() => { try { return JSON.parse(localStorage.getItem("corex_history")||"[]"); } catch { return []; } })();
  const recent     = allHist.slice(0, 3);

  const CHIPS = userType === "company" ? [
    { label:"Build a campaign for my product",    emoji:"🚀" },
    { label:"Allocate my marketing budget",       emoji:"💼" },
    { label:"Audit our brand positioning",        emoji:"🔍" },
    { label:"What are our competitors doing",     emoji:"👁️" },
    { label:"Generate an influencer brief",       emoji:"✍️" },
    { label:"Find where we're losing customers",  emoji:"🧩" },
  ] : [
    { label:"Write me a viral reel script",         emoji:"🎬" },
    { label:"Audit my Instagram growth",            emoji:"📈" },
    { label:"What's trending this week in my niche",emoji:"🔥" },
    { label:"Price my brand deal",                  emoji:"💰" },
    { label:"Build my 30-day content calendar",     emoji:"📅" },
    { label:"Find my niche angle",                  emoji:"🎯" },
  ];

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
      className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 pt-10 pb-4">

      {/* Greeting */}
      <p className="text-sm font-medium mb-2" style={{ color:"rgba(45,214,104,0.6)", fontFamily:"var(--font-body)" }}>
        {getGreeting(userName)}
      </p>
      <h1 className="font-bold text-center mb-2" style={{ fontFamily:"var(--font-body)", fontSize:"clamp(28px,4vw,44px)", color:"#f0faf2", lineHeight:1.2 }}>
        What will you{" "}
        <span className="gradient-text-green">{userType === "company" ? "build" : "create"} today?</span>
      </h1>
      <p className="text-sm text-center mb-8" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
        Ask anything. Get answers that actually work.
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 w-full mb-8">
        {[
          { label:"Messages today", value:`${used}/10` },
          { label:"Conversations",  value:allHist.length },
          { label:"Member since",   value:joined },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{ background:"rgba(14,28,16,0.7)", border:"1px solid rgba(45,214,104,0.12)" }}>
            <div className="text-xl font-bold mb-0.5" style={{ color:"#2dd668", fontFamily:"var(--font-body)" }}>{s.value}</div>
            <div className="text-xs" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent conversations */}
      {recent.length > 0 && (
        <div className="w-full mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color:"rgba(45,214,104,0.6)", fontFamily:"var(--font-body)" }}>
              Recent
            </h3>
            <button onClick={()=>navigate("/app/history")} className="text-xs transition-colors"
              style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}
              onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {recent.map(entry => (
              <motion.button key={entry.id} whileHover={{ x:4 }}
                onClick={() => onLoadConversation(entry)}
                className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all"
                style={{ background:"rgba(14,28,16,0.6)", border:"1px solid rgba(45,214,104,0.1)" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(45,214,104,0.3)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(45,214,104,0.1)"}>
                <span className="text-sm truncate max-w-xs" style={{ color:"rgba(240,250,242,0.8)", fontFamily:"var(--font-body)" }}>{entry.title}</span>
                <span className="text-xs flex-shrink-0 ml-3" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>
                  {timeAgo(entry.timestamp)} · Continue →
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Quick action chips */}
      <div className="flex flex-wrap gap-2.5 justify-center">
        {CHIPS.map(chip => (
          <motion.button key={chip.label} whileHover={{ y:-2, scale:1.02 }} whileTap={{ scale:0.97 }}
            onClick={() => onChipClick(chip.label)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
            style={{ background:"rgba(20,40,24,0.6)", border:"1px solid rgba(45,214,104,0.15)", color:"rgba(240,250,242,0.75)", fontFamily:"var(--font-body)" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(45,214,104,0.4)"; e.currentTarget.style.background="rgba(45,214,104,0.08)"; e.currentTarget.style.color="#f0faf2"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(45,214,104,0.15)"; e.currentTarget.style.background="rgba(20,40,24,0.6)"; e.currentTarget.style.color="rgba(240,250,242,0.75)"; }}>
            <span>{chip.emoji}</span><span>{chip.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Streaming text display (shown while response is coming in) ── */
function StreamingCard({ content }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background:"rgba(45,214,104,0.15)", border:"1px solid rgba(45,214,104,0.3)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
          CX
        </div>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color:"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>COREX</span>
      </div>
      <div className="rounded-2xl overflow-hidden"
        style={{ background:"rgba(14,28,16,0.85)", border:"1px solid rgba(45,214,104,0.18)", borderLeft:"3px solid #2dd668" }}>
        <div className="h-0.5" style={{ background:"linear-gradient(90deg,#2dd668,rgba(45,214,104,0.2),transparent)" }}/>
        <div className="p-5">
          {content
            ? <div className="text-sm leading-relaxed whitespace-pre-wrap typing-cursor"
                style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
                {content}
              </div>
            : <div className="flex gap-1.5 items-center py-1">
                {[0,1,2].map(i=>(
                  <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background:"#2dd668" }}
                    animate={{ y:[0,-7,0], opacity:[0.4,1,0.4] }}
                    transition={{ duration:0.9, delay:i*0.18, repeat:Infinity, ease:"easeInOut" }}/>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function ChatDashboard({ userType="creator", userName="", onUpgrade }) {
  const navigate  = useNavigate();
  const toast     = useToast();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!sessionStorage.getItem("corex_session_id")) {
      sessionStorage.setItem("corex_session_id", Date.now().toString());
    }
    if (!localStorage.getItem("corex_joined")) {
      localStorage.setItem("corex_joined", Date.now().toString());
    }
  }, []);

  const [msgLeft, setMsgLeft] = useState(() => {
    const dk   = new Date().toISOString().slice(0,10);
    const used = parseInt(localStorage.getItem("corex_messages_" + dk) || "0", 10);
    return Math.max(0, 10 - used);
  });

  const [messages,     setMessages]    = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("corex_chat") || "[]"); } catch { return []; }
  });
  const [apiHistory,   setApiHistory]  = useState([]);
  const [loading,      setLoading]     = useState(false);
  const [activeEngine, setActiveEngine]= useState(null);
  const [showBanner,   setShowBanner]  = useState(false);

  const firstUserMsg = useRef("");

  // Persist session (without b64 to avoid storage quota)
  useEffect(() => {
    try {
      const safe = messages.map(m => ({
        ...m,
        files: m.files?.map(f => ({ name:f.name, type:f.type, preview:f.preview })) ?? [],
      }));
      sessionStorage.setItem("corex_chat", JSON.stringify(safe));
    } catch { /* storage full */ }
  }, [messages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const decrementCounter = () => {
    const dk   = new Date().toISOString().slice(0,10);
    const used = parseInt(localStorage.getItem("corex_messages_" + dk) || "0", 10);
    localStorage.setItem("corex_messages_" + dk, String(used + 1));
    setMsgLeft(m => Math.max(0, m - 1));
  };

  const sendMessage = useCallback(async (text, files = []) => {
    if ((!text.trim() && files.length === 0) || loading) return;
    if (msgLeft <= 0) { setShowBanner(true); return; }

    // Separate display files (no b64) from API files (with b64)
    const displayFiles = files.map(({ name, type, preview }) => ({ name, type, preview }));
    const apiFiles     = files.map(({ name, type, b64 })     => ({ name, type, b64 }));

    const userMsgId = Date.now();
    const userMsg   = { id: userMsgId, role:"user", content:text, files:displayFiles };

    if (!firstUserMsg.current) firstUserMsg.current = text;

    setMessages(prev => [...prev, userMsg]);
    decrementCounter();

    const engineCtx = activeEngine ? ` [${activeEngine} engine]` : "";
    const newHist   = [...apiHistory, { role:"user", content: text + engineCtx }];
    setApiHistory(newHist);
    setLoading(true);

    // Add streaming placeholder as last message
    const streamId = Date.now() + 1;
    setMessages(prev => [...prev, { id:streamId, role:"assistant", content:"", streaming:true }]);

    let fullText = "";

    try {
      const response = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          messages:   newHist,
          files:      apiFiles.length > 0 ? apiFiles : undefined,
          userType,
          engineMode: activeEngine || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        fullText  = err.reply || `Something went wrong (${response.status})\n\nChips: 'Try again' | 'New chat' | 'Help'`;
      } else {
        const contentType = response.headers.get("Content-Type") || "";

        if (contentType.includes("text/event-stream")) {
          // ── Streaming path ──────────────────────────────────────
          const reader  = response.body.getReader();
          const decoder = new TextDecoder();
          let   buf     = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buf += decoder.decode(value, { stream:true });
            const lines = buf.split("\n");
            buf = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6).trim();
              if (raw === "[DONE]") break;
              try {
                const parsed = JSON.parse(raw);
                if (parsed.delta) {
                  fullText += parsed.delta;
                  // Live update streaming message
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullText };
                    return updated;
                  });
                }
              } catch { /* skip malformed chunk */ }
            }
          }
        } else {
          // ── Non-streaming fallback (dev / proxy) ────────────────
          const d  = await response.json();
          fullText = d.reply || "";
        }
      }
    } catch {
      fullText = "Connection error\n\nCheck your internet and try again.\n\nChips: 'Try again' | 'New chat' | 'Help'";
    }

    // Finalise message — mark streaming done
    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        content:  fullText,
        streaming: false,
      };
      return updated;
    });

    const finalMessages = [
      ...messages,
      userMsg,
      { id:streamId, role:"assistant", content:fullText, streaming:false },
    ];
    setApiHistory(prev => [...prev, { role:"assistant", content:fullText }]);
    saveToHistory(firstUserMsg.current || text, finalMessages, userType);
    setLoading(false);
  }, [loading, apiHistory, activeEngine, msgLeft, userType, messages]);

  const handleRegenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    if (!lastUser) return;
    setMessages(prev => prev.slice(0, -1));
    sendMessage(lastUser.content, lastUser.files || []);
  }, [messages, sendMessage]);

  const handleLoadConversation = useCallback((entry) => {
    setMessages(entry.messages || []);
    setApiHistory((entry.messages || []).filter(m=>m.role!=="assistant"||true).map(m=>({ role:m.role, content:m.content })));
    firstUserMsg.current = entry.title;
    sessionStorage.setItem("corex_session_id", entry.id);
  }, []);

  const newChat = () => {
    setMessages([]); setApiHistory([]);
    firstUserMsg.current = "";
    sessionStorage.removeItem("corex_chat");
    const newId = Date.now().toString();
    sessionStorage.setItem("corex_session_id", newId);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Upgrade banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
            className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
            style={{ background:"rgba(45,214,104,0.08)", borderBottom:"1px solid rgba(45,214,104,0.15)" }}>
            <span className="text-sm" style={{ color:"rgba(240,250,242,0.8)", fontFamily:"var(--font-body)" }}>
              You've used all 10 free messages today. Upgrade to keep going.
            </span>
            <div className="flex gap-2">
              <button onClick={onUpgrade} className="px-4 py-1.5 rounded-xl text-xs font-bold btn-green" style={{ color:"#050a06" }}>
                Upgrade
              </button>
              <button onClick={()=>setShowBanner(false)} className="text-xs" style={{ color:"var(--text-muted)" }}>✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar row when messages exist */}
      {!isEmpty && (
        <div className="flex items-center justify-between px-5 pt-3 pb-1 flex-shrink-0">
          <button onClick={() => navigate("/app/chat")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ color:"var(--text-muted)", border:"1px solid rgba(45,214,104,0.1)", fontFamily:"var(--font-body)" }}
            onMouseEnter={e=>{ e.currentTarget.style.color="#f0faf2"; e.currentTarget.style.background="rgba(45,214,104,0.05)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.color="var(--text-muted)"; e.currentTarget.style.background="transparent"; }}>
            ⌂ Home
          </button>
          <button onClick={newChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ color:"var(--text-muted)", border:"1px solid rgba(45,214,104,0.1)", fontFamily:"var(--font-body)" }}
            onMouseEnter={e=>{ e.currentTarget.style.color="#f0faf2"; e.currentTarget.style.background="rgba(45,214,104,0.05)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.color="var(--text-muted)"; e.currentTarget.style.background="transparent"; }}>
            + New chat
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scroll-area">
        <div className="max-w-2xl mx-auto w-full px-4 pt-4 pb-4">

          {isEmpty ? (
            <DashboardHome
              userName={userName}
              userType={userType}
              msgLeft={msgLeft}
              onChipClick={(label) => sendMessage(label)}
              onLoadConversation={handleLoadConversation}
            />
          ) : (
            <div className="space-y-5">
              {messages.map((msg, i) => {
                if (msg.role === "assistant" && msg.streaming) {
                  return <StreamingCard key={msg.id} content={msg.content} />;
                }
                return (
                  <ResponseCard
                    key={msg.id}
                    message={msg}
                    animate={false}
                    onChip={t => sendMessage(t)}
                    onRegenerate={handleRegenerate}
                  />
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 pb-20 md:pb-4"
        style={{ borderTop:"1px solid rgba(45,214,104,0.07)", background:"rgba(5,10,6,0.9)", backdropFilter:"blur(20px)" }}>
        <div className="max-w-2xl mx-auto">
          <ChatInput
            onSend={sendMessage}
            loading={loading}
            activeEngine={activeEngine}
            onEngineChange={setActiveEngine}
          />
        </div>
      </div>
    </div>
  );
}
