import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ChatInput    from "../../components/ChatInput";
import ResponseCard from "../../components/ResponseCard";
import { useToast } from "../../components/Toast";

const ENGINE_ADDITIONS = {
  Narrative: "Focus on brand story, messaging, and positioning.",
  Content:   "Focus on content strategy, formats, hooks, and platforms.",
  Growth:    "Focus on growth tactics, metrics, and acquisition channels.",
  Trend:     "Focus on what is trending RIGHT NOW, viral formats, cultural moments.",
  Creator:   "Focus on creator-specific advice: reels, brand deals, audience building.",
};

function getGreeting(name) {
  const h = new Date().getHours();
  const t = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${t}${name ? `, ${name.split(" ")[0]}` : ""}`;
}

function saveToHistory(userMessage, messages, userType) {
  try {
    const hist = JSON.parse(localStorage.getItem("corex_history")||"[]");
    const title = userMessage.slice(0, 50);
    const existing = hist.findIndex(h => h.id === sessionStorage.getItem("corex_session_id"));
    const entry = {
      id: sessionStorage.getItem("corex_session_id") || Date.now().toString(),
      title,
      messages,
      userType,
      timestamp: Date.now(),
    };
    if (existing >= 0) hist[existing] = entry;
    else hist.unshift(entry);
    localStorage.setItem("corex_history", JSON.stringify(hist.slice(0,50)));
  } catch {}
}

export default function ChatDashboard({ userType="creator", userName="", onUpgrade }) {
  const navigate  = useNavigate();
  const toast     = useToast();
  const bottomRef = useRef(null);

  // Init session ID
  useEffect(() => {
    if (!sessionStorage.getItem("corex_session_id")) {
      sessionStorage.setItem("corex_session_id", Date.now().toString());
    }
  }, []);

  const [msgLeft, setMsgLeft] = useState(() => {
    const dateKey = new Date().toISOString().slice(0,10);
    const stored  = parseInt(localStorage.getItem("corex_messages_"+dateKey)||"0",10);
    const limit   = 10;
    return Math.max(0, limit - stored);
  });

  const [messages,     setMessages]    = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("corex_chat")||"[]"); } catch { return []; }
  });
  const [apiHistory,   setApiHistory]  = useState([]);
  const [loading,      setLoading]     = useState(false);
  const [activeEngine, setActiveEngine]= useState(null);
  const [showBanner,   setShowBanner]  = useState(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);
  useEffect(() => { sessionStorage.setItem("corex_chat", JSON.stringify(messages)); }, [messages]);

  const decrementCounter = () => {
    const dateKey = new Date().toISOString().slice(0,10);
    const stored  = parseInt(localStorage.getItem("corex_messages_"+dateKey)||"0",10);
    localStorage.setItem("corex_messages_"+dateKey, String(stored+1));
    setMsgLeft(m => Math.max(0, m-1));
  };

  const sendMessage = useCallback(async (text, files=[]) => {
    if ((!text.trim() && files.length===0) || loading) return;
    if (msgLeft <= 0) { setShowBanner(true); return; }

    const userMsg = { id:Date.now(), role:"user", content:text, files };
    setMessages(p => [...p, userMsg]);
    decrementCounter();

    const engineCtx = activeEngine ? `\n\n[Engine: ${activeEngine}] ${ENGINE_ADDITIONS[activeEngine]||""}` : "";
    const msgContent = text + engineCtx;
    const newHist  = [...apiHistory, { role:"user", content:msgContent }];
    setApiHistory(newHist);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          messages: newHist,
          files: files.length > 0 ? files : undefined,
          userType,
          engineMode: activeEngine||undefined,
        }),
      });
      let reply = "";
      if (res.ok) {
        const d = await res.json();
        reply = d.reply || "";
      } else if (res.status===429) {
        reply = "Slow down a little\n\nYou're sending messages too fast. Give it a few seconds.\n\nChips: 'Try again' | 'Change topic' | 'Growth strategy'";
      } else {
        reply = "Something's off on our end\n\nTry again in a sec. We're on it.\n\nChips: 'Try again' | 'New topic' | 'Help'";
      }
      const aMsg = { id:Date.now()+1, role:"assistant", content:reply, isNew:true };
      setMessages(p => [...p, aMsg]);
      setApiHistory(p => [...p, { role:"assistant", content:reply }]);
      // Save to history
      saveToHistory(text, [...messages, userMsg, aMsg], userType);
    } catch {
      setMessages(p => [...p, { id:Date.now()+1, role:"assistant", content:"Something's off on our end\n\nCheck your internet and try again.\n\nChips: 'Try again' | 'New chat' | 'Help'" }]);
    }
    setLoading(false);
  }, [loading, apiHistory, activeEngine, msgLeft, userType, messages]);

  const handleRegenerate = useCallback(() => {
    const last = [...messages].reverse().find(m=>m.role==="user");
    if (last) { setMessages(p=>p.slice(0,-1)); sendMessage(last.content, last.files||[]); }
  }, [messages, sendMessage]);

  const newChat = () => {
    setMessages([]); setApiHistory([]);
    sessionStorage.removeItem("corex_chat");
    sessionStorage.removeItem("corex_session_id");
    sessionStorage.setItem("corex_session_id", Date.now().toString());
  };

  const isEmpty = messages.length === 0;

  const STARTER_CHIPS = userType === "company" ? [
    { label:"Build a campaign for my product",       emoji:"🚀" },
    { label:"Allocate my ₹5 lakh marketing budget",  emoji:"💼" },
    { label:"Audit our brand positioning",           emoji:"🔍" },
    { label:"What are our competitors doing",        emoji:"👁️" },
    { label:"Generate an influencer brief",          emoji:"✍️" },
    { label:"Find where we're losing customers",     emoji:"🧩" },
  ] : [
    { label:"Write me a viral reel script",          emoji:"🎬" },
    { label:"Audit my Instagram growth",             emoji:"📈" },
    { label:"What's trending this week in my niche", emoji:"🔥" },
    { label:"Price my brand deal",                   emoji:"💰" },
    { label:"Build my 30-day content calendar",      emoji:"📅" },
    { label:"Find my niche angle",                   emoji:"🎯" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Upgrade banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
            className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
            style={{ background:"rgba(45,214,104,0.08)", borderBottom:"1px solid rgba(45,214,104,0.15)" }}>
            <span className="text-sm" style={{ color:"rgba(240,250,242,0.8)", fontFamily:"var(--font-body)" }}>
              You've used all 10 free messages. Upgrade to keep going.
            </span>
            <div className="flex gap-2">
              <button onClick={onUpgrade} className="px-4 py-1.5 rounded-xl text-xs font-bold btn-green" style={{ color:"#050a06" }}>Upgrade</button>
              <button onClick={()=>setShowBanner(false)} className="text-xs" style={{ color:"var(--text-muted)" }}>✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New chat button */}
      {!isEmpty && (
        <div className="flex justify-end px-5 pt-3 flex-shrink-0">
          <button onClick={newChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ color:"var(--text-muted)", border:"1px solid rgba(45,214,104,0.1)", fontFamily:"var(--font-body)" }}
            onMouseEnter={e=>{e.currentTarget.style.color="#f0faf2"; e.currentTarget.style.background="rgba(45,214,104,0.05)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="var(--text-muted)"; e.currentTarget.style.background="transparent";}}>
            + New chat
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scroll-area pb-4">
        <div className="max-w-2xl mx-auto w-full px-4 py-6">

          {/* Welcome */}
          <AnimatePresence>
            {isEmpty && (
              <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
                transition={{ duration:0.5, ease:[0.16,1,0.3,1] }} className="text-center pt-8 pb-6">
                <p className="text-sm font-medium mb-4" style={{ color:"rgba(45,214,104,0.6)", fontFamily:"var(--font-body)" }}>
                  {getGreeting(userName)}
                </p>
                <h1 className="font-bold mb-3" style={{ fontFamily:"var(--font-body)", fontSize:"clamp(28px,4vw,46px)", color:"#f0faf2", lineHeight:1.2 }}>
                  What will you{" "}
                  <span className="gradient-text-green">
                    {userType==="company" ? "build" : "create"} today?
                  </span>
                </h1>
                <p className="text-sm mb-10" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
                  Ask anything. Get answers that actually work.
                </p>
                <div className="flex flex-wrap gap-2.5 justify-center">
                  {STARTER_CHIPS.map(chip=>(
                    <motion.button key={chip.label} whileHover={{ y:-2 }} whileTap={{ scale:0.97 }}
                      onClick={()=>sendMessage(chip.label)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
                      style={{ background:"rgba(20,40,24,0.6)", border:"1px solid rgba(45,214,104,0.15)", color:"rgba(240,250,242,0.75)", fontFamily:"var(--font-body)" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(45,214,104,0.4)"; e.currentTarget.style.background="rgba(45,214,104,0.08)"; e.currentTarget.style.color="#f0faf2";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(45,214,104,0.15)"; e.currentTarget.style.background="rgba(20,40,24,0.6)"; e.currentTarget.style.color="rgba(240,250,242,0.75)";}}>
                      <span>{chip.emoji}</span><span>{chip.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat messages */}
          <div className="space-y-5">
            {messages.map((msg, i)=>(
              <ResponseCard key={msg.id} message={msg}
                animate={msg.isNew && msg.role==="assistant" && i===messages.length-1}
                onChip={t=>sendMessage(t)} onRegenerate={handleRegenerate}/>
            ))}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                  className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background:"rgba(45,214,104,0.15)", border:"1px solid rgba(45,214,104,0.3)", color:"#2dd668", fontFamily:"var(--font-body)" }}>CX</div>
                  <div className="px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2"
                    style={{ background:"rgba(14,28,16,0.8)", border:"1px solid rgba(45,214,104,0.15)" }}>
                    {[0,1,2].map(i=>(
                      <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background:"#2dd668" }}
                        animate={{ y:[0,-7,0], opacity:[0.4,1,0.4] }}
                        transition={{ duration:0.9, delay:i*0.18, repeat:Infinity, ease:"easeInOut" }}/>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef}/>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 pb-20 md:pb-4"
        style={{ borderTop:"1px solid rgba(45,214,104,0.07)", background:"rgba(5,10,6,0.9)", backdropFilter:"blur(20px)" }}>
        <div className="max-w-2xl mx-auto">
          <ChatInput onSend={sendMessage} loading={loading} activeEngine={activeEngine} onEngineChange={setActiveEngine}/>
        </div>
      </div>
    </div>
  );
}
