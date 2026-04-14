import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FONT = "'Instrument Sans', sans-serif";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [name, setName] = useState(localStorage.getItem("corex_user_name") || "");
  const [brand, setBrand] = useState(localStorage.getItem("corex_brand_name") || "");
  const [saving, setSaving] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const n = name.trim();
    const b = brand.trim();
    localStorage.setItem("corex_user_name", n);
    localStorage.setItem("corex_brand_name", b);
    if (n) localStorage.setItem("userName", n);
    if (!localStorage.getItem("corex_credits")) {
      localStorage.setItem("corex_credits", "50");
    }
    localStorage.setItem("corex_plan", localStorage.getItem("corex_plan") || "free");
    localStorage.setItem("corex_profile_done", "true");
    setTimeout(() => navigate("/app/dashboard", { replace: true }), 300);
  }

  function handleSkip() {
    localStorage.setItem("corex_profile_done", "true");
    if (!localStorage.getItem("corex_credits")) {
      localStorage.setItem("corex_credits", "50");
    }
    navigate("/app/dashboard", { replace: true });
  }

  return (
    <div
      className="page-enter"
      style={{
        minHeight: "100vh",
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 440 }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(#000,#000) padding-box, linear-gradient(135deg,#226FF7,#6BC3CE,#9CFCAF,#FFEA71) border-box",
            border: "2px solid transparent",
            marginBottom: 32,
          }}
        />

        <p style={{ fontSize: 13, fontFamily: FONT, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
          One quick thing —
        </p>
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(24px, 4vw, 32px)",
            color: "#ffffff",
            lineHeight: 1.25,
            marginBottom: 32,
          }}
        >
          What should we call you and your brand?
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontFamily: FONT, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>
              Your name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aadit, Priya, Rohan"
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: 12,
                fontSize: 15,
                fontFamily: FONT,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ffffff",
                caretColor: "#9CFCAF",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(156,252,175,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontFamily: FONT, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>
              Your brand or project name
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Lumē Skincare, NineteenTwentys, @yourhandle"
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: 12,
                fontSize: 15,
                fontFamily: FONT,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ffffff",
                caretColor: "#9CFCAF",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(156,252,175,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ translateY: -1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              marginTop: 8,
              padding: "14px 20px",
              borderRadius: 12,
              fontSize: 15,
              fontFamily: FONT,
              fontWeight: 700,
              background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
              color: "#000000",
              border: "none",
              cursor: saving ? "default" : "pointer",
              transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Setting up…" : "Let's create →"}
          </motion.button>
        </form>

        <button
          onClick={handleSkip}
          style={{
            marginTop: 20,
            display: "block",
            width: "100%",
            textAlign: "center",
            fontSize: 13,
            fontFamily: FONT,
            color: "rgba(255,255,255,0.25)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
        >
          Skip for now →
        </button>
      </motion.div>
    </div>
  );
}
