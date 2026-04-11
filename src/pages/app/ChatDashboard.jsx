import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatInput    from "../../components/ChatInput";
import ResponseCard from "../../components/ResponseCard";
import { stripMarkdown } from "../../utils/parseResponse";
import { getProfileContext } from "../../utils/userProfile";

const FREE_LIMIT = 15;

/* ── Helpers ── */
function getTodayKey() { return `corex_msgs_${new Date().toDateString()}`; }
function getMsgsUsed() { return parseInt(localStorage.getItem(getTodayKey()) || "0", 10); }

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

/* ── BRANCHES parser ── */
function parseBranches(text) {
  const a = text.match(/BRANCH_A:\s*([^|\n]+)\|\s*([^\n]+)/);
  const b = text.match(/BRANCH_B:\s*([^|\n]+)\|\s*([^\n]+)/);
  const c = text.match(/BRANCH_C:\s*([^|\n]+)\|\s*([^\n]+)/);
  const t = text.match(/THINKING:\s*([^\n]+)/);
  if (!a || !b || !c) return null;
  return {
    branches: [
      { label: "Direction A", title: a[1].trim(), desc: a[2].trim() },
      { label: "Direction B", title: b[1].trim(), desc: b[2].trim() },
      { label: "Direction C", title: c[1].trim(), desc: c[2].trim() },
    ],
    thinking: t?.[1]?.trim() || "",
  };
}

/* ── Branch Cards ── */
function BranchCards({ data, onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: 28, width: "100%" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          maxWidth: 900,
          margin: "0 auto",
        }}
        className="branch-grid"
      >
        {data.branches.map((branch, i) => {
          const isSelected = selected === i;
          return (
            <motion.button
              key={i}
              onClick={() => {
                setSelected(i);
                setTimeout(() => onSelect(branch.title), 300);
              }}
              whileHover={{ translateY: -2 }}
              transition={{ duration: 0.2 }}
              style={{
                padding: 24,
                borderRadius: 20,
                border: isSelected
                  ? "1px solid rgba(156,252,175,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: isSelected
                  ? "rgba(156,252,175,0.04)"
                  : "rgba(255,255,255,0.04)",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "'Instrument Sans', sans-serif",
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {branch.label}
              </span>
              <h3
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 20,
                  fontWeight: 400,
                  color: "#ffffff",
                  lineHeight: 1.3,
                  margin: "0 0 10px",
                }}
              >
                {branch.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.55)",
                  fontFamily: "'Instrument Sans', sans-serif",
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                {branch.desc}
              </p>
              <span
                style={{
                  marginTop: 16,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "'Instrument Sans', sans-serif",
                }}
              >
                Explore this →
              </span>
            </motion.button>
          );
        })}
      </div>

      {data.thinking && (
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'Instrument Sans', sans-serif",
            fontStyle: "italic",
            marginTop: 16,
            maxWidth: 900,
            margin: "16px auto 0",
          }}
        >
          {data.thinking}
        </p>
      )}
    </motion.div>
  );
}

/* ── Thinking animation ── */
const THINKING_PHRASES = [
  "Analysing your idea…",
  "Searching live data…",
  "Building creative directions…",
  "Mapping the space…",
  "Checking market pulse…",
  "Considering angles…",
];

function ThinkingCard() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % THINKING_PHRASES.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
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
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
          {[0,1,2,3].map(i => (
            <motion.div
              key={i}
              animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
              style={{
                width: 3,
                height: 18,
                borderRadius: 99,
                background: "rgba(156,252,175,0.6)",
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 500,
          }}
        >
          {THINKING_PHRASES[idx]}
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
        You've used all 15 messages for today.
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
function WelcomeScreen({ userName }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "40px 24px 180px",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontSize: 32,
            color: "#ffffff",
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          Hey {userName?.split(" ")[0] || "there"},
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 500,
            fontSize: 28,
            color: "#ffffff",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          What idea are we exploring today?
        </motion.h1>
      </motion.div>
    </div>
  );
}

/* ── Main ChatDashboard ── */
export default function ChatDashboard({ userType, userName, onUpgrade }) {
  const [messages,  setMessages]  = useState(() => {
    try { const s = sessionStorage.getItem("corex_chat"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [loading,   setLoading]   = useState(false);
  const [revealing, setRevealing] = useState(null);
  const [limitHit,  setLimitHit]  = useState(getMsgsUsed() >= FREE_LIMIT);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!sessionStorage.getItem("corex_session_id"))
      sessionStorage.setItem("corex_session_id", Date.now().toString());
    if (!localStorage.getItem("corex_joined"))
      localStorage.setItem("corex_joined", new Date().toISOString());
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

  // Scroll to bottom
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  function trackUsage() {
    const key  = getTodayKey();
    const used = parseInt(localStorage.getItem(key) || "0", 10) + 1;
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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      reply      = data.reply || "Something went wrong. Try again.";
      searchUsed = !!data.usedWebSearch;
    } catch {
      reply = `Connection error. Please try again.\n\nFOLLOWUPS: ["Try again", "New idea"]`;
    }

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

  // Handler when user picks a branch
  const handleBranchSelect = useCallback((branchTitle) => {
    sendMessage(`Let's go with "${branchTitle}". Deepen this direction.`, []);
  }, [sendMessage]);

  return (
    <div
      style={{
        background: "#000000",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Messages scrollable area */}
      <div
        className="scroll-area"
        style={{
          flex: 1,
          overflowY: "auto",
          position: "relative",
        }}
      >
        {messages.length === 0 ? (
          <WelcomeScreen userName={userName} />
        ) : (
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto",
              padding: "24px 24px 0",
              display: "flex",
              flexDirection: "column",
              paddingBottom: "max(180px, calc(180px + env(safe-area-inset-bottom)))",
            }}
          >
            <AnimatePresence>
              {messages.map(msg => {
                // Branches response
                if (msg.role === "assistant" && msg.id !== revealing) {
                  const branches = parseBranches(msg.content || "");
                  if (branches) {
                    return (
                      <BranchCards
                        key={msg.id}
                        data={branches}
                        onSelect={handleBranchSelect}
                      />
                    );
                  }
                }

                // Revealing (word by word)
                if (msg.role === "assistant" && msg.id === revealing) {
                  const branches = parseBranches(msg.content || "");
                  if (branches) {
                    return (
                      <BranchCards
                        key={msg.id}
                        data={branches}
                        onSelect={handleBranchSelect}
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
                    onRegenerate={() => {
                      const prev = messages.slice(0, messages.findIndex(m => m.id === msg.id));
                      const last = [...prev].reverse().find(m => m.role === "user");
                      if (last) { setMessages(prev); setTimeout(() => sendMessage(last.content, []), 50); }
                    }}
                  />
                );
              })}
            </AnimatePresence>

            {loading && <ThinkingCard />}
            {limitHit && !loading && <LimitBanner onUpgrade={onUpgrade} />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Fixed bottom input */}
      <ChatInput onSend={sendMessage} disabled={loading || limitHit} userType={userType} />

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
