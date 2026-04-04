import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ENGINES = [
  { id:"Narrative", color:"#f59e0b" },
  { id:"Content",   color:"#3b82f6" },
  { id:"Growth",    color:"#2dd668" },
  { id:"Trend",     color:"#f43f5e" },
  { id:"Creator",   color:"#a78bfa" },
];

export default function ChatInput({ onSend, loading, activeEngine, onEngineChange, centered=false }) {
  const [value, setValue] = useState("");
  const taRef = useRef(null);

  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = "auto";
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 160) + "px";
  }, [value]);

  const submit = () => {
    if (!value.trim() || loading) return;
    onSend(value.trim());
    setValue("");
    if (taRef.current) taRef.current.style.height = "auto";
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing) {
      e.preventDefault(); submit();
    }
  };

  const hasVal = value.trim().length > 0;

  return (
    <div className={`w-full ${centered ? "flex flex-col items-center" : ""}`} style={{ maxWidth: centered ? 680 : "100%" }}>
      {/* Engine switcher */}
      <div className={`flex items-center gap-2 mb-3 ${centered ? "justify-center" : ""}`}>
        <span className="text-xs uppercase tracking-widest font-medium flex-shrink-0" style={{ color:"var(--text-muted)" }}>Engine</span>
        <div className="flex gap-1.5 flex-wrap">
          {ENGINES.map((eng) => {
            const active = activeEngine === eng.id;
            return (
              <button key={eng.id}
                onClick={() => onEngineChange(active ? null : eng.id)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                style={{
                  background: active ? eng.color : "rgba(45,214,104,0.05)",
                  border:     active ? `1px solid ${eng.color}` : "1px solid rgba(45,214,104,0.12)",
                  color:      active ? "#050a06" : "rgba(240,250,242,0.5)",
                }}>
                {eng.id}
              </button>
            );
          })}
          <AnimatePresence>
            {activeEngine && (
              <motion.button initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }}
                onClick={() => onEngineChange(null)}
                className="px-2 py-1 rounded-full text-xs transition-colors"
                style={{ color:"var(--text-muted)", border:"1px solid rgba(45,214,104,0.1)" }}>
                ✕
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input box */}
      <motion.div
        animate={{
          boxShadow: hasVal
            ? "0 0 0 1px rgba(45,214,104,0.4), 0 8px 40px rgba(45,214,104,0.1)"
            : "0 0 0 1px rgba(45,214,104,0.12), 0 4px 20px rgba(0,0,0,0.4)",
        }}
        transition={{ duration:0.2 }}
        className="flex items-end gap-3 rounded-2xl px-4 py-3 w-full"
        style={{ background:"rgba(20,40,24,0.7)", border:"1px solid rgba(45,214,104,0.15)", backdropFilter:"blur(16px)" }}
      >
        {/* Green spark icon */}
        <div className="flex-shrink-0 self-end mb-0.5">
          <motion.div animate={{ opacity: hasVal ? 1 : 0.45 }}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: hasVal ? "rgba(45,214,104,0.2)" : "rgba(45,214,104,0.08)", border:`1px solid ${hasVal?"rgba(45,214,104,0.4)":"rgba(45,214,104,0.15)"}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#2dd668"/>
            </svg>
          </motion.div>
        </div>

        {/* Textarea */}
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          placeholder={
            loading ? "Thinking…" :
            activeEngine ? `Ask the ${activeEngine} engine anything…` :
            "Ask anything about growth, reels, trends…"
          }
          rows={1}
          className="flex-1 bg-transparent text-sm resize-none border-none outline-none leading-relaxed max-h-40 overflow-y-auto py-1.5"
          style={{ color:"#f0faf2", caretColor:"#2dd668" }}
        />

        {/* Send */}
        <div className="flex-shrink-0 self-end mb-0.5">
          <motion.button
            whileHover={{ scale:1.08 }}
            whileTap={{ scale:0.92 }}
            onClick={submit}
            disabled={!hasVal || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: hasVal && !loading ? "#2dd668" : "rgba(45,214,104,0.08)",
              border: hasVal && !loading ? "none" : "1px solid rgba(45,214,104,0.15)",
              cursor: hasVal && !loading ? "pointer" : "not-allowed",
            }}
          >
            {loading
              ? <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black/80 rounded-full animate-spin"/>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hasVal?"#050a06":"rgba(240,250,242,0.3)"} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            }
          </motion.button>
        </div>
      </motion.div>

      {/* Hint */}
      <div className="flex items-center gap-4 mt-2 px-1">
        <span className="text-xs" style={{ color:"var(--text-muted)" }}>
          <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background:"rgba(45,214,104,0.06)", border:"1px solid rgba(45,214,104,0.1)" }}>↵</kbd> send ·{" "}
          <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background:"rgba(45,214,104,0.06)", border:"1px solid rgba(45,214,104,0.1)" }}>⇧↵</kbd> new line
        </span>
        <span className="text-xs ml-auto" style={{ color:"var(--text-muted)" }}>COREX v4</span>
      </div>
    </div>
  );
}
