import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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

/* ── Streaming card ── */
function StreamingCard({ message, userType }) {
  const isCreator   = userType !== "company";
  const accentColor = isCreator ? "#2dd668" : "#a78bfa";
  const accentRgba  = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";

  const text = stripMarkdown(
    (message.content || "")
      .replace(/GRAPH_DATA:[\s\S]*$/m, "")
      .replace(/Chips:.*$/m, "")
      .trim()
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <div style={{ width: 16, height: 16, borderRadius: 4, background: `${accentRgba}0.12)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="9" height="9" viewBox="0 0 32 32" fill="none">
            <path d="M8 16c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round"/>
            <circle cx="16" cy="21" r="4" fill={accentColor}/>
          </svg>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#1a7a3c", fontFamily: "var(--font-body)" }}>COREX</span>
      </div>
      {text ? (
        <div className="typing-cursor" style={{ fontSize: 15, lineHeight: 1.8, color: "#1a1a1a", fontFamily: "var(--font-body)", whiteSpace: "pre-wrap" }}>
          {text}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 4, paddingTop: 4 }}>
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor }}/>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Limit banner ── */
function LimitBanner({ onUpgrade, isCreator }) {
  const accent = isCreator ? "#2dd668" : "#a78bfa";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: "12px 20px", borderRadius: 14, background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", margin: "8px 0", textAlign: "center" }}>
      <p style={{ fontSize: 14, color: "#f0faf2", fontFamily: "var(--font-body)", marginBottom: 6 }}>
        You've used all 15 messages for today.
      </p>
      <button onClick={onUpgrade}
        style={{ fontSize: 13, fontWeight: 700, color: accent, background: "none", border: "none", cursor: "none", fontFamily: "var(--font-body)" }}>
        Upgrade for unlimited →
      </button>
    </motion.div>
  );
}

/* ── Welcome screen ── */
function WelcomeScreen({ userType, userName, onChip }) {
  const isCreator   = userType !== "company";
  const accentColor = isCreator ? "#2dd668" : "#a78bfa";
  const accentRgba  = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";
  const subtitle    = isCreator ? "Reels · Growth · Brand Deals · Trends" : "Campaigns · Strategy · Budgets · Intel";
  const chips       = isCreator
    ? ["Write me a viral reel script", "Audit my Instagram growth", "What's trending this week?", "Price my brand deal"]
    : ["Build a campaign strategy", "Allocate my marketing budget", "Audit our brand positioning", "Analyse our competitors"];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px 24px", textAlign: "center", paddingBottom: 120 }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Logo mark */}
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #1a7a3c, #2dd668)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.9)" }}/>
        </div>

        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ fontSize: 15, color: "#888888", fontFamily: "var(--font-body)", marginBottom: 8 }}>
          {getGreeting(userName)}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2, marginBottom: 8, textAlign: "center" }}>
          What will you create today?
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ fontSize: 15, color: "#888888", fontFamily: "var(--font-body)", marginBottom: 32, textAlign: "center" }}>
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
                padding: "14px 18px", borderRadius: 14, textAlign: "left", fontSize: 14,
                fontFamily: "var(--font-body)", background: "#ffffff",
                border: "1px solid #e0e0e0", color: "#444444",
                cursor: "none", transition: "all 0.25s ease", lineHeight: 1.4,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#c0c0c0"; e.currentTarget.style.color = "#1a1a1a"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.color = "#444444"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
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
  const navigate  = useNavigate();
  const isCreator = userType !== "company";

  const [messages,  setMessages]  = useState(() => {
    try { const s = sessionStorage.getItem("corex_chat"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [loading,   setLoading]   = useState(false);
  const [limitHit,  setLimitHit]  = useState(getMsgsUsed() >= FREE_LIMIT);
  const bottomRef = useRef(null);

  const bgStyle = { background: "#f5f5f0" };

  useEffect(() => {
    if (!sessionStorage.getItem("corex_session_id")) sessionStorage.setItem("corex_session_id", Date.now().toString());
    if (!localStorage.getItem("corex_joined")) localStorage.setItem("corex_joined", new Date().toISOString());
  }, []);

  // Prefill from other pages
  useEffect(() => {
    const p = sessionStorage.getItem("corex_prefill");
    if (p) { sessionStorage.removeItem("corex_prefill"); setTimeout(() => sendMessage(p, []), 150); }
  }, []);

  // Expose to TopBar (new chat button)
  useEffect(() => {
    window.__corex_newChat = () => {
      setMessages([]);
      sessionStorage.removeItem("corex_chat");
      sessionStorage.setItem("corex_session_id", Date.now().toString());
    };
    window.__corex_loadConversation = (conv) => {
      if (conv?.messages) {
        setMessages(conv.messages);
        sessionStorage.setItem("corex_session_id", conv.id);
        try { sessionStorage.setItem("corex_chat", JSON.stringify(conv.messages)); } catch {}
      }
    };
    return () => {
      delete window.__corex_newChat;
      delete window.__corex_loadConversation;
    };
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
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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
    const streamId     = Date.now() + 1;
    const placeholder  = { id: streamId, role: "assistant", content: "", streaming: true };

    setMessages(prev => [...prev, userMsg, placeholder]);
    setLoading(true);
    trackUsage();

    const fullHistory   = [...messages, userMsg];
    const contextWindow = fullHistory.slice(-15);
    const profileContext = getProfileContext(userType);

    let fullText  = "";
    let searchUsedFlag = false;
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

      const ct = res.headers.get("Content-Type") || "";
      if (ct.includes("text/event-stream")) {
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n"); buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") break;
            try {
              const p = JSON.parse(raw);
              // Meta event (search used)
              if (p.meta?.searchUsed) {
                searchUsedFlag = true;
                setMessages(prev => {
                  const u = [...prev];
                  const idx = u.findIndex(m => m.id === streamId);
                  if (idx !== -1) u[idx] = { ...u[idx], searchUsed: true };
                  return u;
                });
                continue;
              }
              if (p.delta) {
                fullText += p.delta;
                setMessages(prev => {
                  const u = [...prev];
                  const idx = u.findIndex(m => m.id === streamId);
                  if (idx !== -1) u[idx] = { ...u[idx], content: fullText };
                  return u;
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
      fullText = "Connection error. Please try again.\n\nChips: 'Try again' | 'New chat' | 'Help'";
    }

    setMessages(prev => {
      const u = [...prev];
      const idx = u.findIndex(m => m.id === streamId);
      if (idx !== -1) u[idx] = { ...u[idx], content: fullText, streaming: false, searchUsed: searchUsedFlag };
      const final = [...u];
      const first = final.find(m => m.role === "user");
      if (first) saveToHistory(first.content, final, userType);
      return final;
    });
    setLoading(false);
  }, [messages, loading, userType]);

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem("corex_chat");
    sessionStorage.setItem("corex_session_id", Date.now().toString());
  };

  return (
    <div style={{ ...bgStyle, height: "100%", position: "relative" }}>

      {/* Messages — scrollable, padded to clear fixed input bar */}
      <div className="scroll-area" style={{ height: "100%", overflowY: "auto", paddingBottom: 140 }}>
        {messages.length === 0 ? (
          <WelcomeScreen userType={userType} userName={userName} onChip={chip => sendMessage(chip, [])}/>
        ) : (
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 0", display: "flex", flexDirection: "column" }}>
            <AnimatePresence>
              {messages.map(msg =>
                msg.streaming
                  ? <StreamingCard key={msg.id} message={msg} userType={userType}/>
                  : <ResponseCard
                      key={msg.id}
                      message={msg}
                      userType={userType}
                      onChip={chip => sendMessage(chip, [])}
                      onRegenerate={() => {
                        const prev = messages.slice(0, -1);
                        const last = [...prev].reverse().find(m => m.role === "user");
                        if (last) { setMessages(prev.filter(m => m.id !== msg.id)); setTimeout(() => sendMessage(last.content, []), 50); }
                      }}
                    />
              )}
            </AnimatePresence>
            {limitHit && <LimitBanner onUpgrade={onUpgrade} isCreator={isCreator} />}
            <div ref={bottomRef}/>
          </div>
        )}
      </div>

      {/* Fixed bottom input bar */}
      <ChatInput onSend={sendMessage} disabled={loading || limitHit} userType={userType}/>
    </div>
  );
}
