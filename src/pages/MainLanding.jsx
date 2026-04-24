import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";

const FONT    = "'Instrument Sans', sans-serif";
const SERIF   = "'Instrument Serif', serif";
const GRAD    = "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)";

function handleGetStarted(navigate) {
  const loggedIn = localStorage.getItem("isLoggedIn") === "true";
  const verified = localStorage.getItem("isVerified")  === "true";
  if (loggedIn && verified) navigate("/app/chat");
  else navigate("/app");
}

/* ── Scroll-triggered fade-up ── */
function FadeUp({ children, delay = 0, y = 28 }) {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

/* ── Upgrade Banner (inline — shown in pricing section) ── */
function UpgradeBanner({ text, sub, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [closed,  setClosed]  = useState(false);
  if (closed) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "8px 12px 8px 16px",
          borderRadius: 100,
          background: "rgba(34,111,247,0.08)",
          border: "1px solid rgba(34,111,247,0.3)",
          position: "relative", overflow: "visible",
        }}
      >
        {/* floating gear icons on hover */}
        <AnimatePresence>
          {hovered && (
            <>
              <motion.svg key="g1" initial={{ opacity:0, x:0, y:0 }} animate={{ opacity:1, x:-10, y:-10 }} exit={{ opacity:0 }}
                transition={{ duration:0.3 }} width="14" height="14" viewBox="0 0 16 16"
                style={{ position:"absolute", left:4, top:2, pointerEvents:"none" }}
                fill="rgba(34,111,247,0.7)">
                <path fillRule="evenodd" clipRule="evenodd" d="M9.5 0h-3l-.274 1.46a5 5 0 0 1-1.86.762l-1.226-.839L.856 3.404l.84 1.226a5 5 0 0 1-.762 1.86L-.5 6.5v3l1.433.275c.18.548.44 1.063.762 1.528l-.84 1.226 2.085 2.085 1.226-.84c.465.323.98.582 1.528.762L5.5 16h3l.275-1.433a5 5 0 0 0 1.528-.762l1.226.84 2.085-2.085-.84-1.226a5 5 0 0 0 .762-1.528L15 9.5v-3l-1.433-.275a5 5 0 0 0-.762-1.528l.84-1.226L11.56.856 10.334 1.7A5 5 0 0 0 9.806.237L9.5 0zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </motion.svg>
              <motion.svg key="g2" initial={{ opacity:0, x:0, y:0 }} animate={{ opacity:1, x:10, y:10 }} exit={{ opacity:0 }}
                transition={{ duration:0.3 }} width="14" height="14" viewBox="0 0 16 16"
                style={{ position:"absolute", right:40, bottom:2, pointerEvents:"none" }}
                fill="rgba(34,111,247,0.7)">
                <path fillRule="evenodd" clipRule="evenodd" d="M9.5 0h-3l-.274 1.46a5 5 0 0 1-1.86.762l-1.226-.839L.856 3.404l.84 1.226a5 5 0 0 1-.762 1.86L-.5 6.5v3l1.433.275c.18.548.44 1.063.762 1.528l-.84 1.226 2.085 2.085 1.226-.84c.465.323.98.582 1.528.762L5.5 16h3l.275-1.433a5 5 0 0 0 1.528-.762l1.226.84 2.085-2.085-.84-1.226a5 5 0 0 0 .762-1.528L15 9.5v-3l-1.433-.275a5 5 0 0 0-.762-1.528l.84-1.226L11.56.856 10.334 1.7A5 5 0 0 0 9.806.237L9.5 0zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </motion.svg>
            </>
          )}
        </AnimatePresence>
        <button
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: FONT, fontSize: 13, fontWeight: 700,
            color: "#226FF7", textDecoration: "underline",
            textUnderlineOffset: 4, padding: 0,
          }}
        >{text}</button>
        <span style={{ fontFamily: FONT, fontSize: 13, color: "rgba(107,195,206,0.9)" }}>{sub}</span>
        <button
          onClick={() => setClosed(true)}
          style={{
            width: 22, height: 22, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 12,
            transition: "background 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
        >✕</button>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Navbar ── */
function Navbar() {
  const navigate  = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = ["Features", "How it works", "Pricing", "Contact"];

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    if (id === "top") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (id === "Pricing") { navigate("/app/payment"); return; }
    document.getElementById(id.toLowerCase().replace(/ /g,"-"))?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @keyframes liveIntelPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes gradShift {
          0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%}
        }
        .corex-mobile-hide { display: none; }
        @media(min-width:700px) { .corex-mobile-hide { display: flex !important; } }
        .corex-mobile-menu { display: none; }
        @media(max-width:699px) { .corex-mobile-menu { display: block !important; } }
      `}</style>

      <div style={{
        position: "fixed", top: 16, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "center", pointerEvents: "none",
      }}>
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            pointerEvents: "auto",
            display: "flex", alignItems: "center", gap: 4,
            padding: "6px 6px 6px 20px",
            background: scrolled ? "rgba(10,10,10,0.92)" : "rgba(18,18,18,0.85)",
            backdropFilter: "blur(24px)",
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: scrolled
              ? "0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 4px 24px rgba(0,0,0,0.5)",
            transition: "all 0.3s ease",
            maxWidth: "calc(100vw - 32px)",
          }}
        >
          {/* Logo wordmark */}
          <button
            onClick={() => scrollTo("top")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: SERIF, fontStyle: "italic", fontSize: 18,
              color: "#ffffff", fontWeight: 400, letterSpacing: "-0.3px",
              marginRight: 8, padding: 0,
            }}
          >Corex</button>

          {/* Nav links — hidden on mobile */}
          <div className="corex-mobile-hide" style={{ alignItems: "center", gap: 2 }}>
            {items.map(item => (
              <button key={item} onClick={() => scrollTo(item)}
                style={{
                  padding: "8px 14px", borderRadius: 100, border: "none",
                  cursor: "pointer", background: "transparent",
                  color: "rgba(255,255,255,0.55)", fontSize: 13.5,
                  fontFamily: FONT, fontWeight: 500, whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color="#ffffff"; e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.55)"; e.currentTarget.style.background="transparent"; }}
              >{item}</button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", margin: "0 4px" }}/>

          {/* CTA */}
          <motion.button
            onClick={() => handleGetStarted(navigate)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: "9px 20px", borderRadius: 100, border: "none",
              cursor: "pointer", fontFamily: FONT, fontSize: 13.5, fontWeight: 700,
              background: GRAD, color: "#000000", whiteSpace: "nowrap",
            }}
          >
            {scrolled ? "Open app →" : "Start free →"}
          </motion.button>

          {/* Mobile hamburger */}
          <button className="corex-mobile-menu"
            onClick={() => setMobileOpen(p => !p)}
            style={{
              background: "rgba(255,255,255,0.06)", border: "none",
              borderRadius: "50%", width: 36, height: 36,
              cursor: "pointer", color: "#ffffff", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginLeft: 4,
            }}
          >{mobileOpen ? "✕" : "☰"}</button>
        </motion.nav>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{
              position: "fixed", top: 80, left: 16, right: 16, zIndex: 99,
              background: "rgba(14,14,14,0.98)", backdropFilter: "blur(20px)",
              borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)",
              padding: 16, display: "flex", flexDirection: "column", gap: 4,
            }}
          >
            {items.map(item => (
              <button key={item} onClick={() => scrollTo(item)}
                style={{
                  padding: "12px 16px", borderRadius: 12, border: "none",
                  cursor: "pointer", background: "transparent",
                  color: "rgba(255,255,255,0.7)", fontSize: 15,
                  fontFamily: FONT, fontWeight: 500, textAlign: "left",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color="#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.7)"; }}
              >{item}</button>
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "4px 0" }}/>
            <motion.button
              onClick={() => { setMobileOpen(false); handleGetStarted(navigate); }}
              whileTap={{ scale: 0.97 }}
              style={{ padding: "13px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 15, fontWeight: 700, background: GRAD, color: "#000" }}
            >Start creating for free →</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Hero ── */
function Hero() {
  const navigate = useNavigate();
  const [arrowHovered, setArrowHovered] = useState(false);

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "160px 24px 0",
      background: "#000000", position: "relative", overflow: "hidden",
      textAlign: "center",
    }}>
      {/* Ambient gradient orbs */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{
          position:"absolute", top:"-10%", left:"50%", transform:"translateX(-50%)",
          width:800, height:600,
          background:"radial-gradient(ellipse at center, rgba(34,111,247,0.12) 0%, rgba(107,195,206,0.06) 40%, transparent 70%)",
          borderRadius:"50%",
        }}/>
        <div style={{
          position:"absolute", top:"20%", left:"-5%",
          width:400, height:400,
          background:"radial-gradient(ellipse, rgba(156,252,175,0.06) 0%, transparent 70%)",
          borderRadius:"50%", animation:"floatY 8s ease-in-out infinite",
        }}/>
        <div style={{
          position:"absolute", top:"15%", right:"-5%",
          width:350, height:350,
          background:"radial-gradient(ellipse, rgba(255,234,113,0.05) 0%, transparent 70%)",
          borderRadius:"50%", animation:"floatY 10s ease-in-out infinite 2s",
        }}/>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {/* Announcement badge */}
        <motion.a
          href="#how-it-works"
          onClick={e => { e.preventDefault(); document.getElementById("how-it-works")?.scrollIntoView({ behavior:"smooth" }); }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          onMouseEnter={() => setArrowHovered(true)}
          onMouseLeave={() => setArrowHovered(false)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "5px 5px 5px 16px", borderRadius: 100,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            marginBottom: 48, cursor: "pointer", textDecoration: "none",
            transition: "border-color 0.2s, background 0.2s",
          }}
          whileHover={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.07)" }}
        >
          <span style={{ display:"flex", alignItems:"center", gap:7, fontFamily:FONT, fontSize:13.5, color:"rgba(255,255,255,0.7)", fontWeight:500 }}>
            <motion.span
              animate={{ scale:[1,1.3,1], opacity:[1,0.5,1] }}
              transition={{ duration:2, repeat:Infinity }}
              style={{ width:6, height:6, borderRadius:"50%", background:"#9CFCAF", display:"inline-block" }}
            />
            Shipping v17 — Live intelligence &amp; rich formatting
          </span>
          <span style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
          }}>
            <motion.div
              animate={{ x: arrowHovered ? 0 : "-50%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ display:"flex", width:56 }}
            >
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)", width:28, textAlign:"center", flexShrink:0 }}>→</span>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)", width:28, textAlign:"center", flexShrink:0 }}>→</span>
            </motion.div>
          </span>
        </motion.a>

        {/* Headline */}
        <h1 style={{
          fontFamily: FONT, fontWeight: 800,
          fontSize: "clamp(52px, 9.5vw, 108px)",
          color: "#ffffff", letterSpacing: "-3px",
          lineHeight: 0.93, margin: 0, maxWidth: 900,
        }}>
          The Creative OS
        </h1>
        <h2 style={{
          fontFamily: SERIF, fontStyle: "italic", fontWeight: 400,
          fontSize: "clamp(44px, 8vw, 96px)",
          lineHeight: 1.06, margin: "10px 0 0", letterSpacing: "-1px", maxWidth: 900,
          background: GRAD,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          for what you build.
        </h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            marginTop: 28, fontSize: 18, color: "rgba(255,255,255,0.48)",
            fontFamily: FONT, maxWidth: 540, lineHeight: 1.65, fontWeight: 400,
          }}
        >
          Not a chatbot. A system. The first Creative Operating System built for brands, creators, and founders who move fast.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 44, flexWrap: "wrap", justifyContent: "center" }}
        >
          {/* Primary */}
          <div style={{
            padding: 2, borderRadius: 100,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <motion.button
              onClick={() => handleGetStarted(navigate)}
              whileHover={{ scale: 1.03, boxShadow: "0 16px 48px rgba(107,195,206,0.2)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 14,
                padding: "15px 15px 15px 32px", borderRadius: 100,
                border: "none", cursor: "pointer",
                background: GRAD, color: "#000000",
                fontSize: 16, fontWeight: 700, fontFamily: FONT,
              }}
            >
              Start Creating
              <span style={{
                width: 38, height: 38, background: "rgba(0,0,0,0.2)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </motion.button>
          </div>

          {/* Ghost */}
          <motion.button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior:"smooth" })}
            whileHover={{ scale: 1.02, color: "#ffffff" }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "16px 28px", borderRadius: 100, border: "none",
              cursor: "pointer", background: "transparent",
              color: "rgba(255,255,255,0.5)", fontSize: 16, fontWeight: 500,
              fontFamily: FONT, transition: "color 0.2s",
            }}
          >
            See how it works
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          style={{ marginTop: 18, fontSize: 13, color: "rgba(255,255,255,0.22)", fontFamily: FONT }}
        >
          5 free projects · No credit card · Instant access
        </motion.p>
      </motion.div>

      {/* App Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative", width: "100%", maxWidth: 1060,
          margin: "72px auto 0", padding: "0 0 0",
        }}
      >
        {/* Fade-to-black gradient over the bottom of mockup */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
          background: "linear-gradient(to bottom, transparent, #000000)",
          zIndex: 2, pointerEvents: "none",
        }}/>

        {/* Mock UI */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.7)",
          padding: 16,
        }}>
          {/* Titlebar */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, padding:"0 4px" }}>
            {["#ff5f57","#febc2e","#28c840"].map(c => (
              <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c }}/>
            ))}
            <div style={{
              flex:1, height:28, borderRadius:8,
              background:"rgba(255,255,255,0.04)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontFamily:FONT, color:"rgba(255,255,255,0.25)",
            }}>corexnt.com/app/chat</div>
          </div>

          {/* Chat interface preview */}
          <div style={{ display:"flex", height:420, gap:0, borderRadius:16, overflow:"hidden" }}>
            {/* Sidebar */}
            <div style={{ width:200, background:"rgba(255,255,255,0.02)", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"16px 12px", flexShrink:0 }}>
              <div style={{ fontSize:11, fontFamily:FONT, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,0.2)", marginBottom:12 }}>RECENT</div>
              {["Brand strategy for D2C", "Reel hook ideas", "Competitor analysis", "Flow plan — Q2", "Design critique"].map((item, i) => (
                <div key={i} style={{
                  padding:"8px 10px", borderRadius:8, marginBottom:4,
                  background: i===0 ? "rgba(255,255,255,0.06)" : "transparent",
                  fontSize:12, fontFamily:FONT, color: i===0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                }}>{item}</div>
              ))}
            </div>

            {/* Chat area */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"20px 24px", gap:16, overflowY:"hidden" }}>
              {/* AI response */}
              <div>
                <div style={{ fontSize:10, fontFamily:FONT, fontWeight:700, letterSpacing:"2px", color:"rgba(255,255,255,0.25)", marginBottom:8, textTransform:"uppercase" }}>COREX Intelligence</div>
                <div style={{ fontSize:13, fontFamily:FONT, fontWeight:700, color:"#ffffff", marginBottom:8 }}>
                  Brand Strategy for Your D2C Launch
                </div>
                {/* Fake markdown content */}
                {[
                  { w:"60%", op:0.7 }, { w:"85%", op:0.55 }, { w:"45%", op:0.55 },
                ].map((l,i) => (
                  <div key={i} style={{ height:8, width:l.w, background:`rgba(255,255,255,${l.op*0.2})`, borderRadius:4, marginBottom:6 }}/>
                ))}
                {/* Fake table */}
                <div style={{ marginTop:12, borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)" }}>
                  {["Channel", "Budget", "Expected ROAS"].map((h,i) => (
                    <div key={i} style={{ display:"flex", gap:0, borderBottom: i<2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      {["Meta Ads","₹40,000","3.2x"].map((cell,j) => (
                        <div key={j} style={{ flex:1, padding:"6px 10px", fontSize:11, fontFamily:FONT, color: i===0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.7)", background: i===0 ? "rgba(255,255,255,0.04)" : "transparent" }}>
                          {i===0 ? h : cell}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {/* Chips */}
                <div style={{ display:"flex", gap:6, marginTop:12, flexWrap:"wrap" }}>
                  {["Go deeper", "Show competitors", "Make it viral"].map(c => (
                    <div key={c} style={{ padding:"5px 12px", borderRadius:100, border:"1px solid rgba(255,255,255,0.1)", fontSize:11, fontFamily:FONT, color:"rgba(255,255,255,0.5)", background:"rgba(255,255,255,0.03)" }}>{c}</div>
                  ))}
                </div>
              </div>

              {/* Input bar */}
              <div style={{ marginTop:"auto", background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, border:"1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ flex:1, fontSize:12, fontFamily:FONT, color:"rgba(255,255,255,0.25)" }}>Ask Corex anything...</div>
                <div style={{ width:28, height:28, borderRadius:"50%", background:GRAD, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Logo bar ── */
const USED_BY = [
  { name:"Brands", icon:"🏷️" }, { name:"Creators", icon:"🎥" }, { name:"Founders", icon:"🚀" },
  { name:"Designers", icon:"✏️" }, { name:"Marketers", icon:"📈" }, { name:"Agencies", icon:"🏢" },
  { name:"Studios", icon:"🎬" }, { name:"Startups", icon:"⚡" },
];
function LogoBar() {
  const [hovered, setHovered] = useState(false);
  return (
    <section style={{ background:"#000000", padding:"60px 24px 80px" }}>
      <FadeUp>
        <p style={{ textAlign:"center", fontSize:12, fontFamily:FONT, fontWeight:600, letterSpacing:"3px", textTransform:"uppercase", color:"rgba(255,255,255,0.2)", marginBottom:32 }}>
          Built for every kind of creative
        </p>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            maxWidth:780, margin:"0 auto", display:"flex", flexWrap:"wrap",
            gap:12, justifyContent:"center", alignItems:"center",
            transition:"all 0.5s",
            opacity: hovered ? 0.5 : 1,
          }}
        >
          {USED_BY.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale:1.08, opacity:1 }}
              style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"10px 20px", borderRadius:100,
                background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.07)",
                fontSize:14, fontFamily:FONT, color:"rgba(255,255,255,0.55)",
                fontWeight:500,
                opacity: hovered ? 0.4 : 1,
                transition:"opacity 0.3s",
              }}
            >
              <span>{item.icon}</span> {item.name}
            </motion.div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

/* ── Philosophy ── */
function Philosophy() {
  return (
    <section style={{ background:"#000000", padding:"0 24px 100px", display:"flex", justifyContent:"center" }}>
      <FadeUp>
        <div style={{ maxWidth:900, width:"100%", borderRadius:32, overflow:"hidden", position:"relative" }}>
          {/* Gradient border effect */}
          <div style={{
            position:"absolute", inset:0, padding:1, borderRadius:32,
            background:GRAD, WebkitMask:"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite:"xor", maskComposite:"exclude", pointerEvents:"none", zIndex:1,
          }}/>
          <div style={{
            background:"linear-gradient(135deg, #0a1020 0%, #050810 50%, #0a0d18 100%)",
            borderRadius:32, padding:"72px 64px", textAlign:"center", position:"relative", zIndex:0,
          }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", fontFamily:FONT, marginBottom:28 }}>
              The COREX Philosophy
            </p>
            <p style={{ fontSize:22, lineHeight:1.75, color:"rgba(255,255,255,0.65)", fontFamily:FONT, fontWeight:400, maxWidth:640, margin:"0 auto" }}>
              "The true sign of intelligence is not knowledge —<br/>
              but{" "}<em style={{ fontFamily:SERIF, fontStyle:"italic", color:"#ffffff", fontSize:26 }}>Imagination.</em>"
            </p>
            <div style={{ marginTop:32, display:"flex", justifyContent:"center", gap:12 }}>
              <span style={{ height:1, width:60, background:"rgba(255,255,255,0.1)", alignSelf:"center", display:"inline-block" }}/>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.3)", fontFamily:FONT }}>COREX is trained on creativity — and nothing else.</span>
              <span style={{ height:1, width:60, background:"rgba(255,255,255,0.1)", alignSelf:"center", display:"inline-block" }}/>
            </div>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

/* ── Features ── */
const FEATURES = [
  { icon:"⚡", title:"Instant Strategy", desc:"Campaign briefs, brand frameworks, and growth roadmaps in seconds. COREX thinks like a senior CMO.", grad:"rgba(34,111,247,0.07)", accent:"#226FF7" },
  { icon:"🌐", title:"Live Web Intelligence", desc:"Real-time web search surfaces exactly what competitors are doing RIGHT NOW — ads, influencer moves, pricing, campaigns.", grad:"rgba(107,195,206,0.07)", accent:"#6BC3CE" },
  { icon:"🚀", title:"Execution Playbooks", desc:"Not just ideas — step-by-step plans with real deadlines, budgets, and named influencers you can action today.", grad:"rgba(156,252,175,0.07)", accent:"#9CFCAF" },
  { icon:"📈", title:"Creator Growth Engine", desc:"Reel scripts, brand deal pricing, niche benchmarking, and monetisation roadmaps built for creators worldwide.", grad:"rgba(255,234,113,0.07)", accent:"#FFEA71" },
  { icon:"🧠", title:"Multi-Mode Thinking", desc:"Switch between Strategist, Storyteller, Designer, and Founder modes — COREX adapts its intelligence to yours.", grad:"rgba(168,85,247,0.07)", accent:"#a855f7" },
  { icon:"📊", title:"Visual Intelligence", desc:"Every data response auto-generates charts and formatted tables. Download as PDF. Share as reports. Impress every room.", grad:"rgba(249,115,22,0.07)", accent:"#f97316" },
];

function Features() {
  return (
    <section id="features" style={{ background:"#000000", padding:"80px 24px 120px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <FadeUp>
          <div style={{ textAlign:"center", marginBottom:72 }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", fontFamily:FONT, marginBottom:16 }}>
              What COREX does
            </p>
            <h2 style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:"clamp(36px,5vw,66px)", fontWeight:400, color:"#ffffff", margin:0, lineHeight:1.1 }}>
              Built different.
            </h2>
            <p style={{ marginTop:16, fontSize:17, color:"rgba(255,255,255,0.38)", fontFamily:FONT, maxWidth:480, margin:"16px auto 0" }}>
              Every feature is built for one purpose — turning your creative intent into real execution.
            </p>
          </div>
        </FadeUp>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))", gap:16 }}>
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.07}>
              <motion.div
                whileHover={{ y:-6, borderColor:`${f.accent}40` }}
                style={{
                  padding:"32px 28px", borderRadius:24,
                  background:f.grad,
                  border:`1px solid rgba(255,255,255,0.07)`,
                  transition:"all 0.25s ease", height:"100%",
                  position:"relative", overflow:"hidden",
                }}
              >
                {/* Top accent line */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${f.accent}00, ${f.accent}80, ${f.accent}00)` }}/>
                <div style={{ fontSize:32, marginBottom:18 }}>{f.icon}</div>
                <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:18, color:"#ffffff", marginBottom:10 }}>{f.title}</h3>
                <p style={{ fontSize:14.5, color:"rgba(255,255,255,0.48)", fontFamily:FONT, lineHeight:1.7 }}>{f.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ── */
const STEPS = [
  { num:"01", title:"Tell COREX what you're building", desc:"Describe your brand, campaign, content goal, or creative challenge in plain language. No forms, no templates." },
  { num:"02", title:"COREX searches, thinks, and structures", desc:"Live web intelligence pulls real data. The AI thinks in creative frameworks, not generic prompts. You get a structured output." },
  { num:"03", title:"Execute with clarity", desc:"Get a formatted plan with real steps, budgets, and timelines. Export as PDF. Share with your team. Move." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background:"#000000", padding:"80px 24px 120px" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        <FadeUp>
          <div style={{ textAlign:"center", marginBottom:72 }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", fontFamily:FONT, marginBottom:16 }}>
              How it works
            </p>
            <h2 style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:"clamp(32px,5vw,60px)", fontWeight:400, color:"#ffffff", margin:0, lineHeight:1.1 }}>
              Simple by design.
            </h2>
          </div>
        </FadeUp>

        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {STEPS.map((step, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div style={{ display:"flex", gap:28, alignItems:"flex-start", paddingBottom: i < STEPS.length-1 ? 0 : 0, position:"relative" }}>
                {/* Number + connector */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0, width:48 }}>
                  <div style={{
                    width:48, height:48, borderRadius:16,
                    background:"rgba(255,255,255,0.04)",
                    border:"1px solid rgba(255,255,255,0.1)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:FONT, fontSize:13, fontWeight:800,
                    color:"rgba(255,255,255,0.25)",
                    flexShrink:0,
                  }}>{step.num}</div>
                  {i < STEPS.length-1 && (
                    <div style={{ width:1, height:48, background:"linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)", margin:"4px 0" }}/>
                  )}
                </div>
                {/* Content */}
                <div style={{ paddingTop:10, paddingBottom:40 }}>
                  <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:19, color:"#ffffff", marginBottom:10 }}>{step.title}</h3>
                  <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", fontFamily:FONT, lineHeight:1.7 }}>{step.desc}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stats ── */
const STATS = [
  { value:"10K+", label:"Creative sessions" },
  { value:"4.9★", label:"User rating" },
  { value:"<3s", label:"Response time" },
  { value:"Global", label:"Creators worldwide" },
];
function Stats() {
  return (
    <section style={{ background:"#000000", padding:"0 24px 120px" }}>
      <FadeUp>
        <div style={{ maxWidth:900, margin:"0 auto", borderRadius:24, overflow:"hidden", border:"1px solid rgba(255,255,255,0.06)", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))" }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding:"44px 32px", textAlign:"center",
              background:"rgba(255,255,255,0.02)",
              borderRight: i < STATS.length-1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <p style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:44, fontWeight:400, color:"#ffffff", margin:"0 0 8px" }}>{s.value}</p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", fontFamily:FONT }}>{s.label}</p>
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

/* ── Pricing ── */
const PLANS = [
  {
    name: "SPARK",
    badge: null,
    price: "₹299",
    credits: "300 credits",
    bonus: null,
    totalCredits: null,
    expiry: "Credits expire in 90 days",
    desc: "75 smart sessions or 37 campaign briefs",
    free: ["Chat intelligence","Live web search","PDF downloads","Voice input","Basic history"],
    premium: null,
    premiumLabel: null,
    cta: "Get Spark →",
    highlight: false,
  },
  {
    name: "STUDIO",
    badge: "Most Popular",
    price: "₹799",
    credits: "1000 credits",
    bonus: "+ 200 bonus",
    totalCredits: "1200 total",
    expiry: "Credits expire in 180 days",
    desc: "A full month of serious creative work",
    free: ["Everything in Spark","Visual charts & flowcharts","Mindmaps & deep research","Flow system & project planning","Brand memory across sessions","Priority response speed"],
    premium: null,
    premiumLabel: null,
    cta: "Get Studio →",
    highlight: false,
  },
  {
    name: "NINETEEN TWENTYS",
    badge: "Full Creative OS",
    price: "₹1,920",
    credits: "3500 credits",
    bonus: "+ 500 bonus",
    totalCredits: "4000 total",
    expiry: "Never expires.",
    desc: "The full Creative OS.",
    free: ["Everything in Studio","Competitor deep-dives","Campaign brief generator","Design critique & pricing calculator","Multi-mode thinking (Search / Think / Plan)","Unlimited session length"],
    premium: null,
    premiumLabel: null,
    cta: "Get Nineteen Twentys →",
    highlight: true,
  },
];

function PricingCard({ plan, onUpgrade, index }) {
  const textCol  = plan.highlight ? "#000000" : "#ffffff";
  const mutedCol = plan.highlight ? "rgba(0,0,0,0.5)"  : "rgba(255,255,255,0.45)";
  const checkCol = plan.highlight ? "rgba(0,0,0,0.65)" : "rgba(156,252,175,0.85)";
  const sepCol   = plan.highlight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.07)";
  const cardBg   = plan.highlight
    ? "linear-gradient(145deg, #226FF7 0%, #6BC3CE 45%, #9CFCAF 72%, #FFEA71 100%)"
    : "rgba(255,255,255,0.03)";
  const cardBdr  = plan.highlight ? "none" : "1px solid rgba(255,255,255,0.08)";

  return (
    <FadeUp delay={index * 0.08}>
      <motion.div
        whileHover={{ y: -5 }}
        style={{
          borderRadius: 24, overflow: "hidden",
          background: cardBg, border: cardBdr,
          boxShadow: plan.highlight ? "0 28px 72px rgba(34,111,247,0.3)" : "none",
          transition: "all 0.25s ease", height: "100%",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* ── Glass header ── */}
        <div style={{
          padding: "26px 24px 18px", position: "relative",
          borderBottom: `1px solid ${sepCol}`,
          background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 40%, transparent 100%)",
        }}>
          {plan.badge && (
            <div style={{
              position: "absolute", top: 16, right: 16,
              padding: "3px 10px", borderRadius: 100,
              background: plan.highlight ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.1)",
              fontSize: 9.5, fontFamily: FONT, fontWeight: 700,
              color: plan.highlight ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
              letterSpacing: "1px", textTransform: "uppercase",
            }}>{plan.badge}</div>
          )}

          {/* Plan name */}
          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: mutedCol, fontFamily: FONT, marginBottom: 14 }}>
            {plan.name}
          </p>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, fontWeight: 400, color: textCol, lineHeight: 1 }}>
              {plan.price}
            </span>
          </div>

          {/* Credits row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontFamily: FONT, fontWeight: 600, color: textCol }}>
              {plan.credits}
            </span>
            {plan.bonus && (
              <>
                <span style={{ fontSize: 13, color: mutedCol, fontFamily: FONT }}>{plan.bonus}</span>
                <span style={{ fontSize: 12, fontFamily: FONT, fontWeight: 700,
                  color: plan.highlight ? "rgba(0,0,0,0.75)" : "#9CFCAF",
                  background: plan.highlight ? "rgba(0,0,0,0.1)" : "rgba(156,252,175,0.12)",
                  padding: "1px 8px", borderRadius: 20,
                }}>= {plan.totalCredits}</span>
              </>
            )}
          </div>

          {/* Desc + expiry */}
          <p style={{ fontSize: 12.5, color: mutedCol, fontFamily: FONT, lineHeight: 1.5, marginBottom: 2 }}>{plan.desc}</p>
          <p style={{ fontSize: 11.5, fontFamily: FONT, fontWeight: 600,
            color: plan.highlight
              ? (plan.expiry.includes("Never") ? "rgba(0,0,0,0.65)" : mutedCol)
              : (plan.expiry.includes("Never") ? "#9CFCAF" : "rgba(255,255,255,0.35)"),
          }}>
            {plan.expiry.includes("Never") ? "✦ " : ""}{plan.expiry}
          </p>
        </div>

        {/* ── Feature list ── */}
        <div style={{ padding: "18px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
            {plan.free.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <span style={{ color: checkCol, flexShrink: 0, marginTop: 1, fontSize: 13 }}>✓</span>
                <span style={{ fontFamily: FONT, fontSize: 13, color: plan.highlight ? "rgba(0,0,0,0.78)" : "rgba(255,255,255,0.68)", lineHeight: 1.45 }}>{f}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            onClick={onUpgrade}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{
              marginTop: 20,
              width: "100%", padding: "14px", borderRadius: 14, border: "none",
              cursor: "pointer", fontFamily: FONT, fontSize: 14, fontWeight: 700,
              background: plan.highlight
                ? "linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.7))"
                : "rgba(255,255,255,0.08)",
              color: plan.highlight ? "#ffffff" : "rgba(255,255,255,0.85)",
              transition: "all 0.2s",
              boxShadow: plan.highlight ? "0 4px 20px rgba(0,0,0,0.25)" : "none",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = plan.highlight ? "rgba(0,0,0,0.92)" : "rgba(255,255,255,0.13)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = plan.highlight ? "linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.7))" : "rgba(255,255,255,0.08)"; }}
          >{plan.cta}</motion.button>
        </div>
      </motion.div>
    </FadeUp>
  );
}

function Pricing() {
  const navigate = useNavigate();
  return (
    <section id="pricing" style={{ background:"#000000", padding:"80px 24px 120px" }}>
      <div style={{ maxWidth:1060, margin:"0 auto" }}>
        <FadeUp>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", fontFamily:FONT, marginBottom:16 }}>
              Pricing
            </p>
            <h2 style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:"clamp(32px,5vw,60px)", fontWeight:400, color:"#ffffff", margin:0, lineHeight:1.1 }}>
              Simple. Fair. Powerful.
            </h2>
            <div style={{ display:"flex", justifyContent:"center", marginTop:20 }}>
              <UpgradeBanner
                text="Upgrade to Nineteen Twentys"
                sub="— 33% off launch pricing, limited time"
                onClick={() => navigate("/app/payment")}
              />
            </div>
          </div>
        </FadeUp>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))", gap:16, alignItems:"stretch" }}>
          {PLANS.map((plan, i) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              index={i}
              onUpgrade={() => navigate(plan.name === "Free" ? "/app" : "/app/payment")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Banner ── */
function CTABanner() {
  const navigate = useNavigate();
  return (
    <section style={{ background:"#000000", padding:"0 24px 120px" }}>
      <FadeUp>
        <div style={{ maxWidth:900, margin:"0 auto", borderRadius:32, overflow:"hidden", position:"relative", padding:"96px 60px", textAlign:"center" }}>
          {/* Animated gradient background */}
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(135deg, #226FF7 0%, #6BC3CE 35%, #9CFCAF 65%, #FFEA71 100%)",
            backgroundSize:"300% 300%",
            animation:"gradShift 6s ease infinite",
          }}/>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.12)" }}/>
          <div style={{ position:"relative", zIndex:1 }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", color:"rgba(0,0,0,0.5)", fontFamily:FONT, marginBottom:20 }}>
              Ready to create?
            </p>
            <h2 style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:"clamp(32px,5vw,60px)", fontWeight:400, color:"#000000", margin:"0 0 16px", lineHeight:1.1 }}>
              Your creative intelligence<br/>system is waiting.
            </h2>
            <p style={{ fontSize:17, color:"rgba(0,0,0,0.55)", fontFamily:FONT, marginBottom:40 }}>
              5 free projects. No card. No nonsense.
            </p>
            <motion.button
              onClick={() => handleGetStarted(navigate)}
              whileHover={{ scale:1.04, boxShadow:"0 20px 48px rgba(0,0,0,0.3)" }}
              whileTap={{ scale:0.97 }}
              style={{
                display:"inline-flex", alignItems:"center", gap:14,
                padding:"16px 16px 16px 36px", borderRadius:100, border:"none",
                cursor:"pointer", background:"#000000", color:"#ffffff",
                fontSize:17, fontWeight:700, fontFamily:FONT,
              }}
            >
              Start for free
              <span style={{ width:42, height:42, background:"rgba(255,255,255,0.1)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </motion.button>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

/* ── Contact ── */
function Contact() {
  const [form, setForm] = useState({ name:"", email:"", message:"" });
  const [sent, setSent] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }));
  const inp = {
    width:"100%", padding:"14px 18px", borderRadius:14,
    border:"1.5px solid rgba(255,255,255,0.08)",
    background:"rgba(255,255,255,0.04)", color:"#ffffff",
    fontSize:15, fontFamily:FONT, outline:"none",
    transition:"border-color 0.2s", boxSizing:"border-box",
  };
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    const s = encodeURIComponent(`COREX — Message from ${form.name}`);
    const b = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:corexnt@gmail.com?subject=${s}&body=${b}`;
    setSent(true);
  };
  return (
    <section id="contact" style={{ background:"#000000", padding:"80px 24px 120px" }}>
      <div style={{ maxWidth:580, margin:"0 auto" }}>
        <FadeUp>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", fontFamily:FONT, marginBottom:16 }}>
              Get in touch
            </p>
            <h2 style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:"clamp(32px,5vw,54px)", fontWeight:400, color:"#ffffff", margin:"0 0 16px" }}>
              Let's talk.
            </h2>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.38)", fontFamily:FONT }}>
              Questions, partnerships, or just say hi —{" "}
              <a href="mailto:corexnt@gmail.com" style={{ color:"rgba(255,255,255,0.6)", textDecoration:"underline", textUnderlineOffset:3 }}>
                corexnt@gmail.com
              </a>
            </p>
          </div>
        </FadeUp>
        <FadeUp delay={0.1}>
          {sent ? (
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
              style={{ textAlign:"center", padding:"64px 40px", borderRadius:24, background:"rgba(156,252,175,0.05)", border:"1px solid rgba(156,252,175,0.15)" }}>
              <div style={{ fontSize:52, marginBottom:16 }}>✓</div>
              <h3 style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:28, color:"#ffffff", marginBottom:8 }}>Message sent!</h3>
              <p style={{ fontSize:15, color:"rgba(255,255,255,0.4)", fontFamily:FONT }}>We'll get back to you within 24 hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { key:"name", label:"Name", ph:"Aadit Patadia", type:"text" },
                { key:"email", label:"Email", ph:"you@example.com", type:"email" },
              ].map(({ key, label, ph, type }) => (
                <div key={key}>
                  <label style={{ display:"block", fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.4)", fontFamily:FONT, marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase" }}>{label}</label>
                  <input type={type} value={form[key]} onChange={set(key)} placeholder={ph} style={inp}
                    onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.25)"}
                    onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}/>
                </div>
              ))}
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.4)", fontFamily:FONT, marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase" }}>Message</label>
                <textarea value={form.message} onChange={set("message")} placeholder="What's on your mind?" rows={5}
                  style={{ ...inp, resize:"vertical" }}
                  onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.25)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}/>
              </div>
              <motion.button type="submit" whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                style={{ padding:"16px 0", borderRadius:100, border:"none", cursor:"pointer", fontFamily:FONT, fontSize:15, fontWeight:700, background:GRAD, color:"#000000", marginTop:4 }}>
                Send message →
              </motion.button>
            </form>
          )}
        </FadeUp>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  const navigate = useNavigate();
  return (
    <footer style={{ background:"#000000", borderTop:"1px solid rgba(255,255,255,0.06)", padding:"52px 24px 64px" }}>
      <div style={{ maxWidth:900, margin:"0 auto", display:"flex", flexDirection:"column", alignItems:"center", gap:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:22, color:"rgba(255,255,255,0.7)" }}>Corex</span>
          <span style={{ fontSize:12, fontFamily:FONT, color:"rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize:12, fontFamily:FONT, color:"rgba(255,255,255,0.25)" }}>The Creative Operating System</span>
        </div>
        <div style={{ display:"flex", gap:24, flexWrap:"wrap", justifyContent:"center" }}>
          {[
            { label:"Features", id:"features" },
            { label:"How it works", id:"how-it-works" },
            { label:"Pricing", action:() => navigate("/app/payment") },
            { label:"Contact", id:"contact" },
          ].map(item => (
            <button key={item.label}
              onClick={() => item.action ? item.action() : document.getElementById(item.id)?.scrollIntoView({ behavior:"smooth" })}
              style={{ background:"none", border:"none", cursor:"pointer", fontFamily:FONT, fontSize:13, color:"rgba(255,255,255,0.3)", padding:0, transition:"color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color="rgba(255,255,255,0.7)"}
              onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.3)"}
            >{item.label}</button>
          ))}
        </div>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.15)", fontFamily:FONT, textAlign:"center" }}>
          © 2026 Corex · corexnt.com · Built for the world's creative minds
        </p>
      </div>
    </footer>
  );
}

/* ── Root ── */
export default function MainLanding() {
  return (
    <div style={{ background:"#000000", minHeight:"100vh", overflowX:"hidden" }}>
      <Navbar />
      <Hero />
      <LogoBar />
      <Philosophy />
      <Features />
      <HowItWorks />
      <Stats />
      <Pricing />
      <CTABanner />
      <Contact />
      <Footer />
    </div>
  );
}
