import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function HistoryDrawer({ open, onClose, onLoad, userType }) {
  const [history, setHistory] = useState([]);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (open) {
      try {
        const raw = localStorage.getItem("corex_history");
        setHistory(raw ? JSON.parse(raw) : []);
      } catch { setHistory([]); }
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  const deleteConv = (id, e) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem("corex_history", JSON.stringify(updated));
  };

  const isCreator = userType !== "company";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-40"
            style={{ background:"rgba(0,0,0,0.4)", backdropFilter:"blur(2px)" }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
            transition={{ type:"spring", stiffness:300, damping:30 }}
            className="fixed top-0 right-0 h-full z-50 flex flex-col"
            style={{ width:"min(320px,100vw)", background:"rgba(8,12,9,0.98)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderLeft:"1px solid rgba(255,255,255,0.08)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-sm font-semibold" style={{ color:"#f0faf2", fontFamily:"var(--font-body)" }}>Your conversations</span>
              <button onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all"
                style={{ color:"var(--text-muted)" }}
                onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
                ✕
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scroll-area py-2">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
                  <div className="text-3xl mb-3">💬</div>
                  <p className="text-sm font-medium mb-2" style={{ color:"#f0faf2", fontFamily:"var(--font-body)" }}>No conversations yet</p>
                  <p className="text-xs" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>Start chatting to see your history here.</p>
                </div>
              ) : (
                history.map((conv) => (
                  <motion.button
                    key={conv.id}
                    layout
                    whileHover={{ backgroundColor:"rgba(45,214,104,0.04)" }}
                    onClick={() => onLoad(conv)}
                    className="w-full text-left px-5 py-3.5 group flex items-start justify-between gap-2 transition-all"
                    style={{ borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color:"rgba(240,250,242,0.85)", fontFamily:"var(--font-body)", maxWidth:"200px" }}>
                        {(conv.title || "Conversation").slice(0, 45)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>
                          {timeAgo(conv.timestamp || conv.updatedAt || Date.now())}
                        </p>
                        {conv.userType && (
                          <span style={{ fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:20, fontFamily:"var(--font-body)",
                            background: conv.userType === "company" ? "rgba(124,58,237,0.1)" : "rgba(45,214,104,0.1)",
                            color: conv.userType === "company" ? "#a78bfa" : "#2dd668",
                            border: conv.userType === "company" ? "1px solid rgba(124,58,237,0.2)" : "1px solid rgba(45,214,104,0.2)",
                          }}>
                            {conv.userType === "company" ? "Brand" : "Creator"}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteConv(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-all text-xs"
                      style={{ color:"rgba(248,113,113,0.6)" }}
                      onMouseEnter={e=>e.currentTarget.style.color="#f87171"}
                      onMouseLeave={e=>e.currentTarget.style.color="rgba(248,113,113,0.6)"}>
                      ✕
                    </button>
                  </motion.button>
                ))
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="px-5 py-3 flex-shrink-0" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <button
                  onClick={() => { localStorage.removeItem("corex_history"); setHistory([]); }}
                  className="text-xs transition-all"
                  style={{ color:"rgba(248,113,113,0.5)", fontFamily:"var(--font-body)" }}
                  onMouseEnter={e=>e.currentTarget.style.color="#f87171"} onMouseLeave={e=>e.currentTarget.style.color="rgba(248,113,113,0.5)"}>
                  Clear all history
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
