import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";

function handleGetStarted(navigate) {
  const loggedIn = localStorage.getItem("isLoggedIn") === "true";
  const verified = localStorage.getItem("isVerified")  === "true";
  if (loggedIn && verified) navigate("/app/chat");
  else navigate("/app");
}

/* ─── Pill Navbar ─── */
function Navbar() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Home");
  const items = ["Home", "Pricing", "COREX", "Features", "Contact"];

  const handleNav = (item) => {
    setActive(item);
    if (item === "Features")
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    else if (item === "Pricing")
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    else if (item === "COREX")
      navigate("/app");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 40,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 8px 8px 24px",
        background: "#222222",
        borderRadius: 100,
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}
    >
      {items.map((item) => (
        <button
          key={item}
          onClick={() => handleNav(item)}
          style={{
            padding: "8px 20px",
            borderRadius: 100,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: item === "COREX" ? 600 : 400,
            fontFamily: "'Instrument Sans', sans-serif",
            background: active === item ? "rgba(255,255,255,0.4)" : "transparent",
            color: active === item ? "#000000" : "rgba(255,255,255,0.7)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (active !== item) e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            if (active !== item)
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

/* ─── Hero ─── */
function Hero() {
  const navigate = useNavigate();

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        textAlign: "center",
        background: "#000000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
          position: "relative",
        }}
      >
        {/* Beta badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 100,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'Instrument Sans', sans-serif",
            marginBottom: 40,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#9CFCAF",
              display: "inline-block",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          Now in Beta — Free to try
        </div>

        {/* H1 sans */}
        <h1
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(48px, 8vw, 96px)",
            color: "#ffffff",
            letterSpacing: "-2px",
            lineHeight: 1,
            margin: 0,
          }}
        >
          The Creative OS
        </h1>

        {/* H2 serif italic */}
        <h2
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(40px, 7vw, 88px)",
            color: "#ffffff",
            lineHeight: 1.1,
            margin: "4px 0 0",
            letterSpacing: "-1px",
          }}
        >
          for what you're building.
        </h2>

        <p
          style={{
            marginTop: 24,
            fontSize: 16,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'Instrument Sans', sans-serif",
            maxWidth: 480,
            lineHeight: 1.6,
          }}
        >
          Not a chatbot. A system. Built for creative thinkers who move fast.
        </p>

        <p
          style={{
            marginTop: 8,
            fontSize: 13,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'Instrument Sans', sans-serif",
          }}
        >
          10 free ideas daily · No credit card required
        </p>

        {/* CTA button */}
        <motion.button
          onClick={() => handleGetStarted(navigate)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          style={{
            marginTop: 40,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 16px 16px 32px",
            borderRadius: 100,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
            fontSize: 17,
            fontWeight: 600,
            color: "#000000",
            fontFamily: "'Instrument Sans', sans-serif",
          }}
        >
          Let's Create
          <span
            style={{
              width: 36,
              height: 36,
              background: "#000000",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            →
          </span>
        </motion.button>
      </motion.div>
    </section>
  );
}

/* ─── Philosophy Card ─── */
function PhilosophyCard() {
  return (
    <section
      style={{
        background: "#000000",
        padding: "0 24px 120px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <motion.div
        data-reveal
        style={{
          maxWidth: 900,
          width: "100%",
          background: "linear-gradient(135deg, #0a1a0f 0%, #050d0a 50%, #0a0d1a 100%)",
          borderRadius: 24,
          padding: "80px 60px",
          border: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 22,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.7)",
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 400,
          }}
        >
          The true sign of intelligence is not knowledge but{" "}
          <em
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              color: "#ffffff",
            }}
          >
            Imagination.
          </em>
        </p>
      </motion.div>
    </section>
  );
}

/* ─── Main Export ─── */
export default function MainLanding() {
  useScrollReveal();

  return (
    <div style={{ background: "#000000", minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <PhilosophyCard />
    </div>
  );
}
