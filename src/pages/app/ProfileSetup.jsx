import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { saveUserProfile } from "../../utils/userProfile";

export default function ProfileSetup({ userType }) {
  const navigate = useNavigate();
  const isCreator = userType !== "company";

  const [name,  setName]  = useState(localStorage.getItem("userName") || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");

  const accent     = isCreator ? "#9CFCAF" : "#a78bfa";
  const accentRgba = isCreator ? "rgba(156,252,175," : "rgba(167,139,250,";

  function finish(e) {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem("userName", name.trim());
    }
    if (email.trim()) {
      localStorage.setItem("userEmail", email.trim());
    }
    saveUserProfile({
      name:  name.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });
    localStorage.setItem("corex_profile_done", "true");
    navigate("/app/dashboard", { replace: true });
  }

  const inputStyle = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 16,
    fontSize: 15,
    fontFamily: "'Instrument Sans', sans-serif",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#ffffff",
    caretColor: accent,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: isCreator ? "#060a07" : "#06040f",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 400, borderRadius: "50%",
        background: isCreator
          ? "radial-gradient(ellipse, rgba(156,252,175,0.06) 0%, transparent 65%)"
          : "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 65%)",
        pointerEvents: "none",
      }}/>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}
      >
        {/* Logo/icon */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: `${accentRgba}0.08)`,
            border: `1px solid ${accentRgba}0.25)`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
          }}>
            <span style={{
              fontSize: 22, fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
              background: `linear-gradient(135deg, ${accent}, ${accentRgba}0.6))`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>C</span>
          </div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
            fontSize: "clamp(24px,5vw,32px)", color: "#ffffff", margin: "0 0 8px",
          }}>
            Quick setup
          </h1>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.4)",
            fontFamily: "'Instrument Sans', sans-serif", margin: 0,
          }}>
            Just the basics — takes 10 seconds.
          </p>
        </div>

        <form onSubmit={finish} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "'Instrument Sans', sans-serif", marginBottom: 8 }}>
              Your name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Aadit"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = `${accentRgba}0.5)`}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "'Instrument Sans', sans-serif", marginBottom: 8 }}>
              Phone <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = `${accentRgba}0.5)`}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "'Instrument Sans', sans-serif", marginBottom: 8 }}>
              Email <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = `${accentRgba}0.5)`}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ translateY: -1 }}
            whileTap={{ scale: 0.97 }}
            style={{
              marginTop: 8,
              padding: "15px 0",
              borderRadius: 100,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              background: isCreator
                ? "linear-gradient(135deg, #1a7a3c, #9CFCAF)"
                : "linear-gradient(135deg, #7c3aed, #a78bfa)",
              color: isCreator ? "#050a06" : "#ffffff",
              transition: "box-shadow 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = isCreator ? "0 8px 28px rgba(156,252,175,0.25)" : "0 8px 28px rgba(124,58,237,0.35)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            Let's go →
          </motion.button>

          <button
            type="button"
            onClick={() => { localStorage.setItem("corex_profile_done", "true"); navigate("/app/dashboard", { replace: true }); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "rgba(255,255,255,0.25)",
              fontFamily: "'Instrument Sans', sans-serif",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
          >
            Skip for now
          </button>
        </form>
      </motion.div>
    </div>
  );
}
