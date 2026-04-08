import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function excerpt(text, len = 120) {
  const clean = text.replace(/\*\*/g,"").replace(/^#{1,6}\s*/gm,"").replace(/\n+/g," ").trim();
  return clean.length > len ? clean.slice(0, len) + "…" : clean;
}

function ReportCard({ report, onDelete, onView }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, scale:0.96 }}
      className="rounded-2xl p-5 transition-all duration-200"
      style={{ background:"#ffffff", border:"1px solid #e8e8e3" }}
      onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(45,214,104,0.3)"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(45,214,104,0.15)"}>

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color:"#1a7a3c", fontFamily:"var(--font-body)" }}>
            {timeAgo(report.savedAt)}
          </p>
          <h3 className="text-sm font-bold leading-snug" style={{ color:"#1a1a1a", fontFamily:"var(--font-body)" }}>
            {report.title || "COREX Response"}
          </h3>
        </div>
        <span className="text-2xl flex-shrink-0">{report.emoji || "📄"}</span>
      </div>

      <p className="text-xs leading-relaxed mb-4" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
        {excerpt(report.content)}
      </p>

      <div className="flex gap-2">
        <button onClick={() => onView(report)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background:"rgba(45,214,104,0.1)", border:"1px solid rgba(45,214,104,0.25)", color:"#1a7a3c", fontFamily:"var(--font-body)" }}>
          View →
        </button>
        <button
          onClick={() => { setDeleting(true); setTimeout(() => onDelete(report.id), 200); }}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171", fontFamily:"var(--font-body)", opacity:deleting?0.5:1 }}>
          Delete
        </button>
      </div>
    </motion.div>
  );
}

function ReportModal({ report, onClose }) {
  if (!report) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background:"rgba(5,10,6,0.85)", backdropFilter:"blur(8px)" }}
        onClick={onClose}>
        <motion.div
          initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
          className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 scroll-area"
          style={{ background:"rgba(14,28,16,0.98)", border:"1px solid rgba(45,214,104,0.2)" }}
          onClick={e=>e.stopPropagation()}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color:"#1a7a3c", fontFamily:"var(--font-body)" }}>
                Saved report · {timeAgo(report.savedAt)}
              </p>
              <h2 className="text-lg font-bold" style={{ color:"#1a1a1a", fontFamily:"var(--font-body)" }}>{report.title || "COREX Response"}</h2>
            </div>
            <button onClick={onClose} className="text-xl leading-none ml-4 flex-shrink-0" style={{ color:"rgba(240,250,242,0.4)" }}>✕</button>
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
            {report.content.replace(/\*\*/g,"").replace(/^#{1,6}\s*/gm,"").trim()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Reports() {
  const [reports,  setReports]  = useState([]);
  const [viewing,  setViewing]  = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("corex_reports");
      if (raw) setReports(JSON.parse(raw).reverse());
    } catch {}
  }, []);

  const deleteReport = (id) => {
    setReports(prev => {
      const updated = prev.filter(r => r.id !== id);
      try {
        // Keep original order (not reversed) in storage
        const stored = JSON.parse(localStorage.getItem("corex_reports") || "[]");
        localStorage.setItem("corex_reports", JSON.stringify(stored.filter(r => r.id !== id)));
      } catch {}
      return updated;
    });
  };

  const clearAll = () => {
    localStorage.removeItem("corex_reports");
    setReports([]);
  };

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#1a7a3c", fontFamily:"var(--font-body)" }}>
              📁 Reports
            </div>
            {reports.length > 0 && (
              <button onClick={clearAll}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171", fontFamily:"var(--font-body)" }}>
                Clear all
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily:"var(--font-body)", color:"#1a1a1a" }}>Saved reports</h1>
          <p className="text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
            All your bookmarked COREX responses in one place.
          </p>
        </motion.div>

        {reports.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-base font-semibold mb-2" style={{ color:"#1a1a1a", fontFamily:"var(--font-body)" }}>No saved reports yet</p>
            <p className="text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
              Bookmark any COREX response by clicking the save icon on the response card.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {reports.map(r => (
                <ReportCard key={r.id} report={r} onDelete={deleteReport} onView={setViewing}/>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ReportModal report={viewing} onClose={() => setViewing(null)}/>
    </div>
  );
}
