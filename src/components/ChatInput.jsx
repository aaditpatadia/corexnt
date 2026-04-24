import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Globe, BrainCog, FolderEdit, ArrowUp, Square, Mic, X } from "lucide-react";

const MAX_FILES = 2;
const ACCEPT    = "image/jpeg,image/png,image/gif,image/webp,image/heic,application/pdf";
const URL_RE    = /https?:\/\/[^\s]+/g;
const FONT      = "'Instrument Sans', sans-serif";

/* ── helpers ── */
async function fileToData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
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
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
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

/* ── Divider between toolbar buttons ── */
function ToolDivider() {
  return (
    <div style={{
      width: 1.5, height: 18, borderRadius: 99, flexShrink: 0,
      background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.18), transparent)",
      margin: "0 2px",
    }}/>
  );
}

/* ── Mode toggle button (Globe / BrainCog / FolderCode) ── */
function ModeBtn({ icon: Icon, label, active, color, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "5px 8px", borderRadius: 100,
        border: active ? `1px solid ${color}60` : "1px solid transparent",
        background: active ? `${color}18` : "transparent",
        color: active ? color : "rgba(255,255,255,0.38)",
        cursor: "pointer", transition: "all 0.15s",
        height: 30, flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ rotate: active ? 360 : 0, scale: active ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        <Icon size={15} />
      </motion.div>
      <AnimatePresence>
        {active && (
          <motion.span
            key="label"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              fontSize: 11, fontWeight: 700, fontFamily: FONT,
              overflow: "hidden", whiteSpace: "nowrap", color,
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ── Voice waveform visualizer ── */
function WaveformBars({ bars = 24 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, height: 24 }}>
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ scaleY: [0.2, 1, 0.2] }}
          transition={{
            duration: 0.6 + Math.random() * 0.5,
            delay: i * 0.04,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: 2.5, borderRadius: 99,
            background: "rgba(239,68,68,0.6)",
            height: "100%",
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}

/* ── Main component ── */
export default function ChatInput({ onSend, disabled, userType, embedded }) {
  const [text,          setText]          = useState("");
  const [files,         setFiles]         = useState([]);
  const [dragging,      setDragging]      = useState(false);
  const [listening,     setListening]     = useState(false);
  const [focused,       setFocused]       = useState(false);
  const [detectedLinks, setDetectedLinks] = useState([]);
  const [recTime,       setRecTime]       = useState(0);

  // Mode toggles
  const [showSearch,    setShowSearch]    = useState(false);
  const [showThink,     setShowThink]     = useState(false);
  const [showPlan,      setShowPlan]      = useState(false);

  const textRef   = useRef(null);
  const fileRef   = useRef(null);
  const recognRef = useRef(null);
  const timerRef  = useRef(null);

  // Prefill from other pages
  useEffect(() => {
    const prefill = sessionStorage.getItem("corex_prefill");
    if (prefill) { sessionStorage.removeItem("corex_prefill"); setText(prefill); textRef.current?.focus(); }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [text]);

  // Detect URLs
  useEffect(() => {
    setDetectedLinks((text.match(URL_RE) || []).slice(0, 3));
  }, [text]);

  // Recording timer
  useEffect(() => {
    if (listening) {
      setRecTime(0);
      timerRef.current = setInterval(() => setRecTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [listening]);

  // Paste image
  useEffect(() => {
    const handler = async (e) => {
      for (const item of (e.clipboardData?.items || [])) {
        if (item.type.startsWith("image/")) { const f = item.getAsFile(); if (f) await attachFile(f); }
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
    localStorage.setItem("corex_shared_links",
      JSON.stringify([...existing.slice(-9), ...links.map(url => ({ url, sharedAt: Date.now() }))]));
  };

  const send = () => {
    if (!text.trim() && !files.length) return;
    if (detectedLinks.length) saveLinks(detectedLinks);
    let msg = text.trim();
    if (showSearch) msg = `[Search mode] ${msg}`;
    else if (showThink) msg = `[Deep think] ${msg}`;
    else if (showPlan)  msg = `[Plan mode] ${msg}`;
    onSend(msg, files);
    setText(""); setFiles([]); setDetectedLinks([]);
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = async (e) => {
    e.preventDefault(); setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") || f.type === "application/pdf");
    for (const f of dropped.slice(0, MAX_FILES - files.length)) await attachFile(f);
  };

  // Voice recognition
  const cleanTranscript = (raw) => {
    if (!raw) return '';
    const fillers = /\b(um+|uh+|hmm+|err+|like|you know|basically|so like|i mean|right so|okay so|actually)\b/gi;
    const out = raw.replace(fillers, '').replace(/\s{2,}/g, ' ').trim();
    return out.charAt(0).toUpperCase() + out.slice(1);
  };

  const toggleVoice = () => {
    if (listening) { recognRef.current?.stop(); recognRef.current = null; setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input requires Chrome or Edge.'); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
    let accumulated = '';
    let silenceTimer = null;
    const resetSilenceTimer = () => {
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => r.stop(), 2500);
    };
    r.onstart  = () => setListening(true);
    r.onresult = (e) => {
      resetSilenceTimer();
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) accumulated += e.results[i][0].transcript + ' ';
        else interim = e.results[i][0].transcript;
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
      if (e.error === 'not-allowed') alert('Microphone access denied. Allow mic in browser settings and try again.');
      else if (e.error !== 'no-speech' && e.error !== 'aborted') console.warn('Voice error:', e.error);
    };
    try { r.start(); recognRef.current = r; resetSilenceTimer(); } catch (err) { console.warn(err); }
  };

  const toggleMode = (mode) => {
    if (mode === 'search') { setShowSearch(p => !p); setShowThink(false); setShowPlan(false); }
    if (mode === 'think')  { setShowThink(p => !p);  setShowSearch(false); setShowPlan(false); }
    if (mode === 'plan')   { setShowPlan(p => !p);   setShowSearch(false); setShowThink(false); }
  };

  const hasContent = text.trim().length > 0 || files.length > 0;
  const canSend    = hasContent && !disabled;

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div
      style={embedded ? {
        position: "relative", width: "100%", maxWidth: 720,
        margin: "0 auto", padding: "10px 16px 18px", boxSizing: "border-box",
      } : {
        position: "absolute", bottom: 40, left: "50%",
        transform: "translateX(-50%)",
        width: "min(700px, calc(100% - 32px))", zIndex: 100,
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Detected link chips */}
      <AnimatePresence>
        {detectedLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}
          >
            {detectedLinks.map((url, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 4, padding: "3px 10px",
                borderRadius: 20, background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: FONT,
                maxWidth: 220, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
              }}>
                🔗 <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {url.replace(/^https?:\/\//, "").slice(0, 30)}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input box */}
      <div
        style={{
          background: "#181818",
          border: `1px solid ${dragging ? "rgba(156,252,175,0.35)" : focused ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 24,
          padding: "4px 6px 6px",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: focused ? "0 0 0 1px rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.3)",
          position: "relative",
        }}
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
                borderRadius: 24, pointerEvents: "none",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(156,252,175,0.8)", fontFamily: FONT }}>
                Drop file here
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image / file previews inside box */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "8px 10px 4px" }}
            >
              {files.map((f, i) => (
                <div key={i} style={{ position: "relative" }}>
                  {f.preview
                    ? <img src={f.preview} alt={f.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover" }}/>
                    : (
                      <div style={{
                        width: 52, height: 52, borderRadius: 10, background: "rgba(156,252,175,0.08)",
                        border: "1px solid rgba(156,252,175,0.2)", display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: 20,
                      }}>📄</div>
                    )
                  }
                  <button
                    onClick={() => setFiles(p => p.filter((_,j) => j !== i))}
                    style={{
                      position: "absolute", top: -5, right: -5,
                      width: 16, height: 16, borderRadius: "50%",
                      background: "#333", border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <X size={9}/>
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice recording state */}
        <AnimatePresence>
          {listening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ padding: "12px 14px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }}
                />
                <span style={{ fontSize: 12, fontFamily: FONT, fontWeight: 600, color: "#ef4444" }}>
                  {formatTime(recTime)} — Listening
                </span>
                <span style={{ fontSize: 11, fontFamily: FONT, color: "rgba(255,255,255,0.3)" }}>
                  · speaks then pauses to stop
                </span>
              </div>
              <WaveformBars bars={28}/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea — hidden during recording if no text yet */}
        <div style={{ padding: listening && !text ? "0 10px" : "10px 10px 4px" }}>
          <textarea
            ref={textRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => setFocused(true)}
            onBlur={()  => setFocused(false)}
            placeholder={
              listening ? "" :
              showSearch ? "Search the web for anything..." :
              showThink  ? "Ask for deep analysis..." :
              showPlan   ? "Describe your project to plan..." :
              "Ask Corex anything..."
            }
            rows={1}
            style={{
              width: "100%", resize: "none", background: "transparent",
              border: "none", outline: "none",
              fontSize: 15, color: "#ffffff",
              caretColor: "rgba(156,252,175,0.8)",
              lineHeight: 1.6, minHeight: listening && !text ? 0 : 28,
              maxHeight: 140, overflowY: "auto",
              fontFamily: FONT, boxSizing: "border-box",
              display: listening && !text ? "none" : "block",
            }}
          />
        </div>

        {/* Toolbar row */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 6px 2px",
        }}>
          {/* Left toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>

            {/* Attachment */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              title="Attach image or PDF"
              style={{
                width: 30, height: 30, borderRadius: "50%", border: "none",
                background: "transparent", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.38)", transition: "color 0.15s, background 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.background = "transparent"; }}
            >
              <Paperclip size={16}/>
            </button>

            <input ref={fileRef} type="file" accept={ACCEPT} multiple style={{ display: "none" }}
              onChange={async e => {
                for (const f of Array.from(e.target.files || []).slice(0, MAX_FILES - files.length)) await attachFile(f);
                e.target.value = "";
              }}
            />

            <ToolDivider/>

            {/* Search */}
            <ModeBtn
              icon={Globe}
              label="Search"
              active={showSearch}
              color="#1EAEDB"
              onClick={() => toggleMode('search')}
            />

            <ToolDivider/>

            {/* Think */}
            <ModeBtn
              icon={BrainCog}
              label="Think"
              active={showThink}
              color="#8B5CF6"
              onClick={() => toggleMode('think')}
            />

            <ToolDivider/>

            {/* Plan */}
            <ModeBtn
              icon={FolderEdit}
              label="Plan"
              active={showPlan}
              color="#F97316"
              onClick={() => toggleMode('plan')}
            />
          </div>

          {/* Right: send / mic button */}
          <motion.button
            type="button"
            onClick={() => {
              if (disabled) return;
              if (listening) { toggleVoice(); return; }
              if (hasContent) { send(); return; }
              toggleVoice();
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            style={{
              width: 34, height: 34, borderRadius: "50%",
              border: "none", cursor: disabled ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              background: listening
                ? "rgba(239,68,68,0.15)"
                : canSend
                ? "#ffffff"
                : "rgba(255,255,255,0.1)",
              color: listening
                ? "#ef4444"
                : canSend
                ? "#111111"
                : "rgba(255,255,255,0.5)",
              transition: "all 0.18s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: canSend ? "0 2px 12px rgba(255,255,255,0.15)" : "none",
            }}
          >
            <AnimatePresence mode="wait">
              {disabled ? (
                <motion.span key="stop" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                  <Square size={14} fill="currentColor"/>
                </motion.span>
              ) : listening ? (
                <motion.span key="listening-icon" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                  <Square size={12} fill="#ef4444" color="#ef4444"/>
                </motion.span>
              ) : hasContent ? (
                <motion.span key="send" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  <ArrowUp size={16} strokeWidth={2.2}/>
                </motion.span>
              ) : (
                <motion.span key="mic" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                  <Mic size={15}/>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Subtle hint */}
      <p style={{
        marginTop: 7, fontSize: 11, color: "rgba(255,255,255,0.18)",
        textAlign: "center", fontFamily: FONT, letterSpacing: "0.2px",
      }}>
        ↵ send &nbsp;·&nbsp; ⇧↵ new line &nbsp;·&nbsp; drop images or PDFs
      </p>
    </div>
  );
}
