import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";

function handleGetStarted(navigate) {
  localStorage.setItem("userType", "creator");
  if (localStorage.getItem("isLoggedIn") === "true") navigate("/app/chat");
  else navigate("/app");
}

function Footer({ navigate }) {
  return (
    <footer className="py-10 px-6 border-t" style={{ borderColor: "rgba(255,255,255,0.07)", background: "var(--cr-bg)" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="font-display font-bold text-white text-xl">Corex</div>
        <div className="flex items-center gap-5">
          {[["Features","#features"],["Pricing","#pricing"],["For Brands","/brands"]].map(([l,h])=>(
            <button key={l} onClick={()=>h.startsWith("#")?document.querySelector(h)?.scrollIntoView({behavior:"smooth"}):navigate(h)}
              className="text-sm transition-colors" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}
              onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.4)"}>
              {l}
            </button>
          ))}
        </div>
        <a href="https://www.instagram.com/corexnt" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
          style={{ border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.5)" }}
          onMouseEnter={e=>{ e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="rgba(255,255,255,0.4)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.color="rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </a>
      </div>
      <p className="text-center text-xs mt-6" style={{ color:"rgba(255,255,255,0.25)", fontFamily:"var(--font-body)" }}>
        © 2026 Corex. A Creative OS for everyone.
      </p>
    </footer>
  );
}

export default function CreatorLanding() {
  const navigate = useNavigate();
  useScrollReveal();

  return (
    <div style={{ background: "var(--cr-bg)", minHeight: "100vh" }}>
      {/* Orbs */}
      <div className="cr-orb-1" /><div className="cr-orb-2" /><div className="cr-orb-3" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16"
        style={{ background:"rgba(8,8,8,0.85)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}
          onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>
          ← All of Corex
        </button>
        <button onClick={() => handleGetStarted(navigate)}
          className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
          style={{ background:"transparent", border:"1px solid rgba(232,121,249,0.5)", color:"#e879f9", fontFamily:"var(--font-body)" }}
          onMouseEnter={e=>{ e.currentTarget.style.background="rgba(232,121,249,0.1)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; }}>
          Get started free
        </button>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-16">
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
          className="relative z-10 max-w-3xl">
          <h1 className="font-serif leading-tight mb-2" style={{ fontSize:"clamp(48px,7vw,96px)", color:"#ffffff", fontStyle:"italic" }}>
            Made for creators
          </h1>
          <h2 className="font-serif leading-tight mb-8" style={{ fontSize:"clamp(48px,7vw,96px)", fontStyle:"italic", background:"var(--cr-gradient)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            who mean business.
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)", fontSize:"clamp(15px,1.1vw,18px)" }}>
            COREX gives you the strategy, scripts, and data that most creators pay agencies ₹50,000/month for.
          </p>
          <button onClick={() => handleGetStarted(navigate)}
            className="btn-creator px-8 py-3.5 rounded-full text-base font-semibold mb-8"
            style={{ fontFamily:"var(--font-body)" }}>
            Start creating free →
          </button>
          <div className="flex items-center justify-center gap-2 mt-4">
            {["RK","NS","PA","AM","VB"].map((i,idx)=>(
              <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ background:`rgba(232,121,249,${0.2+idx*0.05})`, border:"2px solid rgba(232,121,249,0.3)", color:"white", fontFamily:"var(--font-body)", marginLeft: idx > 0 ? -10 : 0 }}>
                {i}
              </div>
            ))}
            <span className="text-sm ml-2" style={{ color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)" }}>
              Join 500+ creators already using COREX
            </span>
          </div>
        </motion.div>
      </section>

      {/* Pain Point Cards */}
      <section className="py-20 px-6" style={{ background:"var(--cr-bg)" }}>
        <div className="max-w-5xl mx-auto">
          <h2 data-reveal className="font-display font-bold text-center text-white mb-14"
            style={{ fontSize:"clamp(32px,3.5vw,48px)", letterSpacing:"-0.02em" }}>
            The real problems creators face
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: "📄",
                title: "Just Another Edit",
                text: "2.6 million videos uploaded daily. Generic content gets buried regardless of quality.",
              },
              {
                icon: "✏️",
                title: "No idea what to post?",
                text: "COREX tells you exactly what to create, when to post it, and what hook will make people stop scrolling.",
              },
              {
                icon: "📈",
                title: "Working hard, growing slow",
                text: "Most creators plateau at 10K because they're guessing. COREX shows you the exact gap.",
              },
            ].map((c, i) => (
              <div key={c.title} data-reveal className="rounded-2xl p-7 transition-all duration-300 group"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid", borderImage:"linear-gradient(135deg,rgba(232,121,249,0.35),rgba(129,140,248,0.25)) 1", transitionDelay:`${i*0.1}s`, borderRadius:16 }}>
                <div className="text-4xl mb-5 transition-transform group-hover:scale-110 duration-300">{c.icon}</div>
                <h3 className="font-semibold text-white mb-3" style={{ fontFamily:"var(--font-body)", fontSize:18 }}>{c.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)" }}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Showcase */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Chat preview */}
            <div data-reveal className="rounded-2xl overflow-hidden"
              style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(232,121,249,0.2)" }}>
              <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
                <div className="w-2 h-2 rounded-full" style={{ background:"#e879f9" }} />
                <span className="text-xs font-medium" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>Reel Script Engine</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-end">
                  <div className="px-4 py-2.5 rounded-2xl text-sm" style={{ background:"rgba(232,121,249,0.12)", border:"1px solid rgba(232,121,249,0.2)", color:"rgba(255,255,255,0.85)", fontFamily:"var(--font-body)" }}>
                    Write a reel script for my fitness page
                  </div>
                </div>
                <div className="px-4 py-4 rounded-2xl text-sm leading-relaxed" style={{ background:"rgba(20,12,30,0.8)", border:"1px solid rgba(129,140,248,0.2)", color:"rgba(255,255,255,0.8)", fontFamily:"var(--font-body)" }}>
                  Hook (0–3 sec): "I gained 10K followers by doing this ONE thing..." Swipe up before I delete this.
                  <div className="mt-3 text-xs" style={{ color:"rgba(232,121,249,0.7)" }}>→ Full script + B-roll notes + Caption below</div>
                </div>
              </div>
            </div>

            {/* Metric cards */}
            <div data-reveal className="space-y-4" style={{ transitionDelay:"0.15s" }}>
              {[
                { label:"Follower growth", value:"0 → 50K", sub:"in 6 months", color:"#e879f9" },
                { label:"Avg engagement", value:"7.2%",    sub:"above industry avg", color:"#818cf8" },
                { label:"Best hook type", value:"Question format", sub:"→ 3x more saves", color:"#38bdf8" },
              ].map((m,i)=>(
                <div key={m.label} className="flex items-center gap-4 p-5 rounded-2xl"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                  <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background:`${m.color}20` }}>
                    <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ color:m.color }}>
                      {["↑","~","⚡"][i]}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>{m.label}</div>
                    <div className="font-bold text-white" style={{ fontFamily:"var(--font-body)", fontSize:18 }}>{m.value}</div>
                    <div className="text-xs" style={{ color:m.color, fontFamily:"var(--font-body)" }}>{m.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why COREX */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 data-reveal className="font-display font-bold text-center text-white mb-12"
            style={{ fontSize:"clamp(32px,3.5vw,48px)", letterSpacing:"-0.02em" }}>
            Why creators choose Corex
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon:"📊", title:"Visual answers with real data", desc:"Every response comes with a chart — not just words." },
              { icon:"⚡", title:"Reel scripts in 30 seconds",    desc:"Not generic templates. Scripts built around your niche and audience." },
              { icon:"💸", title:"Costs less than one pitch call", desc:"Pay agencies ₹10,000 per strategy session. Or just use COREX." },
              { icon:"🧠", title:"Built to understand creator growth", desc:"Not corporate marketing advice. Real creator-specific strategy." },
            ].map((r,i)=>(
              <div key={r.title} data-reveal className="flex items-start gap-4 p-5 rounded-2xl"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", transitionDelay:`${i*0.08}s` }}>
                <div className="text-2xl flex-shrink-0">{r.icon}</div>
                <div>
                  <h4 className="font-semibold text-white mb-1" style={{ fontFamily:"var(--font-body)", fontSize:16 }}>{r.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)" }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 data-reveal className="font-display font-bold text-center text-white mb-12"
            style={{ fontSize:"clamp(32px,3.5vw,48px)", letterSpacing:"-0.02em" }}>
            Plans for every creator
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name:"Trial", price:"₹192", period:"15 days", popular:false, features:["50 messages","Reel scripts","Growth Audit","Templates"], cta:"Start trial" },
              { name:"Pro",   price:"₹499", period:"month",   popular:true,  features:["Unlimited messages","All engines","Trend Intel","Brand Deal Kit","Priority support"], cta:"Get Pro" },
              { name:"Elite", price:"₹999", period:"month",   popular:false, features:["Everything in Pro","Custom AI persona","5 seats","White-label"], cta:"Go Elite" },
            ].map(plan=>(
              <div key={plan.name} className="relative flex flex-col rounded-2xl p-6 transition-all duration-300"
                style={{ background:plan.popular?"rgba(232,121,249,0.07)":"rgba(255,255,255,0.03)", border:plan.popular?"1px solid rgba(232,121,249,0.4)":"1px solid rgba(255,255,255,0.1)" }}>
                {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background:"var(--cr-gradient)", color:"#fff", fontFamily:"var(--font-body)" }}>Most Popular</div>}
                <h3 className="font-bold text-white text-xl mb-3" style={{ fontFamily:"var(--font-body)" }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-extrabold text-white" style={{ fontFamily:"var(--font-body)" }}>{plan.price}</span>
                  {plan.period&&<span className="text-sm" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>/{plan.period}</span>}
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map(f=>(
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e879f9" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={()=>handleGetStarted(navigate)} className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                  style={plan.popular?{ background:"var(--cr-gradient)", color:"#fff", fontFamily:"var(--font-body)" }:{ background:"rgba(232,121,249,0.08)", border:"1px solid rgba(232,121,249,0.2)", color:"#e879f9", fontFamily:"var(--font-body)" }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl"
          style={{ background:"rgba(232,121,249,0.06)", border:"1px solid rgba(232,121,249,0.2)" }}>
          <h2 data-reveal className="font-display font-bold text-white mb-4"
            style={{ fontSize:"clamp(32px,3.5vw,48px)", letterSpacing:"-0.02em" }}>
            Ready to grow faster?
          </h2>
          <p className="mb-8 text-sm" style={{ color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)" }}>
            Start with 10 free messages. No credit card required.
          </p>
          <button onClick={()=>handleGetStarted(navigate)} className="btn-creator px-10 py-4 rounded-full text-base font-semibold" style={{ fontFamily:"var(--font-body)" }}>
            Start creating free →
          </button>
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
}
