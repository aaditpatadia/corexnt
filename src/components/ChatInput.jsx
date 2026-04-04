import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Mic, MicOff, Sparkles, Command } from "lucide-react";

const ENGINE_CHIPS = [
  { label: "Narrative", color: "#F97316" },
  { label: "Content",   color: "#3B82F6" },
  { label: "Growth",    color: "#22C55E" },
  { label: "Trend",     color: "#F43F5E" },
  { label: "Creator",   color: "#F59E0B" },
];

export default function ChatInput({ onSend, loading, activeEngine, onEngineChange }) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState(false);
  const taRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) setVoiceOk(true);
  }, []);

  // auto-resize
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
      e.preventDefault();
      submit();
    }
  };

  const toggleVoice = async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (listening) { recRef.current?.stop(); setListening(false); return; }

    try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { return; }

    const r = new SR();
    r.continuous = false; r.interimResults = true; r.lang = "en-IN";
    r.onstart  = () => setListening(true);
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    r.onresult = (e) => {
      let final = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final.trim()) { setValue(final.trim()); r.stop(); }
    };
    recRef.current = r;
    r.start();
  };

  const hasValue = value.trim().length > 0;

  return (
    <div className="w-full">
      {/* Engine chips */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium flex-shrink-0">Engine:</span>
        <div className="flex gap-1.5 flex-wrap">
          {ENGINE_CHIPS.map((eng) => (
            <motion.button
              key={eng.label}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onEngineChange(activeEngine === eng.label ? null : eng.label)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: activeEngine === eng.label ? eng.color + "25" : "rgba(255,255,255,0.04)",
                color: activeEngine === eng.label ? eng.color : "#71717A",
                border: `1px solid ${activeEngine === eng.label ? eng.color + "40" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              {eng.label}
            </motion.button>
          ))}
          <AnimatePresence>
            {activeEngine && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onEngineChange(null)}
                className="px-2 py-1 rounded-lg text-xs text-zinc-600 hover:text-zinc-400
                  border border-white/[0.06] bg-white/[0.03] transition-colors"
              >
                ✕ Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input box */}
      <motion.div
        animate={{
          boxShadow: hasValue
            ? "0 0 0 1px rgba(139,92,246,0.35), 0 8px 32px rgba(139,92,246,0.12)"
            : "0 0 0 1px rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.4)",
        }}
        transition={{ duration: 0.2 }}
        className="relative flex items-end gap-3 rounded-2xl glass-strong p-3"
      >
        {/* Sparkles icon */}
        <div className="flex-shrink-0 self-end mb-0.5">
          <motion.div
            animate={{ opacity: hasValue ? 1 : 0.4 }}
            className="w-7 h-7 rounded-lg gradient-purple-blue flex items-center justify-center"
            style={{ boxShadow: hasValue ? "0 0 12px rgba(139,92,246,0.5)" : "none" }}
          >
            <Sparkles size={13} className="text-white" />
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
            listening
              ? "Listening…"
              : activeEngine
              ? `Ask ${activeEngine} engine anything…`
              : "Ask anything about growth, branding, content, trends…"
          }
          rows={1}
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600
            resize-none border-none outline-none leading-relaxed
            max-h-40 overflow-y-auto py-1.5"
          style={{ minHeight: 32 }}
        />

        {/* Right actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0 self-end mb-0.5">
          {voiceOk && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleVoice}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: listening ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${listening ? "rgba(244,63,94,0.4)" : "transparent"}`,
                animation: listening ? "pulse-glow 1s ease-in-out infinite" : "none",
              }}
            >
              {listening
                ? <MicOff size={13} style={{ color: "#F43F5E" }} />
                : <Mic size={13} className="text-zinc-500" />
              }
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={submit}
            disabled={!hasValue || loading}
            animate={{
              background: hasValue && !loading
                ? "linear-gradient(135deg,#8B5CF6,#3B82F6)"
                : "rgba(255,255,255,0.06)",
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              border: hasValue && !loading ? "none" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: hasValue && !loading ? "0 2px 12px rgba(139,92,246,0.4)" : "none",
            }}
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowUp size={13} style={{ color: hasValue ? "#fff" : "#52525B" }} />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Hint bar */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-3 text-[10px] text-zinc-700">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] font-mono text-[9px]">↵</kbd>
            send
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] font-mono text-[9px]">⇧↵</kbd>
            newline
          </span>
          {voiceOk && <span>🎤 voice</span>}
        </div>
        <div className="text-[10px] text-zinc-700 flex items-center gap-1">
          <Command size={9} />
          <span>Corex AI · v2</span>
        </div>
      </div>
    </div>
  );
}
