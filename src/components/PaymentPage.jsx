import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { applyTheme, getPlanTheme } from "../utils/planTheme";

/* ── Toast helper ── */
function PlanToast({ plan }) {
  const config = {
    spark:             { icon:"⚡", label:"SPARK activated!",           bg:"#2563eb", color:"#fff" },
    nineteen_twentys:  { icon:"✦", label:"Nineteen Twentys unlocked",   bg:"linear-gradient(90deg,#c9a84c,#f0c040)", color:"#0a0a0a" },
    canvas_enterprise: { icon:"◈", label:"Canvas Enterprise ready",     bg:"#7c3aed", color:"#fff" },
  };
  const c = config[plan] || config.spark;
  return (
    <motion.div
      initial={{ opacity:0, y:20, scale:0.9 }}
      animate={{ opacity:1, y:0, scale:1 }}
      exit={{ opacity:0, y:-10 }}
      transition={{ type:"spring", stiffness:500, damping:30 }}
      style={{
        position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)",
        padding:"12px 28px", borderRadius:100,
        background:c.bg, color:c.color,
        fontFamily:"Montserrat, sans-serif", fontWeight:600, fontSize:14,
        zIndex:9999, whiteSpace:"nowrap",
        boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
      }}
    >
      {c.icon} {c.label}
    </motion.div>
  );
}

/* ── Social proof marquee ── */
const MARQUEE_ITEMS = [
  "Aadit just upgraded to Nineteen Twentys",
  "A designer in Mumbai started SPARK",
  "Nineteen Twentys client — building campaigns",
  "A founder in Bangalore joined SPARK",
  "Canvas Enterprise — strategic launch live",
  "Content director in Delhi activated 1920s",
  "Growth lead in Chennai started SPARK",
  "Agency in Pune moved to Canvas Enterprise",
];

function Marquee() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{ overflow:"hidden", width:"100%", padding:"16px 0", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", marginBottom:64 }}>
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontFamily:"Montserrat, sans-serif", whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:10, marginRight:48 }}>
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
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:9 }}>
      <span style={{ fontSize:13, flexShrink:0, marginTop:1, color: included ? color : "rgba(255,255,255,0.2)" }}>
        {included ? "✓" : "✗"}
      </span>
      <span style={{ fontSize:13, color: included ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.2)", fontFamily:"Montserrat, sans-serif", lineHeight:1.5 }}>
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
          fontFamily:"Montserrat, sans-serif", fontSize:15, fontWeight:600,
          color:"rgba(255,255,255,0.85)",
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
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", fontFamily:"Montserrat, sans-serif", lineHeight:1.7, paddingBottom:18, margin:0 }}>
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
  const [billing, setBilling] = useState("annual");
  const [toastPlan, setToastPlan] = useState(null);

  const activatePlan = (planKey) => {
    localStorage.setItem("corex_plan", planKey);
    applyTheme(getPlanTheme(planKey));
    if (window.__corex_setTheme) window.__corex_setTheme(planKey);
    setToastPlan(planKey);
    setTimeout(() => {
      setToastPlan(null);
      navigate("/app/chat");
    }, 2800);
  };

  const ann = billing === "annual";

  return (
    <div style={{
      minHeight:"100vh",
      background:"#080810",
      backgroundImage:`radial-gradient(ellipse at 20% 30%, rgba(26,122,60,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(124,58,237,0.06) 0%, transparent 50%)`,
      overflowX:"hidden", fontFamily:"Montserrat, sans-serif",
    }}>
      <AnimatePresence>
        {toastPlan && <PlanToast key={toastPlan} plan={toastPlan}/>}
      </AnimatePresence>

      {/* Back nav */}
      <div style={{ padding:"24px 24px 0", maxWidth:1100, margin:"0 auto" }}>
        <button onClick={() => navigate(-1)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:14, fontFamily:"Montserrat, sans-serif" }}>
          ← Back
        </button>
      </div>

      {/* Hero */}
      <div style={{ textAlign:"center", paddingTop:56, paddingBottom:48, paddingLeft:24, paddingRight:24 }}>
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 18px", borderRadius:100, background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.3)", marginBottom:24 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#c9a84c", animation:"livePulse 2s infinite", display:"inline-block" }}/>
          <span style={{ fontSize:12, fontWeight:600, color:"#c9a84c", letterSpacing:"0.5px" }}>Limited Early Access Pricing</span>
        </motion.div>

        <motion.h1 initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
          style={{ fontSize:"clamp(32px, 6vw, 52px)", fontWeight:900, color:"#ffffff", lineHeight:1.1, marginBottom:16 }}>
          Choose your creative<br/>intelligence.
        </motion.h1>
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
          style={{ fontSize:16, color:"rgba(255,255,255,0.45)", marginBottom:32 }}>
          From first idea to final output.
        </motion.p>

        {/* Billing toggle */}
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.12 }}
          style={{ display:"inline-flex", background:"rgba(255,255,255,0.06)", borderRadius:100, padding:4, gap:2, marginBottom:28 }}>
          {["monthly","annual"].map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{
              padding:"8px 20px", borderRadius:100, border:"none", cursor:"pointer",
              fontFamily:"Montserrat, sans-serif", fontWeight:600, fontSize:13,
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
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.18 }}
          style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", gap:"12px 32px", fontSize:13, color:"rgba(255,255,255,0.35)" }}>
          <span>★★★★★ &nbsp;Loved by 500+ creatives</span>
          <span style={{ color:"rgba(255,255,255,0.15)" }}>|</span>
          <span>Nineteen Twentys — Active client</span>
          <span style={{ color:"rgba(255,255,255,0.15)" }}>|</span>
          <span>Powered by GPT-4o</span>
        </motion.div>
      </div>

      {/* Cards grid */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 80px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:24, alignItems:"start" }}>

          {/* ─ SPARK ─ */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="card"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, padding:"32px 28px", position:"relative" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(37,99,235,0.15)", border:"1px solid rgba(37,99,235,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:16 }}>⚡</div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:"#60a5fa", marginBottom:8 }}>SPARK</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
              <span style={{ fontSize:48, fontWeight:800, color:"#ffffff", lineHeight:1 }}>{ann ? "₹249" : "₹399"}</span>
              {ann && <span style={{ fontSize:15, color:"rgba(255,255,255,0.3)", textDecoration:"line-through" }}>₹399</span>}
              <span style={{ fontSize:14, color:"rgba(255,255,255,0.4)", marginLeft:2 }}>/month</span>
            </div>
            <div style={{ fontSize:12, color:"#60a5fa", fontStyle:"italic", marginBottom:6 }}>just {ann?"₹8":"₹13"}/day</div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:20, lineHeight:1.5 }}>For creatives exploring their first ideas</p>
            <div style={{ height:1, background:"rgba(255,255,255,0.06)", marginBottom:20 }}/>
            {[[true,"Creative AI chat (15 msgs/day)"],[true,"Idea branching (3 branches)"],[true,"5 Creative modes"],[true,"Basic structured outputs"],[true,"PDF downloads"],[true,"2 file uploads/day"],[true,"Web search on responses"],[false,"Flowcharts & Mindmaps"],[false,"Visual workspace"],[false,"Custom AI persona"],[false,"Team features"]]
              .map(([inc,text],i)=><Feature key={i} included={inc} text={text} color="#60a5fa"/>)}
            <button onClick={() => activatePlan("spark")} style={{ width:"100%", marginTop:24, padding:"14px 0", borderRadius:100, border:"1.5px solid rgba(37,99,235,0.5)", background:"transparent", color:"#60a5fa", fontFamily:"Montserrat, sans-serif", fontWeight:600, fontSize:15, cursor:"pointer", transition:"all 0.25s cubic-bezier(0.16,1,0.3,1)" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(37,99,235,0.15)";e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.transform="none";}}>
              Start with Spark
            </button>
          </motion.div>

          {/* ─ NINETEEN TWENTYS ─ */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="card"
            style={{ background:"linear-gradient(135deg,rgba(201,168,76,0.12) 0%,rgba(240,192,64,0.06) 50%,rgba(201,168,76,0.08) 100%)", border:"1.5px solid rgba(201,168,76,0.4)", borderRadius:24, padding:"32px 28px", position:"relative", animation:"goldShimmer 3s ease-in-out infinite" }}>
            <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,#c9a84c,#f0c040)", color:"#0a0a0a", fontFamily:"Montserrat, sans-serif", fontWeight:700, fontSize:11, padding:"5px 20px", borderRadius:100, whiteSpace:"nowrap" }}>✦ Most Popular</div>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(201,168,76,0.15)", border:"1px solid rgba(201,168,76,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:16 }}>✦</div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:"#c9a84c", marginBottom:8 }}>NINETEEN TWENTYS</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
              <span style={{ fontSize:48, fontWeight:800, color:"#c9a84c", lineHeight:1 }}>{ann?"₹1,649":"₹2,199"}</span>
              {ann && <span style={{ fontSize:15, color:"rgba(201,168,76,0.4)", textDecoration:"line-through" }}>₹2,199</span>}
              <span style={{ fontSize:14, color:"rgba(201,168,76,0.5)", marginLeft:2 }}>/month</span>
            </div>
            <div style={{ fontSize:12, color:"#c9a84c", fontStyle:"italic", marginBottom:3 }}>just {ann?"₹55":"₹73"}/day</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginBottom:14 }}>Less than a coffee ☕</div>
            <p style={{ fontSize:13, color:"rgba(245,240,232,0.6)", fontStyle:"italic", marginBottom:20, lineHeight:1.5 }}>The serious creative's operating system</p>
            <div style={{ height:1, background:"rgba(201,168,76,0.15)", marginBottom:20 }}/>
            {["Everything in SPARK, plus:","Unlimited messages (60/day)","GPT-4o — full intelligence","Flowchart generation (export PDF)","Mindmap generation (export PDF)","Visual workspace","Custom AI persona","5 team workspaces","1 year history","Priority response speed","Early access to features"]
              .map((text,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:9 }}>
                <span style={{ color:"#c9a84c", flexShrink:0, marginTop:1, fontSize:13 }}>✦</span>
                <span style={{ fontSize:13, color:i===0?"#c9a84c":"rgba(245,240,232,0.75)", fontFamily:"Montserrat, sans-serif", lineHeight:1.5, fontWeight:i===0?700:400 }}>{text}</span>
              </div>
            ))}
            <button onClick={() => activatePlan("nineteen_twentys")} style={{ width:"100%", marginTop:24, padding:"16px 0", borderRadius:100, border:"none", background:"linear-gradient(90deg,#c9a84c,#f0c040)", color:"#0a0a0a", fontFamily:"Montserrat, sans-serif", fontWeight:700, fontSize:15, cursor:"pointer", transition:"all 0.25s cubic-bezier(0.16,1,0.3,1)" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 30px rgba(201,168,76,0.35)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              Go Nineteen Twentys
            </button>
          </motion.div>

          {/* ─ CANVAS ENTERPRISE ─ */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="card"
            style={{ background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:24, padding:"32px 28px", position:"relative" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:16 }}>◈</div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:"#a78bfa", marginBottom:8 }}>CANVAS ENTERPRISE</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
              <span style={{ fontSize:48, fontWeight:800, color:"#ffffff", lineHeight:1 }}>{ann?"₹3,749":"₹4,999"}</span>
              {ann && <span style={{ fontSize:15, color:"rgba(255,255,255,0.3)", textDecoration:"line-through" }}>₹4,999</span>}
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginLeft:2 }}>/seat/month</span>
            </div>
            <div style={{ fontSize:12, color:"#a78bfa", fontStyle:"italic", marginBottom:3 }}>{ann?"₹125":"₹166"}/seat/day</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginBottom:14 }}>One hire costs 30× more</div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:20, lineHeight:1.5 }}>Full creative intelligence for teams. Min 3 seats.</p>
            <div style={{ height:1, background:"rgba(124,58,237,0.15)", marginBottom:20 }}/>
            {["Everything in NINETEEN TWENTYS, plus:","Unlimited team seats","Full visual creative canvas","Advanced flowchart engine","Presentation deck generation","Brand knowledge base (RAG)","API access","White label option","Dedicated account manager","SLA: 4hr support response","Custom onboarding"]
              .map((text,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:9 }}>
                <span style={{ color:"#a78bfa", flexShrink:0, marginTop:1, fontSize:13 }}>◈</span>
                <span style={{ fontSize:13, color:i===0?"#a78bfa":"rgba(255,255,255,0.7)", fontFamily:"Montserrat, sans-serif", lineHeight:1.5, fontWeight:i===0?700:400 }}>{text}</span>
              </div>
            ))}
            <button onClick={() => activatePlan("canvas_enterprise")} style={{ width:"100%", marginTop:24, padding:"14px 0", borderRadius:100, border:"1.5px solid rgba(124,58,237,0.5)", background:"transparent", color:"#a78bfa", fontFamily:"Montserrat, sans-serif", fontWeight:600, fontSize:15, cursor:"pointer", transition:"all 0.25s cubic-bezier(0.16,1,0.3,1)" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(124,58,237,0.1)";e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.transform="none";}}>
              Contact for Enterprise
            </button>
          </motion.div>
        </div>
        <p style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.2)", marginTop:24 }}>
          All prices in INR · USD and GBP available at checkout · Cancel anytime
        </p>
      </div>

      {/* Marquee */}
      <Marquee/>

      {/* Feature comparison */}
      <div style={{ maxWidth:900, margin:"0 auto 80px", padding:"0 24px" }}>
        <h2 style={{ textAlign:"center", fontSize:24, fontWeight:800, color:"#ffffff", marginBottom:32 }}>Full feature comparison</h2>
        <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", background:"rgba(255,255,255,0.04)", padding:"14px 20px" }}>
            {["Feature","SPARK","NINETEEN TWENTYS","CANVAS"].map((h,i)=>(
              <span key={i} style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color:i===2?"#c9a84c":"rgba(255,255,255,0.4)", textAlign:i===0?"left":"center" }}>{h}</span>
            ))}
          </div>
          {[
            ["AI chat messages/day","15","60","Unlimited"],
            ["AI model","GPT-4o Mini","GPT-4o","GPT-4o Heavy"],
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
            <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", padding:"12px 20px", background:i%2===0?"rgba(255,255,255,0.02)":"transparent", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.65)" }}>{feat}</span>
              {[s,n,c].map((val,j)=>(
                <span key={j} style={{ textAlign:"center", fontSize:13, color: val==="✓"?(j===1?"#c9a84c":j===2?"#a78bfa":"#60a5fa"):val==="✗"?"rgba(255,255,255,0.2)":(j===1?"#c9a84c":j===2?"#a78bfa":"rgba(255,255,255,0.65)") }}>
                  {val}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div style={{ maxWidth:720, margin:"0 auto 80px", padding:"0 24px" }}>
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"36px 40px" }}>
          <div style={{ fontSize:64, color:"#c9a84c", opacity:0.25, lineHeight:0.8, marginBottom:16, fontFamily:"Georgia, serif" }}>"</div>
          <p style={{ fontSize:18, fontStyle:"italic", color:"rgba(255,255,255,0.85)", lineHeight:1.7, marginBottom:20 }}>
            We built a full campaign strategy inside COREX in under 2 hours. It replaced a week of agency briefing work.
          </p>
          <div style={{ fontWeight:700, color:"#c9a84c", fontSize:14 }}>Nineteen Twentys</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:2 }}>Premium lifestyle brand — Active COREX client</div>
        </motion.div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth:720, margin:"0 auto 80px", padding:"0 24px" }}>
        <h2 style={{ textAlign:"center", fontSize:24, fontWeight:800, color:"#ffffff", marginBottom:40 }}>Common questions</h2>
        {[
          ["Can I switch plans later?","Yes. Upgrade or downgrade any time. Upgrades take effect immediately; downgrades at the end of your billing cycle."],
          ["What is Nineteen Twentys?","Our premium plan for serious creatives — GPT-4o, visual outputs (flowcharts, mindmaps), 60 messages/day. Named after the creative golden age."],
          ["Is there a free trial?","The free plan is yours indefinitely — no credit card required. 10 messages/day so you can experience COREX before committing."],
          ["How does billing work?","Monthly plans renew each month. Annual plans are billed once and save 25%. Both cancel any time from settings."],
          ["What is Canvas Enterprise?","Team-focused plan with unlimited seats, API access, brand knowledge base, and dedicated account manager. Contact us for volume pricing."],
          ["Which AI model powers COREX?","SPARK uses GPT-4o Mini — fast for most creative tasks. Nineteen Twentys and Canvas Enterprise run full GPT-4o for deeper strategic intelligence."],
        ].map(([q,a],i)=><FAQ key={i} q={q} a={a}/>)}
      </div>

      {/* Enterprise CTA */}
      <div style={{ maxWidth:720, margin:"0 auto 100px", padding:"0 24px" }}>
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:20, padding:40, textAlign:"center" }}>
          <h3 style={{ fontSize:22, fontWeight:800, color:"#ffffff", marginBottom:10 }}>Interested in Canvas Enterprise?</h3>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", marginBottom:28 }}>Custom onboarding, team training, SLA support and white label options.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <input type="email" placeholder="your@email.com" style={{ padding:"12px 20px", borderRadius:100, border:"1px solid rgba(124,58,237,0.4)", background:"rgba(124,58,237,0.08)", color:"#ffffff", fontFamily:"Montserrat, sans-serif", fontSize:14, width:260, outline:"none" }}/>
            <button style={{ padding:"12px 28px", borderRadius:100, border:"none", background:"linear-gradient(90deg,#7c3aed,#a78bfa)", color:"#ffffff", fontFamily:"Montserrat, sans-serif", fontWeight:700, fontSize:14, cursor:"pointer", transition:"all 0.25s cubic-bezier(0.16,1,0.3,1)" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(124,58,237,0.4)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              Book a Demo
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
