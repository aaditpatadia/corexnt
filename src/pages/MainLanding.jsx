import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";

function handleGetStarted(navigate) {
  const loggedIn = localStorage.getItem("isLoggedIn") === "true";
  const verified = localStorage.getItem("isVerified")  === "true";
  if (loggedIn && verified) navigate("/app/chat");
  else navigate("/app");
}

function FadeUp({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity:0, y:32 }} animate={inView ? { opacity:1, y:0 } : {}}
      transition={{ duration:0.65, delay, ease:[0.16,1,0.3,1] }}>
      {children}
    </motion.div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Home");
  const [scrolled, setScrolled] = useState(false);
  const items = ["Home", "Features", "Pricing", "Contact"];

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleNav = (item) => {
    setActive(item);
    if (item === "Home") window.scrollTo({ top:0, behavior:"smooth" });
    else if (item === "Features") document.getElementById("features")?.scrollIntoView({ behavior:"smooth" });
    else if (item === "Contact") document.getElementById("contact")?.scrollIntoView({ behavior:"smooth" });
    else if (item === "Pricing") navigate("/app/payment");
  };

  return (
    <>
      <style>{`@media (max-width: 560px) { .corex-nav-link { display: none !important; } }`}</style>
      {/* Outer full-width container handles centering — no transform conflict with Framer Motion */}
      <div style={{ position:"fixed", top:20, left:0, right:0, zIndex:50, display:"flex", justifyContent:"center", pointerEvents:"none" }}>
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
        style={{
          pointerEvents:"auto",
          display:"inline-flex", alignItems:"center", gap:2,
          padding:"6px",
          background: scrolled ? "rgba(20,20,20,0.95)" : "#222222",
          borderRadius:100,
          boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.7)" : "0 4px 24px rgba(0,0,0,0.5)",
          backdropFilter:"blur(20px)",
          border:"1px solid rgba(255,255,255,0.06)",
          transition:"background 0.3s ease, box-shadow 0.3s ease",
          maxWidth: "calc(100vw - 32px)",
        }}>
        {items.map((item) => (
          <button key={item} onClick={() => handleNav(item)}
            className="corex-nav-link"
            style={{
              padding:"8px 16px", borderRadius:100, border:"none", cursor:"pointer",
              fontSize:14, fontWeight:active===item?600:400,
              fontFamily:"'Instrument Sans', sans-serif",
              background: active===item ? "rgba(255,255,255,0.15)" : "transparent",
              color: active===item ? "#ffffff" : "rgba(255,255,255,0.6)",
              whiteSpace: "nowrap",
              transition:"all 0.2s ease",
            }}
            onMouseEnter={e=>{ if(active!==item){ e.currentTarget.style.color="#ffffff"; e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}}
            onMouseLeave={e=>{ if(active!==item){ e.currentTarget.style.color="rgba(255,255,255,0.6)"; e.currentTarget.style.background="transparent"; }}}>
            {item}
          </button>
        ))}
        <motion.button
          onClick={() => handleGetStarted(navigate)}
          whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          style={{
            padding:"9px 20px", borderRadius:100, border:"none", cursor:"pointer",
            background:"linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
            color:"#000000", fontSize:14, fontWeight:700,
            fontFamily:"'Instrument Sans', sans-serif",
            whiteSpace:"nowrap",
            transition:"opacity 0.2s",
          }}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.88"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          Launch →
        </motion.button>
      </motion.div>
      </div>
    </>
  );
}

/* ─── Hero ─── */
function Hero() {
  const navigate = useNavigate();
  return (
    <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"140px 24px 100px", textAlign:"center", background:"#000000", position:"relative", overflow:"hidden" }}>
      {/* Background glow */}
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translateX(-50%)", width:600, height:400, background:"radial-gradient(ellipse, rgba(107,195,206,0.06) 0%, transparent 70%)", pointerEvents:"none" }}/>

      <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
        className="hero-section-inner"
        style={{ display:"flex", flexDirection:"column", alignItems:"center", zIndex:10, position:"relative" }}>

        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.5, delay:0.1 }}
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", borderRadius:100, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", fontSize:13, color:"rgba(255,255,255,0.6)", fontFamily:"'Instrument Sans', sans-serif", marginBottom:48 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#9CFCAF", display:"inline-block", animation:"pulse 2s ease-in-out infinite" }}/>
          Now in Beta — Free to try
        </motion.div>

        <h1 style={{ fontFamily:"'Instrument Sans', sans-serif", fontWeight:800, fontSize:"clamp(52px,9vw,100px)", color:"#ffffff", letterSpacing:"-3px", lineHeight:0.95, margin:0 }}>
          The Creative OS
        </h1>
        <h2 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontWeight:400, fontSize:"clamp(44px,8vw,92px)", color:"#ffffff", lineHeight:1.05, margin:"8px 0 0", letterSpacing:"-1px" }}>
          for what you're building.
        </h2>

        <p style={{ marginTop:28, fontSize:17, color:"rgba(255,255,255,0.5)", fontFamily:"'Instrument Sans', sans-serif", maxWidth:520, lineHeight:1.65 }}>
          Not a chatbot. A system. The first Creative Operating System built for brands, creators, and founders who move fast.
        </p>

        <motion.button onClick={() => handleGetStarted(navigate)}
          whileHover={{ scale:1.03, boxShadow:"0 20px 60px rgba(107,195,206,0.2)" }}
          whileTap={{ scale:0.97 }}
          transition={{ duration:0.2 }}
          style={{ marginTop:44, display:"inline-flex", alignItems:"center", gap:14, padding:"18px 18px 18px 36px", borderRadius:100, border:"none", cursor:"pointer", background:"linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)", fontSize:18, fontWeight:700, color:"#000000", fontFamily:"'Instrument Sans', sans-serif" }}>
          Let's Create
          <span style={{ width:40, height:40, background:"#000000", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </motion.button>

        <p style={{ marginTop:16, fontSize:13, color:"rgba(255,255,255,0.25)", fontFamily:"'Instrument Sans', sans-serif" }}>
          5 free projects · No credit card required
        </p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}
        style={{ position:"absolute", bottom:40, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:12, color:"rgba(255,255,255,0.2)", fontFamily:"'Instrument Sans', sans-serif", letterSpacing:"2px", textTransform:"uppercase" }}>Scroll</span>
        <motion.div animate={{ y:[0,6,0] }} transition={{ duration:1.5, repeat:Infinity, ease:"easeInOut" }}
          style={{ width:1, height:32, background:"linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)" }}/>
      </motion.div>

      {/* Floating hero image cards */}
      <div
        className="hero-card"
        style={{
          position: "absolute", left: "4%", top: "28%", width: 280, zIndex: 2,
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
          animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both",
        }}
      >
        <img
          src="/images/hero1.png"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => { if (e.currentTarget.parentElement) e.currentTarget.parentElement.style.display = "none"; }}
        />
      </div>
      <div
        className="hero-card"
        style={{
          position: "absolute", right: "4%", bottom: "18%", width: 300, zIndex: 2,
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
          animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both",
        }}
      >
        <img
          src="/images/hero2.png"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => { if (e.currentTarget.parentElement) e.currentTarget.parentElement.style.display = "none"; }}
        />
      </div>
    </section>
  );
}

/* ─── Philosophy ─── */
function Philosophy() {
  return (
    <section style={{ background:"#000000", padding:"0 24px 120px", display:"flex", justifyContent:"center" }}>
      <FadeUp>
        <div style={{ maxWidth:900, width:"100%", background:"linear-gradient(135deg, #0a1520 0%, #050a0d 50%, #0a0d1a 100%)", borderRadius:28, padding:"80px 60px", border:"1px solid rgba(255,255,255,0.06)", textAlign:"center" }}>
          <p style={{ fontSize:13, fontWeight:600, letterSpacing:"3px", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", fontFamily:"'Instrument Sans', sans-serif", marginBottom:24 }}>
            The COREX Philosophy
          </p>
          <p style={{ fontSize:24, lineHeight:1.65, color:"rgba(255,255,255,0.7)", fontFamily:"'Instrument Sans', sans-serif", fontWeight:400 }}>
            The true sign of intelligence is not knowledge but{" "}
            <em style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", color:"#ffffff", fontSize:26 }}>Imagination.</em>
          </p>
          <p style={{ marginTop:20, fontSize:15, color:"rgba(255,255,255,0.35)", fontFamily:"'Instrument Sans', sans-serif" }}>
            COREX is trained on marketing, advertising, branding, design, and creativity — and nothing else.
          </p>
        </div>
      </FadeUp>
    </section>
  );
}

/* ─── Features ─── */
const FEATURES = [
  {
    icon: "⚡",
    title: "Instant Strategy",
    desc: "Get campaign briefs, brand frameworks, and growth roadmaps in seconds — not hours. COREX thinks like a senior CMO.",
    grad: "rgba(34,111,247,0.08)",
    border: "rgba(34,111,247,0.2)",
  },
  {
    icon: "🎯",
    title: "Competitor Intelligence",
    desc: "Live web search to surface exactly what your competitors are doing RIGHT NOW — ads, influencer moves, pricing, campaigns.",
    grad: "rgba(107,195,206,0.08)",
    border: "rgba(107,195,206,0.2)",
  },
  {
    icon: "🚀",
    title: "Execution Playbooks",
    desc: "Not just ideas — step-by-step execution plans with real deadlines, budgets in rupees, and named influencers.",
    grad: "rgba(156,252,175,0.08)",
    border: "rgba(156,252,175,0.2)",
  },
  {
    icon: "📈",
    title: "Creator Growth Engine",
    desc: "Reel scripts, brand deal pricing, niche benchmarking, and monetisation roadmaps built for Indian creators.",
    grad: "rgba(255,234,113,0.08)",
    border: "rgba(255,234,113,0.2)",
  },
  {
    icon: "🧠",
    title: "Creative Modes",
    desc: "Switch between Strategist, Storyteller, Designer, and Founder modes — COREX adapts its thinking to yours.",
    grad: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.2)",
  },
  {
    icon: "📊",
    title: "Visual Intelligence",
    desc: "Every data-heavy response auto-generates charts. Download as PDF. Share as reports. Impress every room.",
    grad: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.2)",
  },
];

function Features() {
  return (
    <section id="features" style={{ background:"#000000", padding:"80px 24px 120px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <FadeUp>
          <div style={{ textAlign:"center", marginBottom:72 }}>
            <p style={{ fontSize:12, fontWeight:600, letterSpacing:"3px", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", fontFamily:"'Instrument Sans', sans-serif", marginBottom:16 }}>
              What COREX does
            </p>
            <h2 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:"clamp(36px,5vw,64px)", fontWeight:400, color:"#ffffff", margin:0, lineHeight:1.1 }}>
              Built different.
            </h2>
            <p style={{ marginTop:16, fontSize:17, color:"rgba(255,255,255,0.4)", fontFamily:"'Instrument Sans', sans-serif", maxWidth:480, margin:"16px auto 0" }}>
              Every feature is designed for one thing — turning your creative intent into execution.
            </p>
          </div>
        </FadeUp>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px,1fr))", gap:20 }}>
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.08}>
              <motion.div whileHover={{ y:-4, borderColor:f.border }}
                style={{ padding:32, borderRadius:24, background:f.grad, border:`1px solid ${f.border.replace("0.2","0.12")}`, transition:"all 0.25s ease", height:"100%" }}>
                <div style={{ fontSize:36, marginBottom:20 }}>{f.icon}</div>
                <h3 style={{ fontFamily:"'Instrument Sans', sans-serif", fontWeight:700, fontSize:19, color:"#ffffff", marginBottom:10 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", fontFamily:"'Instrument Sans', sans-serif", lineHeight:1.65 }}>
                  {f.desc}
                </p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Social Proof ─── */
function SocialProof() {
  const stats = [
    { value:"10K+", label:"Creative sessions" },
    { value:"4.9★", label:"User rating" },
    { value:"3s", label:"Average response time" },
    { value:"India-first", label:"Built for Indian market" },
  ];
  return (
    <section style={{ background:"#000000", padding:"0 24px 120px" }}>
      <FadeUp>
        <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:1, borderRadius:24, overflow:"hidden", border:"1px solid rgba(255,255,255,0.06)" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding:"40px 32px", textAlign:"center", background:"rgba(255,255,255,0.03)", borderRight: i < stats.length-1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <p style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:40, fontWeight:400, color:"#ffffff", margin:"0 0 8px" }}>{s.value}</p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", fontFamily:"'Instrument Sans', sans-serif" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

/* ─── CTA Banner ─── */
function CTABanner() {
  const navigate = useNavigate();
  return (
    <section style={{ background:"#000000", padding:"0 24px 120px" }}>
      <FadeUp>
        <div style={{ maxWidth:900, margin:"0 auto", background:"linear-gradient(135deg, #226FF7 0%, #6BC3CE 40%, #9CFCAF 70%, #FFEA71 100%)", borderRadius:28, padding:"80px 60px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.15)", borderRadius:28, pointerEvents:"none" }}/>
          <div style={{ position:"relative", zIndex:1 }}>
            <h2 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:"clamp(32px,5vw,56px)", fontWeight:400, color:"#000000", margin:"0 0 16px", lineHeight:1.1 }}>
              Ready to create?
            </h2>
            <p style={{ fontSize:17, color:"rgba(0,0,0,0.6)", fontFamily:"'Instrument Sans', sans-serif", marginBottom:36 }}>
              5 free projects. No card. No nonsense.
            </p>
            <motion.button onClick={() => handleGetStarted(navigate)}
              whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              style={{ display:"inline-flex", alignItems:"center", gap:12, padding:"16px 16px 16px 32px", borderRadius:100, border:"none", cursor:"pointer", background:"#000000", color:"#ffffff", fontSize:17, fontWeight:700, fontFamily:"'Instrument Sans', sans-serif" }}>
              Start for free
              <span style={{ width:38, height:38, background:"rgba(255,255,255,0.12)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </motion.button>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

/* ─── Contact ─── */
function Contact() {
  const [form, setForm] = useState({ name:"", email:"", message:"" });
  const [sent, setSent] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    const subject = encodeURIComponent(`COREX — Message from ${form.name}`);
    const body    = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`);
    window.location.href = `mailto:corexnt@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section id="contact" style={{ background:"#000000", padding:"80px 24px 120px" }}>
      <div style={{ maxWidth:640, margin:"0 auto" }}>
        <FadeUp>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <p style={{ fontSize:12, fontWeight:600, letterSpacing:"3px", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", fontFamily:"'Instrument Sans', sans-serif", marginBottom:16 }}>Get in touch</p>
            <h2 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:"clamp(32px,5vw,56px)", fontWeight:400, color:"#ffffff", margin:"0 0 16px" }}>
              Let's talk.
            </h2>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.4)", fontFamily:"'Instrument Sans', sans-serif" }}>
              Questions, partnerships, or just want to say hi — we're at{" "}
              <a href="mailto:corexnt@gmail.com" style={{ color:"rgba(255,255,255,0.7)", textDecoration:"none" }}>corexnt@gmail.com</a>
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          {sent ? (
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
              style={{ textAlign:"center", padding:"60px 40px", borderRadius:24, background:"rgba(156,252,175,0.06)", border:"1px solid rgba(156,252,175,0.15)" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>✓</div>
              <h3 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:28, color:"#ffffff", marginBottom:8 }}>Message sent!</h3>
              <p style={{ fontSize:15, color:"rgba(255,255,255,0.4)", fontFamily:"'Instrument Sans', sans-serif" }}>We'll get back to you within 24 hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                { key:"name", label:"Name", placeholder:"Aadit Patadia", type:"text" },
                { key:"email", label:"Email", placeholder:"you@example.com", type:"email" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ display:"block", fontSize:13, color:"rgba(255,255,255,0.5)", fontFamily:"'Instrument Sans', sans-serif", marginBottom:8 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
                    style={{ width:"100%", padding:"14px 16px", borderRadius:14, border:"1.5px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#ffffff", fontSize:15, fontFamily:"'Instrument Sans', sans-serif", outline:"none", transition:"border-color 0.2s", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.35)"}
                    onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
                </div>
              ))}
              <div>
                <label style={{ display:"block", fontSize:13, color:"rgba(255,255,255,0.5)", fontFamily:"'Instrument Sans', sans-serif", marginBottom:8 }}>Message</label>
                <textarea value={form.message} onChange={set("message")} placeholder="What's on your mind?" rows={5}
                  style={{ width:"100%", padding:"14px 16px", borderRadius:14, border:"1.5px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#ffffff", fontSize:15, fontFamily:"'Instrument Sans', sans-serif", outline:"none", resize:"vertical", transition:"border-color 0.2s", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.35)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
              <motion.button type="submit" whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                style={{ padding:"15px 0", borderRadius:100, border:"none", cursor:"pointer", fontFamily:"'Instrument Sans', sans-serif", fontSize:15, fontWeight:700, background:"linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)", color:"#000000" }}>
                Send message →
              </motion.button>
            </form>
          )}
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer style={{ background:"#000000", padding:"40px 24px 60px", borderTop:"1px solid rgba(255,255,255,0.06)", textAlign:"center" }}>
      <p style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:20, color:"rgba(255,255,255,0.4)", marginBottom:8 }}>Corex</p>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.2)", fontFamily:"'Instrument Sans', sans-serif" }}>
        The Creative Operating System · © 2026 Corex
      </p>
    </footer>
  );
}

/* ─── Main ─── */
export default function MainLanding() {
  return (
    <div style={{ background:"#000000", minHeight:"100vh", overflowX:"hidden" }}>
      <Navbar />
      <Hero />
      <Philosophy />
      <Features />
      <SocialProof />
      <CTABanner />
      <Contact />
      <Footer />
    </div>
  );
}
