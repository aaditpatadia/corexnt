import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";

function handleGetStarted(navigate) {
  localStorage.setItem("userType", "company");
  if (localStorage.getItem("isLoggedIn") === "true") navigate("/app/chat");
  else navigate("/app");
}

function Footer({ navigate }) {
  return (
    <footer className="py-10 px-6 border-t" style={{ borderColor:"rgba(255,255,255,0.07)", background:"var(--br-bg)" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="font-display font-bold text-white text-xl">Corex</div>
        <div className="flex items-center gap-5">
          {[["Creators","/creators"],["Main","/"]] .map(([l,h])=>(
            <button key={l} onClick={()=>navigate(h)} className="text-sm transition-colors" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}
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

/* Animated vertical bars */
function VerticalBars() {
  const bars = Array.from({ length: 24 }, (_, i) => ({
    h: 40 + Math.random() * 160,
    delay: i * 0.15,
    dur: 3 + Math.random() * 3,
  }));
  return (
    <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-end gap-1.5 pb-20 px-8 pointer-events-none"
      style={{ zIndex: 1, opacity: 0.5 }}>
      {bars.map((b, i) => (
        <div key={i} className="flex-1 rounded-t-lg"
          style={{
            height: b.h,
            background: `linear-gradient(180deg, rgba(124,58,237,${0.3+i%3*0.2}), rgba(168,85,247,0.15))`,
            animation: `barBreath ${b.dur}s ease-in-out infinite`,
            animationDelay: `${b.delay}s`,
            transformOrigin: "bottom",
          }} />
      ))}
    </div>
  );
}

export default function BrandLanding() {
  const navigate = useNavigate();
  useScrollReveal();

  return (
    <div style={{ background:"var(--br-bg)", minHeight:"100vh" }}>
      {/* Orbs */}
      <div className="br-orb-1" /><div className="br-orb-2" />

      {/* Light beam effect */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {Array.from({length:6}).map((_,i)=>(
          <div key={i} className="absolute top-0 bottom-0" style={{
            left:`${10+i*15}%`, width:"1px",
            background:`linear-gradient(180deg, rgba(124,58,237,0.08), transparent)`,
            animation:`ringPulse ${3+i}s ease-in-out infinite`, animationDelay:`${i*0.5}s`
          }}/>
        ))}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16"
        style={{ background:"rgba(6,4,15,0.9)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(124,58,237,0.15)" }}>
        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}
          onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>
          ← Back
        </button>
        <button onClick={()=>handleGetStarted(navigate)}
          className="btn-brand px-5 py-2 rounded-full text-sm" style={{ fontFamily:"var(--font-body)" }}>
          Get started
        </button>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col justify-center min-h-screen px-12 pt-16 overflow-hidden">
        <VerticalBars />
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
          className="relative max-w-2xl" style={{ zIndex:10 }}>
          <h1 className="font-display font-bold leading-none mb-2"
            style={{ fontSize:"clamp(48px,6vw,96px)", color:"#ffffff", letterSpacing:"-0.03em" }}>
            Your brand's
          </h1>
          <h2 className="font-display leading-none mb-8"
            style={{ fontSize:"clamp(48px,6vw,96px)", letterSpacing:"-0.03em", fontStyle:"italic", background:"var(--br-gradient)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            creative brain.
          </h2>
          <p className="text-lg mb-10 max-w-lg leading-relaxed"
            style={{ color:"rgba(255,255,255,0.55)", fontFamily:"var(--font-body)", fontSize:"clamp(15px,1.1vw,18px)" }}>
            Campaign strategy. Budget allocation. Competitor intelligence. All in one system.
          </p>
          <button onClick={()=>handleGetStarted(navigate)}
            className="btn-brand px-10 py-4 rounded-full text-base font-semibold" style={{ fontFamily:"var(--font-body)" }}>
            Build your brand →
          </button>
        </motion.div>
      </section>

      {/* Pain point cards */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 data-reveal className="font-display font-bold text-center text-white mb-14"
            style={{ fontSize:"clamp(32px,3.5vw,48px)", letterSpacing:"-0.02em" }}>
            The problems every brand faces
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon:"📢", title:"Campaign Chaos", text:"Most brands launch campaigns by gut feeling and wonder why the ROI doesn't show up." },
              { icon:"💸", title:"Budget Leaks",   text:"₹5 lakhs disappears across 4 agencies with no unified strategy connecting them." },
              { icon:"🔭", title:"Competitor Blind Spots", text:"Your competitors are making moves you don't know about until it's too late." },
            ].map((c,i)=>(
              <div key={c.title} data-reveal className="rounded-2xl p-7 transition-all duration-300"
                style={{ background:"rgba(124,58,237,0.05)", border:"1px solid rgba(124,58,237,0.2)", transitionDelay:`${i*0.1}s` }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,0.45)"; e.currentTarget.style.background="rgba(124,58,237,0.09)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,0.2)"; e.currentTarget.style.background="rgba(124,58,237,0.05)";}}>
                <div className="text-4xl mb-5">{c.icon}</div>
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
            <div data-reveal className="rounded-2xl overflow-hidden"
              style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(124,58,237,0.25)" }}>
              <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
                <div className="w-2 h-2 rounded-full" style={{ background:"#7c3aed" }} />
                <span className="text-xs" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>Campaign Builder</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-end">
                  <div className="px-4 py-2.5 rounded-2xl text-sm" style={{ background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.25)", color:"rgba(255,255,255,0.85)", fontFamily:"var(--font-body)" }}>
                    Plan a product launch for ₹3 lakh budget
                  </div>
                </div>
                <div className="px-4 py-4 rounded-2xl text-sm leading-relaxed" style={{ background:"rgba(20,12,40,0.8)", border:"1px solid rgba(168,85,247,0.2)", color:"rgba(255,255,255,0.8)", fontFamily:"var(--font-body)" }}>
                  Here's exactly how I'd split that ₹3L: 40% to reels with 3 micro-influencers, 30% to targeted Meta ads, 20% to creator UGC content, 10% in reserve for retargeting. Expected reach: 2.3M people.
                </div>
              </div>
            </div>

            <div data-reveal className="space-y-4" style={{ transitionDelay:"0.15s" }}>
              {[
                { label:"Campaign ROI", value:"4.2x", sub:"average return", color:"#a855f7" },
                { label:"Budget saved", value:"₹1.2L", sub:"per campaign vs agency", color:"#7c3aed" },
                { label:"Reach",        value:"2.3M",  sub:"projected audience",    color:"#4f46e5" },
              ].map((m,i)=>(
                <div key={m.label} className="flex items-center gap-4 p-5 rounded-2xl"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(124,58,237,0.15)" }}>
                  <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background:`${m.color}20`, color:m.color }}>
                    {["↑","💰","👥"][i]}
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

      {/* Why */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 data-reveal className="font-display font-bold text-center text-white mb-12"
            style={{ fontSize:"clamp(32px,3.5vw,48px)", letterSpacing:"-0.02em" }}>
            Why brands choose Corex
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon:"🚀", title:"Full campaign strategy in minutes", desc:"What agencies charge ₹50K for — in seconds." },
              { icon:"📊", title:"Budget allocated with AI precision",  desc:"Every rupee goes exactly where it'll get the best return." },
              { icon:"🔍", title:"Know what competitors are doing",      desc:"Real intelligence, not guesswork." },
              { icon:"📈", title:"Every answer has real data",           desc:"Charts and metrics with every single response." },
            ].map((r,i)=>(
              <div key={r.title} data-reveal className="flex items-start gap-4 p-5 rounded-2xl"
                style={{ background:"rgba(124,58,237,0.04)", border:"1px solid rgba(124,58,237,0.12)", transitionDelay:`${i*0.08}s` }}>
                <div className="text-2xl">{r.icon}</div>
                <div>
                  <h4 className="font-semibold text-white mb-1" style={{ fontFamily:"var(--font-body)", fontSize:16 }}>{r.title}</h4>
                  <p className="text-sm" style={{ color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)" }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 data-reveal className="font-display font-bold text-center text-white mb-12"
            style={{ fontSize:"clamp(32px,3.5vw,48px)", letterSpacing:"-0.02em" }}>
            Brands that trust Corex
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { q:"Built our Holi campaign strategy in 20 minutes. ROI was 3.8x.", name:"Simran A.", role:"Marketing Head, D2C Brand" },
              { q:"Finally understood our competitor's playbook. Changed everything.", name:"Rohit V.", role:"Founder, Series A Startup" },
              { q:"Saved ₹2L in agency fees in the first month.", name:"Priya M.", role:"CMO, Consumer Brand" },
            ].map((t,i)=>(
              <div key={i} data-reveal className="p-7 rounded-2xl"
                style={{ background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.2)", transitionDelay:`${i*0.1}s` }}>
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_,j)=>(
                    <svg key={j} width="12" height="12" viewBox="0 0 24 24" fill="#a855f7" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p className="text-sm mb-4 leading-relaxed" style={{ color:"rgba(255,255,255,0.7)", fontFamily:"var(--font-body)" }}>"{t.q}"</p>
                <p className="font-semibold text-white text-sm" style={{ fontFamily:"var(--font-body)" }}>{t.name}</p>
                <p className="text-xs" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>{t.role}</p>
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
            Brand plans
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name:"Starter", price:"₹2,999", period:"month", popular:false, features:["3 team members","Campaign Builder","Budget Allocator","100 sessions/month"], cta:"Get Starter" },
              { name:"Growth",  price:"₹7,999", period:"month", popular:true,  features:["10 team members","Full suite access","Competitor Intel","Unlimited sessions","Influencer briefs","Priority CSM"], cta:"Get Growth" },
              { name:"Enterprise", price:"Custom", period:"", popular:false, features:["Unlimited seats","White label","API access","SLA guarantee","Dedicated team"], cta:"Contact us" },
            ].map(plan=>(
              <div key={plan.name} className="relative flex flex-col rounded-2xl p-6 transition-all duration-300"
                style={{ background:plan.popular?"rgba(124,58,237,0.1)":"rgba(255,255,255,0.02)", border:plan.popular?"1px solid rgba(124,58,237,0.45)":"1px solid rgba(124,58,237,0.15)" }}>
                {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background:"var(--br-gradient)", color:"#fff", fontFamily:"var(--font-body)" }}>Most Popular</div>}
                <h3 className="font-bold text-white text-xl mb-3" style={{ fontFamily:"var(--font-body)" }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-extrabold text-white" style={{ fontFamily:"var(--font-body)" }}>{plan.price}</span>
                  {plan.period&&<span className="text-sm" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>/{plan.period}</span>}
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map(f=>(
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={()=>handleGetStarted(navigate)} className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                  style={plan.popular?{ background:"var(--br-gradient)", color:"#fff", fontFamily:"var(--font-body)" }:{ background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.25)", color:"#a855f7", fontFamily:"var(--font-body)" }}>
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
          style={{ background:"rgba(124,58,237,0.07)", border:"1px solid rgba(124,58,237,0.25)" }}>
          <h2 data-reveal className="font-display font-bold text-white mb-4"
            style={{ fontSize:"clamp(32px,3.5vw,48px)", letterSpacing:"-0.02em" }}>
            Build smarter campaigns.
          </h2>
          <p className="mb-8 text-sm" style={{ color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)" }}>
            10 free messages to start. No agency required.
          </p>
          <button onClick={()=>handleGetStarted(navigate)} className="btn-brand px-10 py-4 rounded-full text-base font-semibold" style={{ fontFamily:"var(--font-body)" }}>
            Build your brand →
          </button>
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
}
