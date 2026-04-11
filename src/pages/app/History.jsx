import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0)  return `${d}d ago`;
  if (h > 0)  return `${h}h ago`;
  if (m > 0)  return `${m}m ago`;
  return "Just now";
}

function getPreview(messages) {
  const ai = [...messages].reverse().find(m => m.role === "assistant");
  if (!ai) return "No response yet";
  return ai.content
    .replace(/\*\*/g,"").replace(/^##\s*/gm,"").replace(/GRAPH_DATA:[\s\S]*$/m,"").replace(/Chips:.*$/m,"")
    .trim().slice(0, 90) + "…";
}

export default function History() {
  const navigate  = useNavigate();
  const [history, setHistory]   = useState([]);
  const [search,  setSearch]    = useState("");
  const [confirm, setConfirm]   = useState(null);

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("corex_history") || "[]");
      setHistory(h);
    } catch {
      setHistory([]);
    }
  }, []);

  const load = (entry) => {
    sessionStorage.setItem("corex_chat", JSON.stringify(entry.messages));
    sessionStorage.setItem("corex_session_id", entry.id);
    navigate("/app/chat");
  };

  const remove = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem("corex_history", JSON.stringify(updated));
    setConfirm(null);
  };

  const clearAll = () => {
    setHistory([]);
    localStorage.removeItem("corex_history");
    setConfirm(null);
  };

  const filtered = search.trim()
    ? history.filter(h => h.title.toLowerCase().includes(search.toLowerCase()))
    : history;

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#000000" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 600, marginBottom: 16, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            History
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 32, fontWeight: 400, color: "#ffffff" }}>
              Past conversations
            </h1>
            {history.length > 0 && (
              <button onClick={() => setConfirm("all")}
                style={{ fontSize: 12, padding: "6px 14px", borderRadius: 100, color: "rgba(248,113,113,0.6)", border: "1px solid rgba(248,113,113,0.2)", background: "transparent", fontFamily: "var(--font-body)", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e=>{ e.currentTarget.style.color="#f87171"; e.currentTarget.style.background="rgba(248,113,113,0.08)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.color="rgba(248,113,113,0.6)"; e.currentTarget.style.background="transparent"; }}>
                Clear all
              </button>
            )}
          </div>
        </motion.div>

        {/* Search */}
        {history.length > 3 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }} style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={e=>setSearch(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#ffffff", borderRadius: 12, fontFamily: "var(--font-body)", fontSize: 14,
                outline: "none", width: "100%", padding: "10px 14px",
              }}
              onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.2)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}
            />
          </motion.div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              🕰️
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", marginBottom: 6 }}>
              {search ? "No matches found" : "No conversations yet"}
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)", marginBottom: 24 }}>
              {search ? "Try a different search term" : "Start a chat and it will show up here"}
            </p>
            {!search && (
              <button onClick={() => navigate("/app/chat")}
                style={{
                  padding: "10px 24px", borderRadius: 100, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
                  color: "#000000", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)",
                }}>
                Start a conversation
              </button>
            )}
          </motion.div>
        )}

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AnimatePresence>
            {filtered.map((entry, i) => (
              <motion.div key={entry.id}
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, x:-20, height:0, marginBottom:0 }}
                transition={{ delay: i * 0.04, ease:[0.16,1,0.3,1] }}
                style={{ display: "flex", alignItems: "flex-start", gap: 16, borderRadius: 20, padding: 16, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", transition: "all 0.2s" }}
                onClick={() => load(entry)}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.14)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}>

                <div style={{ width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  💬
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", fontFamily: "var(--font-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.title}
                    </p>
                    <span style={{ fontSize: 12, flexShrink: 0, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)" }}>
                      {timeAgo(entry.timestamp)}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {getPreview(entry.messages)}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}>
                      {entry.messages?.length || 0} messages
                    </span>
                    {entry.userType && (
                      <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
                        {entry.userType}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={e=>{ e.stopPropagation(); setConfirm(entry.id); }}
                  style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", color: "rgba(248,113,113,0.4)", transition: "all 0.15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(248,113,113,0.1)"; e.currentTarget.style.color="#f87171"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(248,113,113,0.4)"; }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Confirm delete modal */}
        <AnimatePresence>
          {confirm && (
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
              onClick={() => setConfirm(null)}>
              <motion.div
                initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
                onClick={e=>e.stopPropagation()}
                style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 24, maxWidth: 360, width: "100%" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-body)", marginBottom: 8 }}>
                  {confirm === "all" ? "Clear all history?" : "Delete this conversation?"}
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", marginBottom: 24, lineHeight: 1.5 }}>
                  {confirm === "all"
                    ? "This will permanently delete all your conversation history. This can't be undone."
                    : "This conversation will be permanently deleted."}
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setConfirm(null)}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 100, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button onClick={() => confirm === "all" ? clearAll() : remove(confirm)}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 100, background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer" }}>
                    {confirm === "all" ? "Clear all" : "Delete"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
