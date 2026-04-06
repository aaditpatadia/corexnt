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
  const [text,      setText]      = useState("");
  const [files,     setFiles]     = useState([]);
  const [dragging,  setDragging]  = useState(false);
  const [listening, setListening] = useState(false);
  const [focused,   setFocused]   = useState(false);
  const textRef   = useRef(null);
  const fileRef   = useRef(null);
  const recognRef = useRef(null);

  const isCreator   = userType !== "company";
  const accentColor = isCreator ? "#2dd668" : "#a78bfa";

  // Prefill from other pages
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
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [text]);

  // Ctrl+V paste image
  useEffect(() => {
    const handler = async (e) => {
      for (const item of (e.clipboardData?.items || [])) {
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
    if (file.size > 5 * 1024 * 1024) { alert("File must be under 5MB"); return; }
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
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  // Drag & drop
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = async (e) => {
    e.preventDefault(); setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") || f.type === "application/pdf");
    for (const f of dropped.slice(0, MAX_FILES - files.length)) await attachFile(f);
  };

  // Voice
  const toggleVoice = () => {
    if (listening) { recognRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false; r.interimResults = false;
    r.onresult = (e) => { setText(prev => prev + (prev ? " " : "") + e.results[0][0].transcript); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognRef.current = r; r.start(); setListening(true);
  };

  const canSend = (text.trim().length > 0 || files.length > 0) && !disabled;

  return (
    <div
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(8,12,9,0.97)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "12px 24px 20px",
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}>

      {/* Drag overlay */}
      <AnimatePresence>
        {dragging && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{
              position:"absolute", inset:0, zIndex:10, display:"flex", alignItems:"center", justifyContent:"center",
              background:`rgba(45,214,104,0.04)`, border:`2px dashed rgba(45,214,104,0.35)`,
              borderRadius:12, margin:8, pointerEvents:"none",
            }}>
            <p style={{ fontSize:13, fontWeight:600, color:accentColor, fontFamily:"var(--font-body)" }}>Drop file here</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth:720, margin:"0 auto" }}>

        {/* File previews */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:8 }}>
              {files.map((f, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px 4px 6px", borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}>
                  {f.preview
                    ? <img src={f.preview} alt={f.name} style={{ width:28, height:28, borderRadius:6, objectFit:"cover" }}/>
                    : <div style={{ width:28, height:28, borderRadius:6, background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>📎</div>
                  }
                  <span style={{ fontSize:12, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>{f.name}</span>
                  <button onClick={() => setFiles(p => p.filter((_,j)=>j!==i))}
                    style={{ fontSize:11, width:16, height:16, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.35)", background:"transparent", border:"none", cursor:"none" }}
                    onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.7)"}
                    onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.35)"}>✕</button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input wrapper */}
        <div style={{
          background: focused ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.04)",
          border: focused
            ? `1px solid ${dragging ? "rgba(45,214,104,0.5)" : "rgba(45,214,104,0.3)"}`
            : `1px solid ${dragging ? "rgba(45,214,104,0.4)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 16,
          display: "flex",
          alignItems: "flex-end",
          padding: "10px 10px 10px 16px",
          gap: 8,
          transition: "border-color 0.2s, background 0.2s",
        }}>

          {/* Paperclip */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={files.length >= MAX_FILES}
            style={{
              fontSize: 18, color: "rgba(255,255,255,0.3)", padding: 4, background: "transparent",
              border: "none", cursor: "none", alignSelf: "flex-end", marginBottom: 2,
              opacity: files.length >= MAX_FILES ? 0.3 : 1, transition: "color 0.15s",
            }}
            onMouseEnter={e=>{ if (files.length < MAX_FILES) e.currentTarget.style.color="rgba(45,214,104,0.7)"; }}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
          <input ref={fileRef} type="file" accept={ACCEPT} multiple style={{ display:"none" }}
            onChange={async e => { for (const f of Array.from(e.target.files||[]).slice(0, MAX_FILES-files.length)) await attachFile(f); e.target.value=""; }}/>

          {/* Textarea */}
          <textarea
            ref={textRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => setFocused(true)}
            onBlur={()  => setFocused(false)}
            placeholder="Ask Corex anything..."
            rows={1}
            style={{
              flex: 1, resize: "none", background: "transparent", border: "none", outline: "none",
              fontSize: 16, color: "rgba(255,255,255,0.88)",
              caretColor: accentColor, lineHeight: 1.5,
              minHeight: 24, maxHeight: 120, overflowY: "auto",
              fontFamily: "var(--font-body)",
            }}/>

          {/* Right icons */}
          <div style={{ display:"flex", alignItems:"flex-end", gap:6 }}>
            {/* Mic */}
            <button onClick={toggleVoice}
              style={{
                fontSize:18, color: listening ? "#ef4444" : "rgba(255,255,255,0.3)",
                padding:4, background:"transparent", border:"none", cursor:"none",
                alignSelf:"flex-end", marginBottom:2, transition:"color 0.15s",
              }}
              onMouseEnter={e=>{ if (!listening) e.currentTarget.style.color="rgba(45,214,104,0.7)"; }}
              onMouseLeave={e=>{ if (!listening) e.currentTarget.style.color="rgba(255,255,255,0.3)"; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>

            {/* Send */}
            <motion.button
              onClick={send}
              disabled={!canSend}
              whileHover={canSend ? { scale:1.06 } : {}}
              whileTap={canSend ? { scale:0.94 } : {}}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "none", cursor: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: canSend ? "#2dd668" : "rgba(255,255,255,0.08)",
                color: canSend ? "#080c09" : "rgba(255,255,255,0.3)",
                transition: "background 0.2s, color 0.2s",
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Hint */}
        <p style={{ marginTop:8, fontSize:11, color:"rgba(255,255,255,0.2)", textAlign:"center", fontFamily:"var(--font-body)" }}>
          ↵ send &nbsp;·&nbsp; ⇧↵ new line &nbsp;·&nbsp; Corex v5.3
        </p>
      </div>
    </div>
  );
}
