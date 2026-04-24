import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_FILES = 2;
const ACCEPT    = "image/jpeg,image/png,image/gif,image/webp,image/heic,application/pdf";
const URL_RE    = /https?:\/\/[^\s]+/g;

async function fileToData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => {
      const b64     = reader.result.split(",")[1];
      const preview = file.type.startsWith("image/") ? reader.result : null;
      resolve({ name: file.name, type: file.type, b64, preview });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function extractPDFText(file) {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const ab  = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    let text  = "";
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
      const page    = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(it => it.str).join(" ") + "\n";
    }
    const snippet  = text.trim().slice(0, 4000);
    const existing = JSON.parse(localStorage.getItem("corex_attached_docs") || "[]");
    const doc      = { name: file.name, text: snippet, attachedAt: Date.now() };
    localStorage.setItem("corex_attached_docs", JSON.stringify([...existing.slice(-4), doc]));
    return snippet;
  } catch { return ""; }
}

export default function ChatInput({ onSend, disabled, userType, embedded }) {
  const [text,          setText]          = useState("");
  const [files,         setFiles]         = useState([]);
  const [dragging,      setDragging]      = useState(false);
  const [listening,     setListening]     = useState(false);
  const [voiceStatus,   setVoiceStatus]   = useState('idle'); // idle | listening | processing
  const [focused,       setFocused]       = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [detectedLinks, setDetectedLinks] = useState([]);
  const textRef   = useRef(null);
  const fileRef   = useRef(null);
  const menuRef   = useRef(null);
  const recognRef = useRef(null);

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

  // Detect URLs
  useEffect(() => {
    const matches = text.match(URL_RE) || [];
    setDetectedLinks(matches.slice(0, 3));
  }, [text]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

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
    if (file.type === "application/pdf") extractPDFText(file);
    setFiles(prev => [...prev, data].slice(0, MAX_FILES));
  }, [files]);

  const saveLinks = (links) => {
    if (!links.length) return;
    const existing = JSON.parse(localStorage.getItem("corex_shared_links") || "[]");
    const newLinks  = links.map(url => ({ url, sharedAt: Date.now() }));
    localStorage.setItem("corex_shared_links", JSON.stringify([...existing.slice(-9), ...newLinks]));
  };

  const send = () => {
    if (!text.trim() && !files.length) return;
    if (detectedLinks.length) saveLinks(detectedLinks);
    onSend(text.trim(), files);
    setText("");
    setFiles([]);
    setDetectedLinks([]);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = async (e) => {
    e.preventDefault(); setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith("image/") || f.type === "application/pdf"
    );
    for (const f of dropped.slice(0, MAX_FILES - files.length)) await attachFile(f);
  };

  const cleanTranscript = (raw) => {
    if (!raw) return '';
    const fillers = /\b(um+|uh+|hmm+|err+|like|you know|basically|so like|i mean|right so|okay so|actually)\b/gi;
    const out = raw.replace(fillers, '').replace(/\s{2,}/g, ' ').trim();
    return out.charAt(0).toUpperCase() + out.slice(1);
  };

  const toggleVoice = () => {
    if (listening) {
      recognRef.current?.stop();
      recognRef.current = null;
      setListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input requires Chrome or Edge. Please switch browsers.');
      return;
    }

    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;
    // intentionally no r.lang — use browser default for best accuracy

    let accumulated = '';
    let silenceTimer = null;

    const resetSilenceTimer = () => {
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => r.stop(), 2500);
    };

    r.onstart = () => setListening(true);

    r.onresult = (e) => {
      resetSilenceTimer();
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          accumulated += e.results[i][0].transcript + ' ';
        } else {
          interim = e.results[i][0].transcript;
        }
      }
      const live = cleanTranscript((accumulated + interim).trim());
      if (live) setText(live);
    };

    r.onend = () => {
      clearTimeout(silenceTimer);
      recognRef.current = null;
      setListening(false);
      if (accumulated.trim()) setText(cleanTranscript(accumulated.trim()));
    };

    r.onerror = (e) => {
      clearTimeout(silenceTimer);
      recognRef.current = null;
      setListening(false);
      if (e.error === 'not-allowed') {
        alert('Microphone access denied. Allow mic in browser settings and try again.');
      } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Voice error:', e.error);
      }
    };

    try {
      r.start();
      recognRef.current = r;
      resetSilenceTimer();
    } catch (err) {
      console.warn('Voice start error:', err);
    }
  };

  const canSend = (text.trim().length > 0 || files.length > 0) && !disabled;

  return (
    <div
      style={embedded ? {
        position: "relative",
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        padding: "10px 16px 18px",
        boxSizing: "border-box",
      } : {
        position: "absolute",
        bottom: 40,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(680px, calc(100% - 32px))",
        zIndex: 100,
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(156,252,175,0.04)",
              border: "2px dashed rgba(156,252,175,0.3)",
              borderRadius: 100, pointerEvents: "none",
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(156,252,175,0.8)", fontFamily: "'Instrument Sans', sans-serif" }}>
              Drop file here
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context menu (above input) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: 0,
              background: "#2a2a2a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "8px 0",
              minWidth: 200,
              zIndex: 200,
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            }}
          >
            {[
              { icon: "📄", label: "Upload Files", action: () => { fileRef.current?.click(); setMenuOpen(false); } },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  border: "none",
                  background: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 14,
                  fontFamily: "'Instrument Sans', sans-serif",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span>{item.icon}</span>
                  {item.label}
                </span>
                {item.hasArrow && <span style={{ opacity: 0.4 }}>›</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}
          >
            {files.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 10px 4px 6px",
                  borderRadius: 10,
                  background: "rgba(156,252,175,0.08)",
                  border: "1px solid rgba(156,252,175,0.2)",
                }}
              >
                {f.preview
                  ? <img src={f.preview} alt={f.name} style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
                  : <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(156,252,175,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📄</div>
                }
                <span style={{ fontSize: 12, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(156,252,175,0.8)", fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600 }}>
                  {f.name}
                </span>
                <button
                  onClick={() => setFiles(p => p.filter((_,j) => j !== i))}
                  style={{ fontSize: 11, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detected links */}
      <AnimatePresence>
        {detectedLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}
          >
            {detectedLinks.map((url, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "3px 10px", borderRadius: 20,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: 11, color: "rgba(255,255,255,0.5)",
                  fontFamily: "'Instrument Sans', sans-serif",
                  maxWidth: 220, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                }}
              >
                🔗 <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{url.replace(/^https?:\/\//, "").slice(0, 30)}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input wrapper */}
      <div
        style={{
          background: "#1a1a1a",
          border: `1px solid ${focused ? "rgba(255,255,255,0.22)" : dragging ? "rgba(156,252,175,0.3)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 20,
          display: "flex",
          alignItems: "flex-end",
          padding: "12px 14px 12px 18px",
          gap: 10,
          transition: "border-color 0.2s",
        }}
      >
        {/* + button */}
        <button
          onClick={() => setMenuOpen(p => !p)}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: menuOpen ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)",
            color: "#ffffff",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            alignSelf: "flex-end",
            marginBottom: 0,
            lineHeight: 1,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.16)"}
          onMouseLeave={(e) => e.currentTarget.style.background = menuOpen ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)"}
        >
          +
        </button>

        <input ref={fileRef} type="file" accept={ACCEPT} multiple style={{ display: "none" }}
          onChange={async e => {
            for (const f of Array.from(e.target.files || []).slice(0, MAX_FILES - files.length)) await attachFile(f);
            e.target.value = "";
          }}
        />

        {/* Textarea */}
        <textarea
          ref={textRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onInput={e => {
            const el = e.target;
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 120) + "px";
          }}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={()  => setFocused(false)}
          placeholder="Ask Corex anything..."
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 15,
            color: "#ffffff",
            caretColor: "rgba(156,252,175,0.8)",
            lineHeight: 1.5,
            minHeight: 24,
            maxHeight: 120,
            overflowY: "auto",
            fontFamily: "'Instrument Sans', sans-serif",
          }}
        />

        {/* Right icons */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
          {/* Mic */}
          <div style={{ position: "relative" }}>
            <button
              onClick={toggleVoice}
              style={{
                fontSize: 18,
                color: listening ? "#f87171" : "rgba(255,255,255,0.3)",
                padding: 4,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                alignSelf: "flex-end",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => { if (!listening) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={(e) => { if (!listening) e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
            <AnimatePresence>
              {listening && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 8,
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 100,
                    padding: '6px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}
                  />
                  <span style={{ fontSize: 12, fontFamily: "'Instrument Sans', sans-serif", color: '#ef4444', fontWeight: 600 }}>
                    Listening...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Waveform / send */}
          <motion.button
            onClick={send}
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.06 } : {}}
            whileTap={canSend ? { scale: 0.94 } : {}}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "none",
              cursor: canSend ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: canSend
                ? "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)"
                : "rgba(255,255,255,0.08)",
              color: canSend ? "#000000" : "rgba(255,255,255,0.2)",
              transition: "all 0.2s",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Hint */}
      <p style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", fontFamily: "'Instrument Sans', sans-serif" }}>
        ↵ send &nbsp;·&nbsp; ⇧↵ new line &nbsp;·&nbsp; drop images or PDFs
      </p>
    </div>
  );
}
