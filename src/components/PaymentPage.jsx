import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FONT = "'Instrument Sans', sans-serif";

/* ── Waitlist modal ── */
function WaitlistModal({ plan, onClose }) {
  const [email,     setEmail]     = useState(localStorage.getItem("userEmail") || "");
  const [submitted, setSubmitted] = useState(false);

  const config = {
    spark:             { icon:"⚡", name:"SPARK",            accent:"#60a5fa", bg:"rgba(37,99,235,0.1)",    border:"rgba(37,99,235,0.3)" },
    nineteen_twentys:  { icon:"✦", name:"NINETEEN TWENTYS", accent:"#c9a84c", bg:"rgba(201,168,76,0.1)",   border:"rgba(201,168,76,0.35)" },
    canvas_enterprise: { icon:"◈", name:"CANVAS ENTERPRISE",accent:"#a78bfa", bg:"rgba(124,58,237,0.1)",  border:"rgba(124,58,237,0.3)" },
  };
  const c = config[plan] || config.spark;

  function handleSubmit(e) {
    e.preventDefault();
    if (email.trim()) {
      localStorage.setItem("corex_waitlist_email", email.trim());
    }
    setSubmitted(true);
  }

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale:0.92, opacity:0, y:16 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.92, opacity:0 }}
        transition={{ type:"spring", stiffness:400, damping:28 }}
        style={{ background:"#0e0e14", border:`1px solid ${c.border}`, borderRadius:28, padding:"40px 36px", maxWidth:400, width:"100%", textAlign:"center" }}
      >
        <div style={{ width:52, height:52, borderRadius:"50%", background:c.bg, border:`1px solid ${c.border}`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:20 }}>
          {c.icon}
        </div>

        {!submitted ? (
          <>
            <h3 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:26, color:"#ffffff", marginBottom:8 }}>
              Join the waitlist
            </h3>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", fontFamily:FONT, lineHeight:1.6, marginBottom:8 }}>
              <span style={{ color:c.accent, fontWeight:600 }}>{c.name}</span> is coming soon.
            </p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", fontFamily:FONT, marginBottom:28 }}>
              Drop your email and we'll reach out the moment payments go live.
            </p>
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <input
                type="email" required autoFocus
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  padding:"13px 18px", borderRadius:100, border:"1px solid rgba(255,255,255,0.12)",
                  background:"rgba(255,255,255,0.05)", color:"#ffffff", fontFamily:FONT, fontSize:14, outline:"none",
                  caretColor: c.accent,
                }}
                onFocus={e => e.currentTarget.style.borderColor = c.accent + "60"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
              />
              <motion.button
                type="submit" whileHover={{ translateY:-1 }} whileTap={{ scale:0.97 }}
                style={{ padding:"14px 0", borderRadius:100, border:"none", background:c.accent === "#c9a84c" ? "linear-gradient(90deg,#c9a84c,#f0c040)" : c.accent, color: c.accent === "#c9a84c" ? "#0a0a0a" : "#ffffff", fontFamily:FONT, fontWeight:700, fontSize:15, cursor:"pointer" }}
              >
                Notify me
              </motion.button>
              <button type="button" onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"rgba(255,255,255,0.3)", fontFamily:FONT }}>
                Cancel
              </button>
            </form>
          </>
        ) : (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}>
            <div style={{ fontSize:40, marginBottom:16 }}>🎉</div>
            <h3 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:24, color:"#ffffff", marginBottom:8 }}>
              You're on the list!
            </h3>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", fontFamily:FONT, lineHeight:1.6, marginBottom:28 }}>
              We'll email you at <span style={{ color:c.accent }}>{email}</span> the moment {c.name} opens for purchase.
            </p>
            <button onClick={onClose} style={{ padding:"13px 32px", borderRadius:100, border:"none", background:c.accent === "#c9a84c" ? "linear-gradient(90deg,#c9a84c,#f0c040)" : c.accent, color: c.accent === "#c9a84c" ? "#0a0a0a" : "#ffffff", fontFamily:FONT, fontWeight:700, fontSize:14, cursor:"pointer" }}>
              Back to plans
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Social proof marquee ── */
const MARQUEE_ITEMS = [
  "A designer in Mumbai joined the waitlist",
  "Founder in Bangalore — early access",
  "Content director in Delhi on the list",
  "Growth lead in Chennai waiting",
  "Agency in Pune — early access",
  "Creator in Hyderabad signed up",
  "Brand strategist in Kolkata waiting",
  "Filmmaker in Goa on the list",
];

function Marquee() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{ overflow:"hidden", width:"100%", padding:"16px 0", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", marginBottom:64 }}>
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontFamily:FONT, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:10, marginRight:48 }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:"rgba(201,168,76,0.5)", display:"inline-block", flexShrink:0 }}/>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Feature row ── */
function Feature({ text, included, color }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8 }}>
      <span style={{ fontSize:12, flexShrink:0, marginTop:2, color: included ? color : "rgba(255,255,255,0.18)" }}>
        {included ? "✓" : "✗"}
      </span>
      <span style={{ fontSize:13, color: included ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.18)", fontFamily:FONT, lineHeight:1.5 }}>
        {text}
      </span>
    </div>
  );
}

/* ── FAQ accordion item ── */
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width:"100%", textAlign:"left", padding:"18px 0",
          display:"flex", justifyContent:"space-between", alignItems:"center", gap:16,
          background:"none", border:"none", cursor:"pointer",
          fontFamily:FONT, fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.85)",
        }}
      >
        {q}
        <span style={{ fontSize:18, color:"#c9a84c", flexShrink:0, transition:"transform 0.25s", transform:open?"rotate(45deg)":"none" }}>+</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
            transition={{ duration:0.25, ease:[0.4,0,0.2,1] }}
            style={{ overflow:"hidden" }}
          >
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", fontFamily:FONT, lineHeight:1.7, paddingBottom:18, margin:0 }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════ MAIN ═══════ */
export default function PaymentPage() {
  const navigate = useNavigate();
  const [billing,     setBilling]     = useState("annual");
  const [waitlistFor, setWaitlistFor] = useState(null);

  const ann = billing === "annual";

  return (
    <div style={{ minHeight:"100vh", background:"#080810", backgroundImage:`radial-gradient(ellipse at 20% 30%, rgba(26,122,60,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(124,58,237,0.05) 0%, transparent 50%)`, overflowX:"hidden", fontFamily:FONT }}>
      <AnimatePresence>
        {waitlistFor && <WaitlistModal key={waitlistFor} plan={waitlistFor} onClose={() => setWaitlistFor(null)}/>}
      </AnimatePresence>

      {/* Back nav */}
      <div style={{ padding:"24px 24px 0", maxWidth:1100, margin:"0 auto" }}>
        <button onClick={() => navigate(-1)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:14, fontFamily:FONT }}>
          ← Back
        </button>
      </div>

      {/* Hero */}
      <div style={{ textAlign:"center", paddingTop:56, paddingBottom:48, paddingLeft:24, paddingRight:24 }}>
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 18px", borderRadius:100, background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.28)", marginBottom:24 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#c9a84c", animation:"livePulse 2s infinite", display:"inline-block" }}/>
          <span style={{ fontSize:12, fontWeight:600, color:"#c9a84c", letterSpacing:"0.5px", fontFamily:FONT }}>Limited Early Access Pricing</span>
        </motion.div>

        <motion.h1 initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
          style={{ fontFamily:"'Instrument Serif', serif", fontSize:"clamp(32px, 6vw, 52px)", fontWeight:400, fontStyle:"italic", color:"#ffffff", lineHeight:1.1, marginBottom:16 }}>
          Choose your creative<br/>intelligence.
        </motion.h1>
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
          style={{ fontSize:16, color:"rgba(255,255,255,0.4)", marginBottom:32, fontFamily:FONT }}>
          From first idea to final output.
        </motion.p>

        {/* Billing toggle */}
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.12 }}
          style={{ display:"inline-flex", background:"rgba(255,255,255,0.05)", borderRadius:100, padding:4, gap:2, marginBottom:28 }}>
          {["monthly","annual"].map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{
              padding:"8px 22px", borderRadius:100, border:"none", cursor:"pointer",
              fontFamily:FONT, fontWeight:600, fontSize:13,
              background: billing===b ? "#ffffff" : "transparent",
              color: billing===b ? "#0a0a0a" : "rgba(255,255,255,0.45)",
              transition:"all 0.25s ease",
              display:"flex", alignItems:"center", gap:8,
            }}>
              {b === "monthly" ? "Monthly" : "Yearly"}
              {b === "annual" && <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100, background:"rgba(26,122,60,0.8)", color:"#fff" }}>Save 25%</span>}
            </button>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.18 }}
          style={{ fontSize:13, color:"rgba(255,255,255,0.3)", fontFamily:FONT }}>
          ★★★★★ &nbsp;Loved by early users · Payments opening soon
        </motion.p>
      </div>

      {/* Cards grid */}
      <div style={{ maxWidth:1060, margin:"0 auto", padding:"0 24px 80px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:24, alignItems:"start" }}>

          {/* ─ SPARK ─ */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:24, padding:"32px 28px", position:"relative" }}>
            <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(37,99,235,0.12)", border:"1px solid rgba(37,99,235,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:16 }}>⚡</div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, color:"#60a5fa", marginBottom:10 }}>SPARK</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
              <span style={{ fontSize:44, fontWeight:700, color:"#ffffff", lineHeight:1 }}>{ann ? "₹249" : "₹399"}</span>
              {ann && <span style={{ fontSize:14, color:"rgba(255,255,255,0.25)", textDecoration:"line-through" }}>₹399</span>}
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>/mo</span>
            </div>
            <p style={{ fontSize:12, color:"#60a5fa", fontStyle:"italic", marginBottom:4 }}>just {ann?"₹8":"₹13"}/day</p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:20, lineHeight:1.5 }}>For creatives exploring their first ideas</p>
            <div style={{ height:1, background:"rgba(255,255,255,0.06)", marginBottom:20 }}/>
            {[
              [true,  "Creative AI chat (15 msgs/day)"],
              [true,  "3 creative directions per question"],
              [true,  "5 creative modes"],
              [true,  "Structured outputs + PDF"],
              [true,  "2 file uploads/day"],
              [true,  "Live web search"],
              [false, "Flowcharts & Mindmaps"],
              [false, "Custom AI persona"],
              [false, "Team workspaces"],
            ].map(([inc, text], i) => <Feature key={i} included={inc} text={text} color="#60a5fa"/>)}
            <motion.button
              onClick={() => setWaitlistFor("spark")}
              whileHover={{ translateY:-1 }} whileTap={{ scale:0.97 }}
              style={{ width:"100%", marginTop:24, padding:"14px 0", borderRadius:100, border:"1.5px solid rgba(37,99,235,0.4)", background:"transparent", color:"#60a5fa", fontFamily:FONT, fontWeight:600, fontSize:14, cursor:"pointer", transition:"all 0.2s ease" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(37,99,235,0.12)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
              Join Waitlist ⚡
            </motion.button>
          </motion.div>

          {/* ─ NINETEEN TWENTYS ─ */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            style={{ background:"linear-gradient(135deg,rgba(201,168,76,0.1) 0%,rgba(240,192,64,0.04) 100%)", border:"1.5px solid rgba(201,168,76,0.38)", borderRadius:24, padding:"36px 28px 32px", position:"relative", transform:"translateY(-4px)" }}>
            <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,#c9a84c,#f0c040)", color:"#0a0a0a", fontFamily:FONT, fontWeight:700, fontSize:11, padding:"5px 20px", borderRadius:100, whiteSpace:"nowrap", letterSpacing:"0.5px" }}>✦ Most Popular</div>
            <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:"#c9a84c", marginBottom:16 }}>✦</div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, color:"#c9a84c", marginBottom:10 }}>NINETEEN TWENTYS</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
              <span style={{ fontSize:44, fontWeight:700, color:"#c9a84c", lineHeight:1 }}>{ann?"₹1,649":"₹2,199"}</span>
              {ann && <span style={{ fontSize:14, color:"rgba(201,168,76,0.35)", textDecoration:"line-through" }}>₹2,199</span>}
              <span style={{ fontSize:13, color:"rgba(201,168,76,0.5)" }}>/mo</span>
            </div>
            <p style={{ fontSize:12, color:"#c9a84c", fontStyle:"italic", marginBottom:2 }}>just {ann?"₹55":"₹73"}/day</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginBottom:16 }}>Less than a coffee ☕</p>
            <p style={{ fontSize:13, color:"rgba(245,240,232,0.55)", marginBottom:20, lineHeight:1.5 }}>The serious creative's operating system</p>
            <div style={{ height:1, background:"rgba(201,168,76,0.15)", marginBottom:20 }}/>
            {[
              "Everything in SPARK, plus:",
              "60 messages/day — GPT-4o",
              "Flowchart generation",
              "Mindmap generation",
              "Custom AI persona",
              "5 team workspaces",
              "1 year history",
              "Priority support",
            ].map((text, i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
                <span style={{ color:"#c9a84c", flexShrink:0, fontSize:12, marginTop:2 }}>✦</span>
                <span style={{ fontSize:13, color:i===0?"#c9a84c":"rgba(245,240,232,0.72)", fontFamily:FONT, lineHeight:1.5, fontWeight:i===0?700:400 }}>{text}</span>
              </div>
            ))}
            <motion.button
              onClick={() => setWaitlistFor("nineteen_twentys")}
              whileHover={{ translateY:-2 }} whileTap={{ scale:0.97 }}
              style={{ width:"100%", marginTop:24, padding:"16px 0", borderRadius:100, border:"none", background:"linear-gradient(90deg,#c9a84c,#f0c040)", color:"#0a0a0a", fontFamily:FONT, fontWeight:700, fontSize:15, cursor:"pointer", transition:"all 0.2s ease" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 28px rgba(201,168,76,0.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
              Join Waitlist ✦
            </motion.button>
          </motion.div>

          {/* ─ CANVAS ENTERPRISE ─ */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            style={{ background:"rgba(124,58,237,0.05)", border:"1px solid rgba(124,58,237,0.22)", borderRadius:24, padding:"32px 28px", position:"relative" }}>
            <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:"#a78bfa", marginBottom:16 }}>◈</div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, color:"#a78bfa", marginBottom:10 }}>CANVAS ENTERPRISE</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
              <span style={{ fontSize:44, fontWeight:700, color:"#ffffff", lineHeight:1 }}>{ann?"₹3,749":"₹4,999"}</span>
              {ann && <span style={{ fontSize:14, color:"rgba(255,255,255,0.22)", textDecoration:"line-through" }}>₹4,999</span>}
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>/seat/mo</span>
            </div>
            <p style={{ fontSize:12, color:"#a78bfa", fontStyle:"italic", marginBottom:2 }}>Min 3 seats</p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:20, lineHeight:1.5 }}>Full creative intelligence for teams</p>
            <div style={{ height:1, background:"rgba(124,58,237,0.15)", marginBottom:20 }}/>
            {[
              "Everything in NINETEEN TWENTYS",
              "Unlimited team seats",
              "Full visual creative canvas",
              "Brand knowledge base",
              "API access",
              "Dedicated account manager",
              "4hr SLA support",
            ].map((text, i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
                <span style={{ color:"#a78bfa", flexShrink:0, fontSize:12, marginTop:2 }}>◈</span>
                <span style={{ fontSize:13, color:i===0?"#a78bfa":"rgba(255,255,255,0.68)", fontFamily:FONT, lineHeight:1.5, fontWeight:i===0?600:400 }}>{text}</span>
              </div>
            ))}
            <motion.button
              onClick={() => setWaitlistFor("canvas_enterprise")}
              whileHover={{ translateY:-1 }} whileTap={{ scale:0.97 }}
              style={{ width:"100%", marginTop:24, padding:"14px 0", borderRadius:100, border:"1.5px solid rgba(124,58,237,0.4)", background:"transparent", color:"#a78bfa", fontFamily:FONT, fontWeight:600, fontSize:14, cursor:"pointer", transition:"all 0.2s ease" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(124,58,237,0.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
              Request Access ◈
            </motion.button>
          </motion.div>
        </div>
        <p style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.18)", marginTop:24, fontFamily:FONT }}>
          All prices in INR · USD and GBP available at checkout · Cancel anytime
        </p>
      </div>

      {/* Marquee */}
      <Marquee/>

      {/* Feature comparison */}
      <div style={{ maxWidth:900, margin:"0 auto 80px", padding:"0 24px" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:28, fontWeight:400, color:"#ffffff", marginBottom:32 }}>Full feature comparison</h2>
        <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", background:"rgba(255,255,255,0.04)", padding:"14px 20px" }}>
            {["Feature","SPARK","NINETEEN TWENTYS","CANVAS"].map((h,i)=>(
              <span key={i} style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color:i===2?"#c9a84c":i===3?"#a78bfa":"rgba(255,255,255,0.4)", textAlign:i===0?"left":"center", fontFamily:FONT }}>{h}</span>
            ))}
          </div>
          {[
            ["AI chat messages/day","15","60","Unlimited"],
            ["AI model","GPT-4o Mini","GPT-4o","GPT-4o"],
            ["Flowcharts & Mindmaps","✗","✓","✓"],
            ["Visual workspace","✗","✓","✓"],
            ["Custom AI persona","✗","✓","✓"],
            ["Team workspaces","✗","5","Unlimited"],
            ["File uploads","2/day","20/day","Unlimited"],
            ["Conversation history","7 days","1 year","Forever"],
            ["PDF exports","✓","✓","✓"],
            ["API access","✗","✗","✓"],
            ["Dedicated support","✗","Email","4hr SLA"],
          ].map(([feat,s,n,c],i)=>(
            <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", padding:"12px 20px", background:i%2===0?"rgba(255,255,255,0.015)":"transparent", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)", fontFamily:FONT }}>{feat}</span>
              {[s,n,c].map((val,j)=>(
                <span key={j} style={{ textAlign:"center", fontSize:13, fontFamily:FONT, color: val==="✓"?(j===1?"#c9a84c":j===2?"#a78bfa":"#60a5fa"):val==="✗"?"rgba(255,255,255,0.18)":(j===1?"#c9a84c":j===2?"#a78bfa":"rgba(255,255,255,0.6)") }}>
                  {val}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth:720, margin:"0 auto 80px", padding:"0 24px" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:28, fontWeight:400, color:"#ffffff", marginBottom:40 }}>Common questions</h2>
        {[
          ["Can I switch plans later?","Yes. Upgrade or downgrade any time. Upgrades take effect immediately; downgrades at the end of your billing cycle."],
          ["What is Nineteen Twentys?","Our premium plan for serious creatives — GPT-4o, visual outputs (flowcharts, mindmaps), 60 messages/day. Named after the creative golden age."],
          ["Is there a free plan?","Yes, the free plan is yours indefinitely — no credit card required. 15 messages/day so you can experience COREX before committing."],
          ["When do payments go live?","We're onboarding early users now. Join the waitlist and you'll be the first to know — and get early-access pricing."],
          ["What is Canvas Enterprise?","Team-focused plan with unlimited seats, API access, brand knowledge base, and a dedicated account manager. Request access above."],
          ["Which AI model powers COREX?","SPARK uses GPT-4o Mini — fast for most creative tasks. Nineteen Twentys and Canvas Enterprise run full GPT-4o."],
        ].map(([q,a],i)=><FAQ key={i} q={q} a={a}/>)}
      </div>

      {/* Enterprise CTA */}
      <div style={{ maxWidth:680, margin:"0 auto 100px", padding:"0 24px" }}>
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ background:"rgba(124,58,237,0.07)", border:"1px solid rgba(124,58,237,0.22)", borderRadius:24, padding:"40px 36px", textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>◈</div>
          <h3 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:24, fontWeight:400, color:"#ffffff", marginBottom:8 }}>
            Interested in Canvas Enterprise?
          </h3>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", marginBottom:28, fontFamily:FONT, lineHeight:1.6 }}>
            Custom onboarding, team training, SLA support, white-label options, and dedicated account management.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <input
              type="email" placeholder="your@company.com"
              style={{ padding:"13px 20px", borderRadius:100, border:"1px solid rgba(124,58,237,0.35)", background:"rgba(124,58,237,0.07)", color:"#ffffff", fontFamily:FONT, fontSize:14, width:240, outline:"none", transition:"border-color 0.2s" }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(167,139,250,0.6)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)"}
            />
            <motion.button
              whileHover={{ translateY:-2 }} whileTap={{ scale:0.97 }}
              style={{ padding:"13px 28px", borderRadius:100, border:"none", background:"linear-gradient(90deg,#7c3aed,#a78bfa)", color:"#ffffff", fontFamily:FONT, fontWeight:700, fontSize:14, cursor:"pointer" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 28px rgba(124,58,237,0.35)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
              Book a Demo
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
