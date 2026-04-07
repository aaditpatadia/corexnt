import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatInput    from "../../components/ChatInput";
import ResponseCard from "../../components/ResponseCard";
import { stripMarkdown } from "../../utils/parseResponse";
import { getProfileContext } from "../../utils/userProfile";

const FREE_LIMIT = 15;

/* ── Helpers ── */
function getGreeting(name) {
  const h = new Date().getHours();
  const t = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${t}${name ? `, ${name.split(" ")[0]}` : ""}`;
}

function getTodayKey() {
  return `corex_msgs_${new Date().toDateString()}`;
}

function getMsgsUsed() {
  return parseInt(localStorage.getItem(getTodayKey()) || "0", 10);
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

/* ── Word-by-word reveal card (v6) ── */
function RevealCard({ message, userType }) {
  const [visibleWords, setVisibleWords] = useState(0);
  const fullText = stripMarkdown(
    (message.content || "")
      .replace(/GRAPH_DATA:[\s\S]*$/m, "")
      .replace(/Chips:.*$/m, "")
      .trim()
  );
  const words = fullText.split(/(\s+)/);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Reveal ~8 words per frame at 60fps → smooth and fast
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full" style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#1a7a3c", fontFamily: "var(--font-body)" }}>COREX</span>
        {message.searchUsed && (
          <span style={{ fontSize: 10, fontWeight: 600, color: "#1a7a3c", background: "#e8f5ee", border: "1px solid #c8e6d4", borderRadius: 20, padding: "1px 7px", fontFamily: "var(--font-body)" }}>
            ● Live data
          </span>
        )}
      </div>
      {visible ? (
        <div style={{ fontSize: 15, lineHeight: 1.8, color: "#1a1a1a", fontFamily: "var(--font-body)", whiteSpace: "pre-wrap" }}>
          {visible}<span style={{ opacity: 0.4 }}>|</span>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 4, paddingTop: 4 }}>
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a7a3c" }}/>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Limit banner ── */
function LimitBanner({ onUpgrade }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: "12px 20px", borderRadius: 14, background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.2)", margin: "8px 0", textAlign: "center" }}>
      <p style={{ fontSize: 14, color: "#1a1a1a", fontFamily: "var(--font-body)", marginBottom: 6 }}>
        You've used all 15 messages for today.
      </p>
      <button onClick={onUpgrade}
        style={{ fontSize: 13, fontWeight: 700, color: "#1a7a3c", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}>
        Upgrade for unlimited →
      </button>
    </motion.div>
  );
}

/* ── Welcome screen ── */
function WelcomeScreen({ userType, userName, onChip }) {
  const isCreator = userType !== "company";
  const subtitle  = isCreator ? "Reels · Growth · Brand Deals · Trends" : "Campaigns · Strategy · Budgets · Intel";
  const chips     = isCreator
    ? ["Write me a viral reel script", "Audit my Instagram growth", "What's trending this week?", "Price my brand deal"]
    : ["Build a campaign strategy", "Allocate my marketing budget", "Audit our brand positioning", "Analyse our competitors"];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px 24px", textAlign: "center", paddingBottom: 120 }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0, duration: 0.5 }}
          style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #1a7a3c, #2dd668)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 8px 24px rgba(26,122,60,0.25)" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.92)" }}/>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ fontSize: 15, color: "#888888", fontFamily: "var(--font-body)", marginBottom: 8 }}>
          {getGreeting(userName)}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 400, color: "#1a1a1a", lineHeight: 1.2, marginBottom: 8, textAlign: "center" }}>
          What will you create today?
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ fontSize: 15, color: "#888888", fontFamily: "var(--font-body)", marginBottom: 36, textAlign: "center" }}>
          {subtitle}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 480, width: "100%" }}>
          {chips.map((chip, i) => (
            <motion.button key={chip}
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChip(chip)}
              style={{
                padding: "14px 18px", borderRadius: 20, textAlign: "left", fontSize: 14,
                fontFamily: "var(--font-body)", background: "#ffffff",
                border: "1px solid #e8e8e3", color: "#444444",
                cursor: "pointer", transition: "all 0.2s ease", lineHeight: 1.4,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a7a3c"; e.currentTarget.style.color = "#1a7a3c"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(26,122,60,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e3"; e.currentTarget.style.color = "#444444"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              {chip}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Main ChatDashboard ── */
export default function ChatDashboard({ userType, userName, onUpgrade }) {
  const isCreator = userType !== "company";

  const [messages,  setMessages]  = useState(() => {
    try { const s = sessionStorage.getItem("corex_chat"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [loading,   setLoading]   = useState(false);
  const [revealing, setRevealing] = useState(null); // id of message being word-revealed
  const [limitHit,  setLimitHit]  = useState(getMsgsUsed() >= FREE_LIMIT);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!sessionStorage.getItem("corex_session_id")) sessionStorage.setItem("corex_session_id", Date.now().toString());
    if (!localStorage.getItem("corex_joined")) localStorage.setItem("corex_joined", new Date().toISOString());
  }, []);

  // Prefill from other pages
  useEffect(() => {
    const p = sessionStorage.getItem("corex_prefill");
    if (p) { sessionStorage.removeItem("corex_prefill"); setTimeout(() => sendMessage(p, []), 150); }
  }, []);

  // Expose to TopBar
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

  // Scroll to bottom
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  function trackUsage() {
    const key  = getTodayKey();
    const used = (parseInt(localStorage.getItem(key) || "0", 10) + 1);
    localStorage.setItem(key, used.toString());
    if (used >= FREE_LIMIT) setLimitHit(true);
  }

  const sendMessage = useCallback(async (text, files = []) => {
    if ((!text?.trim() && !files.length) || loading) return;
    if (getMsgsUsed() >= FREE_LIMIT) { setLimitHit(true); return; }

    const displayFiles = files.map(({ name, type, preview }) => ({ name, type, preview }));
    const apiFiles     = files.map(({ name, type, b64 })     => ({ name, type, b64 }));
    const userMsg      = { id: Date.now(), role: "user", content: text, files: displayFiles };
    const assistantId  = Date.now() + 1;

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    trackUsage();

    const fullHistory    = [...messages, userMsg];
    const contextWindow  = fullHistory.slice(-15);
    const profileContext = getProfileContext(userType);

    let reply      = "";
    let searchUsed = false;
    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages:       contextWindow.map(m => ({ role: m.role, content: m.content || "" })),
          files:          apiFiles,
          userType,
          profileContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      reply      = data.reply || "Something went wrong. Try again.";
      searchUsed = !!data.usedWebSearch;
    } catch (err) {
      reply = `Connection error. Please try again.\n\nChips: 'Try again' | 'New chat' | 'Help'`;
    }

    const assistantMsg = { id: assistantId, role: "assistant", content: reply, streaming: false, searchUsed };

    setMessages(prev => {
      const updated = [...prev, assistantMsg];
      const first   = updated.find(m => m.role === "user");
      if (first) saveToHistory(first.content, updated, userType);
      return updated;
    });

    // Start word-by-word reveal
    setRevealing(assistantId);
    setLoading(false);

    // Stop reveal flag after a reasonable time (reveal card handles its own timing)
    setTimeout(() => setRevealing(null), 8000);
  }, [messages, loading, userType]);

  return (
    <div style={{ background: "#f0f0eb", height: "100%", position: "relative" }}>

      {/* Messages scrollable area */}
      <div className="scroll-area" style={{ height: "100%", overflowY: "auto", paddingBottom: 140 }}>
        {messages.length === 0 ? (
          <WelcomeScreen userType={userType} userName={userName} onChip={chip => sendMessage(chip, [])}/>
        ) : (
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 0", display: "flex", flexDirection: "column" }}>
            <AnimatePresence>
              {messages.map(msg =>
                msg.role === "assistant" && msg.id === revealing
                  ? <RevealCard key={msg.id} message={msg} userType={userType}/>
                  : <ResponseCard
                      key={msg.id}
                      message={msg}
                      userType={userType}
                      onChip={chip => sendMessage(chip, [])}
                      onRegenerate={() => {
                        const prev = messages.slice(0, messages.findIndex(m => m.id === msg.id));
                        const last = [...prev].reverse().find(m => m.role === "user");
                        if (last) { setMessages(prev); setTimeout(() => sendMessage(last.content, []), 50); }
                      }}
                    />
              )}
            </AnimatePresence>

            {/* Loading dots while waiting for API */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#1a7a3c", fontFamily: "var(--font-body)" }}>COREX</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a7a3c" }}/>
                  ))}
                </div>
              </motion.div>
            )}

            {limitHit && !loading && <LimitBanner onUpgrade={onUpgrade}/>}
            <div ref={bottomRef}/>
          </div>
        )}
      </div>

      {/* Fixed bottom input */}
      <ChatInput onSend={sendMessage} disabled={loading || limitHit} userType={userType}/>
    </div>
  );
}
