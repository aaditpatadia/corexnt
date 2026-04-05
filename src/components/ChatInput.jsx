import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_FILES = 2;
const ACCEPT    = "image/jpeg,image/png,image/gif,image/webp,image/heic,application/pdf";

async function fileToData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => {
      const b64     = reader.result.split(",")[1];
      const preview = file.type.startsWith("image/") ? reader.result : null;
      resolve({ name:file.name, type:file.type, b64, preview });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ChatInput({ onSend, disabled, userType }) {
  const [text,     setText]     = useState("");
  const [files,    setFiles]    = useState([]);
  const [dragging, setDragging] = useState(false);
  const [listening, setListening] = useState(false);
  const textRef   = useRef(null);
  const fileRef   = useRef(null);
  const recognRef = useRef(null);

  const isCreator   = userType !== "company";
  const accentColor = isCreator ? "#2dd668" : "#a78bfa";
  const accentRgba  = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";

  // Check prefill from TrendEngine / Templates
  useEffect(() => {
    const prefill = sessionStorage.getItem("corex_prefill");
    if (prefill) {
      sessionStorage.removeItem("corex_prefill");
      setText(prefill);
      textRef.current?.focus();
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 5 * 24 + 20; // ~5 lines
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [text]);

  // Ctrl+V paste
  useEffect(() => {
    const handler = async (e) => {
      const items = e.clipboardData?.items || [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) await attachFile(file);
        }
      }
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [files]);

  const attachFile = useCallback(async (file) => {
    if (files.length >= MAX_FILES) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") return;
    const data = await fileToData(file);
    setFiles(prev => [...prev, data].slice(0, MAX_FILES));
  }, [files]);

  const send = () => {
    if (!text.trim() && !files.length) return;
    onSend(text.trim(), files);
    setText("");
    setFiles([]);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Drag & drop
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = async (e) => {
    e.preventDefault(); setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") || f.type === "application/pdf");
    for (const f of dropped.slice(0, MAX_FILES - files.length)) await attachFile(f);
  };

  // Voice input
  const toggleVoice = () => {
    if (listening) {
      recognRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => { setText(prev => prev + (prev ? " " : "") + e.results[0][0].transcript); };
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    recognRef.current = r;
    r.start();
    setListening(true);
  };

  const canSend = (text.trim().length > 0 || files.length > 0) && !disabled;

  return (
    <div
      className="flex-shrink-0"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}>

      {/* Drag overlay */}
      <AnimatePresence>
        {dragging && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{ background:`${accentRgba}0.06)`, border:`2px dashed ${accentRgba}0.4)`, borderRadius:16, margin:8 }}>
            <p className="text-sm font-semibold" style={{ color:accentColor, fontFamily:"var(--font-body)" }}>Drop image here</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File attachment preview */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{ padding:"8px max(24px, 20%) 4px", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 pr-2 pl-1 py-1 rounded-xl"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}>
                {f.preview
                  ? <img src={f.preview} alt={f.name} className="w-8 h-8 rounded-lg object-cover"/>
                  : <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                      style={{ background:"rgba(255,255,255,0.08)" }}>📎</div>
                }
                <span className="text-xs truncate max-w-20" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>{f.name}</span>
                <button onClick={() => setFiles(f => f.filter((_, j) => j !== i))}
                  className="text-xs w-4 h-4 flex items-center justify-center rounded-full transition-all"
                  style={{ color:"rgba(255,255,255,0.3)" }}
                  onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.7)"}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>✕</button>
              </div>
            ))}
            <span className="text-xs" style={{ color:"rgba(255,255,255,0.2)", fontFamily:"var(--font-body)" }}>
              {files.length}/{MAX_FILES} files
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container — wide margins matching message area */}
      <div style={{ padding:"10px max(24px, 20%) 12px" }}>
        <div className="flex items-end gap-2 px-3 py-2.5 rounded-2xl"
          style={{
            background:"rgba(255,255,255,0.05)",
            border:`1px solid ${dragging ? `${accentRgba}0.4)` : "rgba(255,255,255,0.1)"}`,
            transition:"border-color 0.2s ease",
          }}>

          {/* Paperclip */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={files.length >= MAX_FILES}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ color:"rgba(255,255,255,0.3)", opacity: files.length >= MAX_FILES ? 0.3 : 1 }}
            onMouseEnter={e=>{ if (files.length < MAX_FILES) e.currentTarget.style.color=accentColor; }}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
          <input ref={fileRef} type="file" accept={ACCEPT} multiple className="hidden"
            onChange={async e => { for (const f of Array.from(e.target.files||[]).slice(0, MAX_FILES - files.length)) await attachFile(f); e.target.value=""; }}/>

          {/* Text area */}
          <textarea
            ref={textRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask Corex anything..."
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none border-none text-sm leading-relaxed"
            style={{
              color:"rgba(255,255,255,0.88)", fontFamily:"var(--font-body)",
              caretColor:accentColor, lineHeight:1.6,
              maxHeight: 5*24 + 20 + "px", overflowY:"auto",
            }}/>

          {/* Mic */}
          <button
            onClick={toggleVoice}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ color: listening ? "#ef4444" : "rgba(255,255,255,0.3)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>

          {/* Send */}
          <motion.button
            onClick={send}
            disabled={!canSend}
            whileHover={canSend ? { scale:1.08 } : {}}
            whileTap={canSend ? { scale:0.93 } : {}}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all"
            style={{
              background: canSend ? (isCreator ? "linear-gradient(135deg,#1a7a3c,#2dd668)" : "linear-gradient(135deg,#7c3aed,#a78bfa)") : "rgba(255,255,255,0.06)",
              color: canSend ? "#050a06" : "rgba(255,255,255,0.2)",
              border: canSend ? "none" : "1px solid rgba(255,255,255,0.08)",
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
