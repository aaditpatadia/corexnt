import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MODES = [
  {
    icon: "⚡",
    name: "Strategist",
    id: "Strategy",
    desc: "Structured thinking. Clear frameworks. Execution-ready output.",
  },
  {
    icon: "📖",
    name: "Storyteller",
    id: "Narrative",
    desc: "Narrative-first. Emotional resonance. Campaigns that stick.",
  },
  {
    icon: "🎨",
    name: "Designer",
    id: "Content",
    desc: "Visual direction. Aesthetic language. Mood and concept.",
  },
  {
    icon: "🚀",
    name: "Founder",
    id: "Growth",
    desc: "First principles. Market angles. Build what matters.",
  },
];

export default function ModesPage() {
  const navigate = useNavigate();

  const [activeModes, setActiveModes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("corex_modes") || "[]");
      if (Array.isArray(saved)) return new Set(saved);
      // migrate legacy single mode
      const legacy = localStorage.getItem("corex_mode");
      return legacy ? new Set([legacy]) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleMode = (id) => {
    setActiveModes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 3) return prev; // max 3
        next.add(id);
      }
      localStorage.setItem("corex_modes", JSON.stringify([...next]));
      localStorage.setItem("corex_mode", [...next][0] || ""); // keep legacy compat
      return next;
    });
  };

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        background: "#000000",
        padding: "40px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: 700, width: "100%", textAlign: "center" }}
      >
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 36,
            color: "#ffffff",
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          Creative Modes
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'Instrument Sans', sans-serif",
            marginBottom: 8,
          }}
        >
          Choose how Corex thinks with you
        </p>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.25)",
            fontFamily: "'Instrument Sans', sans-serif",
            marginBottom: 40,
          }}
        >
          Select up to 3 modes
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {MODES.map((mode, i) => {
            const isActive = activeModes.has(mode.id);
            const isDisabled = !isActive && activeModes.size >= 3;
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                style={{
                  padding: 24,
                  borderRadius: 20,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  transition: "all 0.2s ease",
                  opacity: isDisabled ? 0.4 : 1,
                  ...(isActive
                    ? {
                        background: "linear-gradient(#000,#000) padding-box, linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71) border-box",
                        border: "1px solid transparent",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }),
                }}
                onClick={() => !isDisabled && toggleMode(mode.id)}
                onMouseEnter={(e) => {
                  if (!isActive && !isDisabled) {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive && !isDisabled) {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }
                }}
              >
                <span style={{ fontSize: 32 }}>{mode.icon}</span>

                <div>
                  <h3
                    style={{
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 18,
                      color: "#ffffff",
                      marginBottom: 6,
                    }}
                  >
                    {mode.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "'Instrument Sans', sans-serif",
                      lineHeight: 1.5,
                    }}
                  >
                    {mode.desc}
                  </p>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); if (!isDisabled) toggleMode(mode.id); }}
                  style={{
                    marginTop: "auto",
                    padding: "8px 16px",
                    borderRadius: 100,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: isActive
                      ? "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)"
                      : "transparent",
                    color: isActive ? "#000000" : "rgba(255,255,255,0.5)",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "'Instrument Sans', sans-serif",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    alignSelf: "flex-start",
                    transition: "all 0.2s",
                  }}
                >
                  {isActive ? "Active ✓" : "Select"}
                </button>
              </motion.div>
            );
          })}
        </div>

        {activeModes.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
          >
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Instrument Sans', sans-serif" }}>
              {activeModes.size === 1
                ? `${MODES.find(m => activeModes.has(m.id))?.name} mode active`
                : `${[...activeModes].map(id => MODES.find(m => m.id === id)?.name).join(" + ")} active`}
            </p>
            <button
              onClick={() => navigate("/app/chat")}
              style={{
                padding: "14px 32px",
                borderRadius: 100,
                border: "none",
                background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
                color: "#000000",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "'Instrument Sans', sans-serif",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Start creating →
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
