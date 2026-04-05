import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ENGINES = [
  { id:"Narrative", color:"#f59e0b" },
  { id:"Content",   color:"#3b82f6" },
  { id:"Growth",    color:"#2dd668" },
  { id:"Trend",     color:"#f43f5e" },
  { id:"Creator",   color:"#a78bfa" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function getUploadCount() {
  const dk = new Date().toISOString().slice(0,10);
  return parseInt(localStorage.getItem("corex_uploads_" + dk) || "0", 10);
}
function bumpUploadCount() {
  const dk = new Date().toISOString().slice(0,10);
  localStorage.setItem("corex_uploads_" + dk, String(getUploadCount() + 1));
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ChatInput({ onSend, loading, activeEngine, onEngineChange }) {
  const [value,     setValue]    = useState("");
  const [files,     setFiles]    = useState([]);   // [{ name, type, b64, preview }]
  const [listening, setListening]= useState(false);
  const [voiceErr,  setVoiceErr] = useState("");
  const [fileErr,   setFileErr]  = useState("");

  const taRef      = useRef(null);
  const fileRef    = useRef(null);
  const recognRef  = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = "auto";
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 160) + "px";
  }, [value]);

  // Load prefill from Templates navigation
  useEffect(() => {
    const prefill = sessionStorage.getItem("corex_prefill");
    if (prefill) { setValue(prefill); sessionStorage.removeItem("corex_prefill"); }
  }, []);

  const submit = useCallback(() => {
    if ((!value.trim() && files.length === 0) || loading) return;
    onSend(value.trim(), files);
    setValue("");
    setFiles([]);
    if (taRef.current) taRef.current.style.height = "auto";
  }, [value, files, loading, onSend]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing) {
      e.preventDefault(); submit();
    }
  };

  // ── Voice input ──────────────────────────────────────────────────
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceErr("Voice not supported in this browser."); return; }
    if (listening) {
      recognRef.current?.stop();
      setListening(false);
      return;
    }
    setVoiceErr("");
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    recognRef.current = rec;

    rec.onstart  = () => setListening(true);
    rec.onend    = () => setListening(false);
    rec.onerror  = () => { setListening(false); setVoiceErr("Couldn't capture audio. Try again."); };
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      setValue(transcript);
    };
    rec.start();
  };

  // ── File upload ──────────────────────────────────────────────────
  const pickFile = () => { fileRef.current?.click(); };

  const handleFiles = async (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    e.target.value = "";

    if (getUploadCount() >= 2) {
      setFileErr("2 free file uploads per day used. Upgrade for more.");
      return;
    }
    setFileErr("");

    const newFiles = [];
    for (const f of picked.slice(0, 2 - files.length)) {
      if (f.size > MAX_FILE_SIZE) {
        setFileErr(`${f.name} is too large (max 5 MB).`);
        continue;
      }
      const b64 = await fileToBase64(f);
      const preview = f.type.startsWith("image/") ? `data:${f.type};base64,${b64}` : null;
      newFiles.push({ name:f.name, type:f.type, b64, preview });
      bumpUploadCount();
    }
    setFiles(p => [...p, ...newFiles].slice(0, 2));
  };

  const removeFile = (i) => setFiles(p => p.filter((_,idx) => idx !== i));

  const hasVal = value.trim().length > 0 || files.length > 0;

  return (
    <div className="w-full">
      {/* Engine switcher */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs uppercase tracking-widest font-medium flex-shrink-0"
          style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>Engine</span>
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
                  fontFamily:"var(--font-body)",
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
                style={{ color:"var(--text-muted)", border:"1px solid rgba(45,214,104,0.1)", fontFamily:"var(--font-body)" }}>
                ✕
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* File previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
            className="flex gap-2 mb-2 flex-wrap">
            {files.map((f, i) => (
              <motion.div key={i} initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)" }}>
                {f.preview
                  ? <img src={f.preview} alt={f.name} className="w-6 h-6 rounded object-cover"/>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2dd668" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                }
                <span className="text-xs max-w-[100px] truncate" style={{ color:"rgba(240,250,242,0.7)", fontFamily:"var(--font-body)" }}>
                  {f.name}
                </span>
                <button onClick={() => removeFile(i)} className="text-xs" style={{ color:"rgba(240,250,242,0.4)" }}>✕</button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error messages */}
      <AnimatePresence>
        {(voiceErr || fileErr) && (
          <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="text-xs mb-2 px-1" style={{ color:"#f87171", fontFamily:"var(--font-body)" }}>
            {voiceErr || fileErr}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Input box */}
      <motion.div
        animate={{
          boxShadow: hasVal
            ? "0 0 0 1px rgba(45,214,104,0.4), 0 8px 40px rgba(45,214,104,0.1)"
            : "0 0 0 1px rgba(45,214,104,0.12), 0 4px 20px rgba(0,0,0,0.4)",
        }}
        transition={{ duration:0.2 }}
        className="flex items-end gap-2 rounded-2xl px-3 py-2.5 w-full"
        style={{ background:"rgba(20,40,24,0.7)", border:"1px solid rgba(45,214,104,0.15)", backdropFilter:"blur(16px)" }}>

        {/* File upload button */}
        <div className="flex-shrink-0 self-end mb-0.5">
          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
            onClick={pickFile}
            title="Attach file or image"
            className="w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: files.length > 0 ? "rgba(45,214,104,0.2)" : "rgba(45,214,104,0.06)",
              border: `1px solid ${files.length > 0 ? "rgba(45,214,104,0.4)" : "rgba(45,214,104,0.15)"}`,
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={files.length > 0 ? "#2dd668" : "rgba(240,250,242,0.4)"} strokeWidth="2" strokeLinecap="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </motion.button>
          <input ref={fileRef} type="file" className="hidden"
            accept="image/*,.pdf,.txt,.docx"
            multiple onChange={handleFiles}/>
        </div>

        {/* Textarea */}
        <textarea
          ref={taRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          placeholder={
            listening ? "Listening…" :
            loading   ? "Thinking…" :
            activeEngine ? `Ask the ${activeEngine} engine anything…` :
            "Ask anything about growth, content, strategy…"
          }
          rows={1}
          className="flex-1 bg-transparent text-sm resize-none border-none outline-none leading-relaxed max-h-40 overflow-y-auto py-1"
          style={{ color:"#f0faf2", caretColor:"#2dd668", fontFamily:"var(--font-body)" }}
        />

        {/* Voice button */}
        <div className="flex-shrink-0 self-end mb-0.5">
          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
            onClick={startVoice}
            title={listening ? "Stop listening" : "Voice input"}
            className="w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 relative"
            style={{
              background: listening ? "rgba(239,68,68,0.2)" : "rgba(45,214,104,0.06)",
              border: `1px solid ${listening ? "rgba(239,68,68,0.5)" : "rgba(45,214,104,0.15)"}`,
            }}>
            {listening && (
              <span className="absolute inset-0 rounded-xl animate-ping"
                style={{ background:"rgba(239,68,68,0.3)", animationDuration:"1s" }}/>
            )}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={listening ? "#ef4444" : "rgba(240,250,242,0.4)"} strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/>
            </svg>
          </motion.button>
        </div>

        {/* Send button */}
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
            }}>
            {loading
              ? <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black/80 rounded-full animate-spin"/>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke={hasVal ? "#050a06" : "rgba(240,250,242,0.3)"}
                  strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            }
          </motion.button>
        </div>
      </motion.div>

      {/* Hint bar */}
      <div className="flex items-center gap-3 mt-2 px-1">
        <span className="text-xs" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>
          <kbd className="px-1.5 py-0.5 rounded text-xs"
            style={{ background:"rgba(45,214,104,0.06)", border:"1px solid rgba(45,214,104,0.1)", fontFamily:"var(--font-body)" }}>↵</kbd>{" "}
          send ·{" "}
          <kbd className="px-1.5 py-0.5 rounded text-xs"
            style={{ background:"rgba(45,214,104,0.06)", border:"1px solid rgba(45,214,104,0.1)", fontFamily:"var(--font-body)" }}>⇧↵</kbd>{" "}
          new line
        </span>
        <span className="text-xs ml-auto" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>
          COREX v5
        </span>
      </div>
    </div>
  );
}
