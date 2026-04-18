import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FONT = "'Instrument Sans', sans-serif";

const fieldStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1.5px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#ffffff",
  fontSize: 15,
  fontFamily: "'Instrument Sans', sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [name,      setName]      = useState(localStorage.getItem("corex_user_name") || "");
  const [brand,     setBrand]     = useState(localStorage.getItem("corex_brand_name") || "");
  const [challenge, setChallenge] = useState(localStorage.getItem("corex_first_challenge") || "");
  const [saving,    setSaving]    = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const n = name.trim();
    const b = brand.trim();
    const c = challenge.trim();
    localStorage.setItem("corex_user_name",      n);
    localStorage.setItem("corex_brand_name",     b);
    localStorage.setItem("corex_first_challenge", c);
    if (n) localStorage.setItem("userName", n);
    localStorage.setItem("corex_plan",         localStorage.getItem("corex_plan") || "free");
    localStorage.setItem("corex_profile_done", "true");
    setTimeout(() => navigate("/app/dashboard", { replace: true }), 300);
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
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 28,
            color: "#ffffff",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Let's set up your space
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
            fontFamily: FONT,
            marginBottom: 32,
          }}
        >
          Takes 30 seconds.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Your name */}
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={fieldStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(156,252,175,0.4)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />

          {/* Brand or project */}
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Lumē, NineteenTwentys, @yourhandle"
            style={fieldStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(156,252,175,0.4)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />

          {/* Biggest creative challenge */}
          <input
            type="text"
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            placeholder="e.g. our content isn't converting, can't figure out our brand voice..."
            style={fieldStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(156,252,175,0.4)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />

          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "15px 0",
              borderRadius: 100,
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

        <p
          style={{
            marginTop: 16,
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            textAlign: "center",
            fontFamily: FONT,
          }}
        >
          50 free credits · No card needed · Cancel anytime
        </p>
      </motion.div>
    </div>
  );
}
