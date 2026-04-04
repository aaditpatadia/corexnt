import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PillSidebar  from "./PillSidebar";
import BottomNav    from "./BottomNav";
import ChatInput    from "./ChatInput";
import ResponseCard from "./ResponseCard";

const ENGINE_ADDITIONS = {
  Narrative: "Focus on brand positioning, messaging, tone of voice.",
  Content:   "Focus on content marketing, thought leadership, formats.",
  Growth:    "Focus on marketing ROI, paid media, budget allocation.",
  Trend:     "Focus on market trends, competitor moves, category shifts.",
  Creator:   "Focus on influencer strategy, creator briefs, partnerships.",
};

const STARTER_CHIPS = [
  { label:"Build a campaign for my product",          emoji:"🚀" },
  { label:"Allocate my ₹5 lakh marketing budget",    emoji:"💼" },
  { label:"Audit our brand positioning",              emoji:"🔍" },
  { label:"What are our competitors doing",           emoji:"👁️" },
  { label:"Generate an influencer brief",             emoji:"✍️" },
  { label:"Find where we're losing customers",        emoji:"🧩" },
];

function getGreeting(name) {
  const h = new Date().getHours();
  const t = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${t}${name ? `, ${name.split(" ")[0]}` : ""}`;
}

export default function CompanyDashboard({ onUpgrade, onLogout }) {
  const userName = localStorage.getItem("corex_userName") || "";

  const [msgLeft, setMsgLeft] = useState(() => {
    const reset  = parseInt(localStorage.getItem("corex_msgReset")||"0",10);
    const stored = parseInt(localStorage.getItem("corex_msgLeft")||"10",10);
    if (Date.now() - reset > 86400000) {
      localStorage.setItem("corex_msgLeft","10");
      localStorage.setItem("corex_msgReset",Date.now().toString());
      return 10;
    }
    return isNaN(stored) ? 10 : stored;
  });

  const [messages,     setMessages]    = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("corex_chat")||"[]"); } catch { return []; }
  });
  const [apiHistory,   setApiHistory]  = useState([]);
  const [loading,      setLoading]     = useState(false);
  const [activeTab,    setActiveTab]   = useState("campaigns");
  const [activeEngine, setActiveEngine]= useState(null);
  const [showBanner,   setShowBanner]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);
  useEffect(() => { sessionStorage.setItem("corex_chat", JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem("corex_msgLeft", String(msgLeft)); }, [msgLeft]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    if (msgLeft <= 0) { setShowBanner(true); return; }

    const userMsg = { id:Date.now(), role:"user", content:text };
    setMessages(p => [...p, userMsg]);
    setMsgLeft(n => Math.max(0,n-1));

    const engineCtx = activeEngine ? `\n\n[Engine: ${activeEngine}] ${ENGINE_ADDITIONS[activeEngine]||""}` : "";
    const newHist = [...apiHistory, { role:"user", content:text + engineCtx + (userName?`\n[Brand: ${userName}]`:"") }];
    setApiHistory(newHist);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ messages:newHist }),
      });
      let reply = "";
      if (res.ok) { const d = await res.json(); reply = d.reply||""; }
      else if (res.status===429) reply="Slow down a bit\n\nToo many requests. Wait a moment.\n\nChips: 'Try again' | 'Different topic' | 'Campaign ideas'";
      else reply="Something's off on our end\n\nTry again in a sec.\n\nChips: 'Try again' | 'New topic' | 'Help'";

      const aMsg = { id:Date.now()+1, role:"assistant", content:reply, isNew:true };
      setMessages(p => [...p, aMsg]);
      setApiHistory(p => [...p, { role:"assistant", content:reply }]);
    } catch {
      setMessages(p => [...p, { id:Date.now()+1, role:"assistant", content:"Something's off on our end\n\nCheck your internet.\n\nChips: 'Try again' | 'New chat' | 'Help'" }]);
    }
    setLoading(false);
  }, [loading, apiHistory, activeEngine, msgLeft, userName]);

  const handleRegenerate = useCallback(() => {
    const last = [...messages].reverse().find(m=>m.role==="user");
    if (last) { setMessages(p=>p.slice(0,-1)); sendMessage(last.content); }
  }, [messages, sendMessage]);

  const newChat = () => {
    setMessages([]); setApiHistory([]);
    sessionStorage.removeItem("corex_chat");
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background:"var(--bg-base)" }}>
      <PillSidebar userType="company" activeTab={activeTab} onTabChange={setActiveTab} msgLeft={msgLeft} onUpgrade={onUpgrade} userName={userName} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0 relative z-10">
        {/* Topbar */}
        <div className="flex items-center justify-between h-14 px-5 flex-shrink-0"
          style={{ borderBottom:"1px solid rgba(45,214,104,0.07)", background:"rgba(5,10,6,0.85)", backdropFilter:"blur(20px)" }}>
          <div className="flex items-center gap-3">
            {activeEngine && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold"
                style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#2dd668" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                {activeEngine} Engine
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEmpty && (
              <button onClick={newChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{ color:"var(--text-muted)", border:"1px solid rgba(45,214,104,0.1)" }}
                onMouseEnter={e=>{ e.currentTarget.style.color="#f0faf2"; e.currentTarget.style.background="rgba(45,214,104,0.05)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.color="var(--text-muted)"; e.currentTarget.style.background="transparent"; }}>
                + New chat
              </button>
            )}
            <button onClick={onLogout}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ color:"var(--text-muted)", border:"1px solid rgba(45,214,104,0.1)" }}
              onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"}
              onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>

        {/* Upgrade banner */}
        <AnimatePresence>
          {showBanner && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
              className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
              style={{ background:"rgba(45,214,104,0.08)", borderBottom:"1px solid rgba(45,214,104,0.15)" }}>
              <span className="text-sm" style={{ color:"rgba(240,250,242,0.8)" }}>
                You've used all 10 free messages. Upgrade to continue.
              </span>
              <div className="flex gap-2">
                <button onClick={onUpgrade} className="px-4 py-1.5 rounded-xl text-xs font-bold btn-green" style={{ color:"#050a06" }}>Upgrade</button>
                <button onClick={()=>setShowBanner(false)} className="text-xs" style={{ color:"var(--text-muted)" }}>✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scroll-area">
          <div className="max-w-2xl mx-auto w-full px-4 py-6">
            <AnimatePresence>
              {isEmpty && (
                <motion.div
                  initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
                  transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
                  className="text-center pt-8 pb-6"
                >
                  <p className="text-sm font-medium mb-4" style={{ color:"rgba(45,214,104,0.6)" }}>
                    {getGreeting(userName)}
                  </p>
                  <h1 className="font-extrabold mb-3" style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(32px,5vw,48px)", color:"#f0faf2", lineHeight:1.15 }}>
                    What will you{" "}
                    <span className="gradient-text-green">build today?</span>
                  </h1>
                  <p className="text-sm mb-10" style={{ color:"var(--text-secondary)" }}>
                    Strategy, campaigns, budgets — all in one place.
                  </p>
                  <div className="flex flex-wrap gap-2.5 justify-center">
                    {STARTER_CHIPS.map((chip) => (
                      <motion.button
                        key={chip.label}
                        whileHover={{ y:-2 }}
                        whileTap={{ scale:0.97 }}
                        onClick={() => sendMessage(chip.label)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
                        style={{ background:"rgba(20,40,24,0.6)", border:"1px solid rgba(45,214,104,0.15)", color:"rgba(240,250,242,0.75)" }}
                        onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(45,214,104,0.4)"; e.currentTarget.style.background="rgba(45,214,104,0.08)"; e.currentTarget.style.color="#f0faf2"; }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(45,214,104,0.15)"; e.currentTarget.style.background="rgba(20,40,24,0.6)"; e.currentTarget.style.color="rgba(240,250,242,0.75)"; }}
                      >
                        <span>{chip.emoji}</span>
                        <span>{chip.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              {messages.map((msg, i) => (
                <ResponseCard
                  key={msg.id} message={msg}
                  animate={msg.isNew && msg.role==="assistant" && i===messages.length-1}
                  onChip={sendMessage} onRegenerate={handleRegenerate}
                />
              ))}
              <AnimatePresence>
                {loading && (
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background:"rgba(45,214,104,0.15)", border:"1px solid rgba(45,214,104,0.3)", color:"#2dd668", fontFamily:"Sora,sans-serif" }}>CX</div>
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
        <div className="flex-shrink-0 p-4 pb-6 md:pb-4"
          style={{ borderTop:"1px solid rgba(45,214,104,0.07)", background:"rgba(5,10,6,0.9)", backdropFilter:"blur(20px)" }}>
          <div className="max-w-2xl mx-auto">
            <ChatInput onSend={sendMessage} loading={loading} activeEngine={activeEngine} onEngineChange={setActiveEngine}/>
          </div>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onUpgrade={onUpgrade}/>
    </div>
  );
}
