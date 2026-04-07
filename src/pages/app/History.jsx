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
  const [confirm, setConfirm]   = useState(null); // id to delete

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
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            History
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold" style={{ fontFamily:"var(--font-body)", color:"#1a1a1a" }}>
              Past conversations
            </h1>
            {history.length > 0 && (
              <button onClick={() => setConfirm("all")}
                className="text-xs px-3 py-1.5 rounded-xl transition-all"
                style={{ color:"rgba(248,113,113,0.7)", border:"1px solid rgba(248,113,113,0.2)", fontFamily:"var(--font-body)" }}
                onMouseEnter={e=>{ e.currentTarget.style.color="#f87171"; e.currentTarget.style.background="rgba(248,113,113,0.08)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.color="rgba(248,113,113,0.7)"; e.currentTarget.style.background="transparent"; }}>
                Clear all
              </button>
            )}
          </div>
        </motion.div>

        {/* Search */}
        {history.length > 3 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }} className="mb-5">
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={e=>setSearch(e.target.value)}
              style={{
                background:"#ffffff", border:"1px solid #e8e8e3",
                color:"#1a1a1a", borderRadius:12, fontFamily:"var(--font-body)", fontSize:14,
                outline:"none", width:"100%", padding:"10px 14px",
              }}
              onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.5)"}
              onBlur={e=>e.target.style.borderColor="rgba(45,214,104,0.18)"}
            />
          </motion.div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
              style={{ background:"rgba(45,214,104,0.07)", border:"1px solid rgba(45,214,104,0.15)" }}>
              🕰️
            </div>
            <p className="text-sm font-medium mb-1" style={{ color:"rgba(240,250,242,0.6)", fontFamily:"var(--font-body)" }}>
              {search ? "No matches found" : "No conversations yet"}
            </p>
            <p className="text-xs mb-6" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>
              {search ? "Try a different search term" : "Start a chat and it will show up here"}
            </p>
            {!search && (
              <button onClick={() => navigate("/app/chat")}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold btn-green"
                style={{ color:"#050a06", fontFamily:"var(--font-body)" }}>
                Start a conversation
              </button>
            )}
          </motion.div>
        )}

        {/* List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((entry, i) => (
              <motion.div key={entry.id}
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, x:-20, height:0, marginBottom:0 }}
                transition={{ delay: i * 0.04, ease:[0.16,1,0.3,1] }}
                className="group flex items-start gap-4 rounded-2xl p-4 cursor-pointer transition-all duration-200"
                style={{ background:"rgba(14,28,16,0.7)", border:"1px solid rgba(45,214,104,0.13)" }}
                onClick={() => load(entry)}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(45,214,104,0.3)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(45,214,104,0.13)"}>

                {/* Icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.15)" }}>
                  💬
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold truncate" style={{ color:"#1a1a1a", fontFamily:"var(--font-body)" }}>
                      {entry.title}
                    </p>
                    <span className="text-xs flex-shrink-0" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>
                      {timeAgo(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
                    {getPreview(entry.messages)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>
                      {entry.messages?.length || 0} messages
                    </span>
                    {entry.userType && (
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ background:"rgba(45,214,104,0.06)", border:"1px solid rgba(45,214,104,0.15)", color:"rgba(45,214,104,0.6)", fontFamily:"var(--font-body)" }}>
                        {entry.userType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={e=>{ e.stopPropagation(); setConfirm(entry.id); }}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  style={{ color:"rgba(248,113,113,0.6)" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(248,113,113,0.1)"; e.currentTarget.style.color="#f87171"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(248,113,113,0.6)"; }}>
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
              onClick={() => setConfirm(null)}>
              <motion.div
                initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
                onClick={e=>e.stopPropagation()}
                className="rounded-2xl p-6 max-w-sm w-full"
                style={{ background:"rgba(14,28,16,0.98)", border:"1px solid rgba(45,214,104,0.2)" }}>
                <h3 className="text-base font-bold mb-2" style={{ color:"#1a1a1a", fontFamily:"var(--font-body)" }}>
                  {confirm === "all" ? "Clear all history?" : "Delete this conversation?"}
                </h3>
                <p className="text-sm mb-6" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
                  {confirm === "all"
                    ? "This will permanently delete all your conversation history. This can't be undone."
                    : "This conversation will be permanently deleted."}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"rgba(240,250,242,0.7)", fontFamily:"var(--font-body)" }}>
                    Cancel
                  </button>
                  <button onClick={() => confirm === "all" ? clearAll() : remove(confirm)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background:"rgba(248,113,113,0.15)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", fontFamily:"var(--font-body)" }}>
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
