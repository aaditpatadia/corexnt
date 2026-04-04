import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip,
} from "chart.js";
import { Check, ArrowRight, Twitter, Instagram, Star } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

/* ── useInView hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── Logo ── */
function CorexLogo({ size = 28 }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="rgba(45,214,104,0.12)" stroke="rgba(45,214,104,0.4)" strokeWidth="1"/>
        <path d="M8 16c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#2dd668" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="16" cy="21" r="3.5" fill="#2dd668"/>
        <path d="M12.5 19.5L16 17.5L19.5 19.5" stroke="#050a06" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:18, color:"#f0faf2", letterSpacing:"-0.3px" }}>
        Corex
      </span>
    </div>
  );
}

/* ── Navbar ── */
function Navbar({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(5,10,6,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(45,214,104,0.1)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <CorexLogo />

        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color:"rgba(240,250,242,0.6)" }}>
          {["Features","Pricing","For Creators","For Brands"].map((link) => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g,"-")}`}
              className="hover:text-green-accent transition-colors duration-200"
              style={{ "--tw-text-opacity":1 }}
            >{link}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGetStarted}
            className="hidden sm:block px-4 py-2 rounded-xl text-sm font-medium btn-ghost"
          >
            Sign in
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-xl text-sm font-bold btn-green"
            style={{ color:"#050a06" }}
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ── */
function HeroSection({ onGetStarted }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const handleMouse = useCallback((e) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    setMouse({
      x: (e.clientX - r.left - r.width  / 2) / r.width,
      y: (e.clientY - r.top  - r.height / 2) / r.height,
    });
  }, []);

  const rings = [
    { size: 200, opacity: 0.7, delay: "0s"   },
    { size: 310, opacity: 0.45, delay: "0.5s" },
    { size: 420, opacity: 0.22, delay: "1s"   },
    { size: 530, opacity: 0.1,  delay: "1.5s" },
  ];

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouse}
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
    >
      {/* Concentric rings */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          transform: `translate(${mouse.x * -18}px, ${mouse.y * -18}px)`,
          transition: "transform 0.12s ease-out",
          width: 540, height: 540,
        }}
      >
        {rings.map((r, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: r.size, height: r.size,
              border: `1px solid rgba(45,214,104,${r.opacity})`,
              borderRadius: 28 + i * 6,
              animation: `ringPulse 3s ease-in-out ${r.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Beta badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
          style={{
            background: "rgba(45,214,104,0.1)",
            border: "1px solid rgba(45,214,104,0.3)",
            color: "#2dd668",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Now in Beta — Join Free
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-sora font-extrabold leading-tight mb-2"
          style={{ fontSize: "clamp(40px,6vw,76px)", color:"#f0faf2", fontFamily:"Sora,sans-serif" }}
        >
          Create. Grow.
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="gradient-text-green font-extrabold leading-tight mb-6"
          style={{ fontSize: "clamp(40px,6vw,76px)", fontFamily:"Sora,sans-serif" }}
        >
          Dominate.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="text-lg mb-10 max-w-xl mx-auto leading-relaxed"
          style={{ color:"rgba(240,250,242,0.6)" }}
        >
          The AI Creative OS built for Indian creators and brands.
          Not a chatbot. A system.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={onGetStarted}
            className="btn-green px-10 py-4 font-bold text-lg"
            style={{ borderRadius: 100, color:"#050a06", letterSpacing:"-0.2px" }}
          >
            Get started free →
          </button>
          <p style={{ color:"var(--text-muted)", fontSize:13 }}>
            No credit card required · 10 free messages daily
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Social proof marquee ── */
function SocialProof() {
  const brands = ["CRED","Zepto","boAt","Mamaearth","Dot & Key","Ranveer Allahbadia",
    "Niharika NM","Dolly Singh","Bhuvan Bam","Ankur Warikoo","Boat","Sugar Cosmetics",
    "mCaffeine","Bombay Shaving Company","Nykaa","The Good Glamm Group"];
  const items = [...brands, ...brands];

  return (
    <section className="py-12 overflow-hidden" style={{ borderTop:"1px solid rgba(45,214,104,0.08)", borderBottom:"1px solid rgba(45,214,104,0.08)" }}>
      <p className="text-center text-sm mb-6" style={{ color:"var(--text-muted)" }}>
        Trusted by creators and brands across India
      </p>
      <div className="relative">
        <div className="marquee-track">
          {items.map((b, i) => (
            <span key={i} className="px-8 text-sm font-semibold whitespace-nowrap" style={{ color:"rgba(240,250,242,0.35)" }}>
              {b} <span style={{ color:"rgba(45,214,104,0.3)", margin:"0 16px" }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ── */
function FeaturesSection() {
  const [ref, inView] = useInView();
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="16" rx="3" stroke="#2dd668" strokeWidth="1.8"/>
          <path d="M10 9L15 12L10 15V9Z" fill="#2dd668"/>
        </svg>
      ),
      title: "Reel Script Engine",
      desc: "Write viral reel scripts with hooks, B-roll notes, captions and hashtags in 30 seconds.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 18L8 11L13 14L18 7L21 10" stroke="#2dd668" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 6V10H17" stroke="#2dd668" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
      title: "Growth Audit",
      desc: "Tell COREX your stats. Get told exactly what's broken and a 30-day fix with real metrics.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M22 8L17.5 3L13 8H16V13C16 15.2 14.2 17 12 17S8 15.2 8 13V11H6V13C6 16.3 8.7 19 12 19S18 16.3 18 13V8H22Z" fill="#2dd668" opacity="0.15" stroke="#2dd668" strokeWidth="1.5"/>
          <circle cx="12" cy="21" r="1.5" fill="#2dd668"/>
        </svg>
      ),
      title: "Campaign Builder",
      desc: "Build full marketing campaigns with budget allocation, influencer briefs and content angles.",
    },
  ];

  return (
    <section id="features" ref={ref} className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-4xl font-extrabold mb-3" style={{ fontFamily:"Sora,sans-serif" }}>
          Everything you need to grow
        </h2>
        <p style={{ color:"var(--text-secondary)" }}>Three tools. One OS. Unlimited leverage.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="glass p-7"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)" }}>
              {f.icon}
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily:"Sora,sans-serif" }}>{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color:"var(--text-secondary)" }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── How it works ── */
function HowItWorks() {
  const [ref, inView] = useInView();
  const steps = [
    { n:"01", icon:"🎯", title:"Pick your mode",   desc:"Creator or Brand — your experience adapts."   },
    { n:"02", icon:"💬", title:"Ask anything",       desc:"Natural language. No forms. No templates."   },
    { n:"03", icon:"📊", title:"Get insights + charts",desc:"Real answers with live data visualisations." },
  ];

  return (
    <section ref={ref} className="py-24 px-6" style={{ background:"rgba(10,20,12,0.3)" }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-16" style={{ fontFamily:"Sora,sans-serif" }}>
          Simple. Powerful. Fast.
        </h2>
        <div className="relative flex flex-col md:flex-row gap-8 md:gap-0">
          {/* Dotted connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[16.5%] right-[16.5%] h-px"
            style={{
              background: "repeating-linear-gradient(90deg,rgba(45,214,104,0.4) 0,rgba(45,214,104,0.4) 6px,transparent 6px,transparent 14px)",
              top: "2.5rem",
            }}
          />

          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex-1 flex flex-col items-center text-center px-6"
            >
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl z-10 relative"
                  style={{ background:"rgba(20,40,24,0.8)", border:"1px solid rgba(45,214,104,0.3)" }}>
                  {s.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background:"#2dd668", color:"#050a06", fontFamily:"Sora,sans-serif" }}>
                  {i+1}
                </div>
              </div>
              <h3 className="font-bold text-base mb-2" style={{ fontFamily:"Sora,sans-serif" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color:"var(--text-secondary)" }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Graph Showcase ── */
function GraphShowcase() {
  const [ref, inView] = useInView();
  const chartData = {
    labels: ["Month 1","Month 2","Month 3","Month 4","Month 5","Month 6"],
    datasets: [{
      data: [10000, 18000, 32000, 51000, 74000, 100000],
      backgroundColor: "rgba(45,214,104,0.7)",
      borderRadius: 6,
      borderSkipped: false,
    }],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: inView ? 900 : 0 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(10,20,12,0.95)",
        borderColor: "rgba(45,214,104,0.3)",
        borderWidth: 1,
        titleColor: "#f0faf2",
        bodyColor: "rgba(240,250,242,0.7)",
        callbacks: {
          label: (ctx) => ` ${ctx.raw.toLocaleString()} followers`,
        },
      },
    },
    scales: {
      x: { grid:{ color:"rgba(45,214,104,0.05)" }, ticks:{ color:"rgba(240,250,242,0.4)", font:{size:11} }, border:{ color:"transparent" } },
      y: { display: false },
    },
  };

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-4" style={{ fontFamily:"Sora,sans-serif" }}>
          Responses that feel like insights
        </h2>
        <p className="text-center mb-14" style={{ color:"var(--text-secondary)" }}>
          Every answer comes with a chart. Every chart is built from your data.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-static p-8 rounded-2xl"
        >
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mock chat */}
            <div className="flex-1">
              {/* User message */}
              <div className="flex justify-end mb-5">
                <div className="px-4 py-3 rounded-2xl rounded-br-sm text-sm max-w-xs"
                  style={{ background:"rgba(45,214,104,0.12)", border:"1px solid rgba(45,214,104,0.2)", color:"#f0faf2" }}>
                  How should I grow from 10K to 100K followers?
                </div>
              </div>

              {/* COREX response card */}
              <div className="rounded-2xl p-5"
                style={{ background:"rgba(20,40,24,0.6)", borderLeft:"3px solid #2dd668", border:"1px solid rgba(45,214,104,0.18)", borderLeftWidth:3, borderLeftColor:"#2dd668" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background:"rgba(45,214,104,0.15)", color:"#2dd668" }}>COREX</span>
                  <span className="text-xs" style={{ color:"var(--text-muted)" }}>Growth Engine</span>
                </div>
                <h3 className="font-bold text-base mb-2" style={{ fontFamily:"Sora,sans-serif" }}>Your 90-day growth roadmap</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color:"var(--text-secondary)" }}>
                  Here's the thing — 90% of creators trying to hit 100K are posting more when they should be posting smarter.
                  Zepto grew to 2M Instagram followers not by posting daily but by owning one single content format for 90 days straight.
                </p>

                {/* Chart */}
                <div className="rounded-xl p-3 mb-4" style={{ background:"rgba(5,10,6,0.5)", height: 160 }}>
                  {inView && <Bar data={chartData} options={chartOptions} />}
                </div>

                {/* Chips */}
                <div className="flex gap-2 flex-wrap">
                  {["Show me week-by-week","What content format?","How to monetize at 50K?"].map((c) => (
                    <span key={c} className="px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all"
                      style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"rgba(240,250,242,0.7)" }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Metric cards */}
            <div className="flex flex-col gap-4 lg:w-56">
              {[
                { top:"28K → 100K", label:"Follower Growth", icon:"📈", delta:"+258%" },
                { top:"6.2%",       label:"Engagement Rate", icon:"💚", delta:"+2.1%" },
                { top:"7PM",        label:"Best Post Time",  icon:"🕖", delta:"IST"   },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-4"
                  style={{ background:"rgba(20,40,24,0.7)", border:"1px solid rgba(45,214,104,0.15)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background:"rgba(45,214,104,0.1)", color:"#2dd668" }}>{m.delta}</span>
                  </div>
                  <div className="text-xl font-bold" style={{ fontFamily:"Sora,sans-serif" }}>{m.top}</div>
                  <div className="text-xs mt-0.5" style={{ color:"var(--text-muted)" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Pricing ── */
function PricingSection({ onGetStarted }) {
  const [ref, inView] = useInView();
  const [tab, setTab] = useState("creator");

  const creatorPlans = [
    {
      name:"Trial", price:"₹192", period:"15 days", popular:false,
      features:["50 messages","Reel Scripts","Growth Audit","Templates"],
      cta:"Start trial",
    },
    {
      name:"Pro", price:"₹499", period:"month", popular:true,
      features:["Unlimited messages","All engines","Trend Intelligence","Brand Deal Kit","Priority support"],
      cta:"Get Pro",
    },
    {
      name:"Elite", price:"₹999", period:"month", popular:false,
      features:["Everything in Pro","Custom AI persona","Analytics dashboard","1-on-1 onboarding"],
      cta:"Go Elite",
    },
  ];
  const companyPlans = [
    {
      name:"Starter", price:"₹2,999", period:"month", popular:false,
      features:["3 team members","Campaign Builder","Budget Allocator","100 sessions/mo"],
      cta:"Get Starter",
    },
    {
      name:"Growth", price:"₹7,999", period:"month", popular:true,
      features:["10 members","Full suite","Competitor Intel","Unlimited sessions","Priority CSM"],
      cta:"Get Growth",
    },
    {
      name:"Enterprise", price:"Custom", period:"", popular:false,
      features:["White label","API access","SLA guarantee","Dedicated account team"],
      cta:"Contact us",
    },
  ];

  const plans = tab === "creator" ? creatorPlans : companyPlans;

  return (
    <section id="pricing" ref={ref} className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-3" style={{ fontFamily:"Sora,sans-serif" }}>
          Start free. Scale when ready.
        </h2>
        <p className="text-center mb-10" style={{ color:"var(--text-secondary)" }}>Cancel anytime. No hidden fees.</p>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <div className="flex p-1 rounded-xl" style={{ background:"rgba(20,40,24,0.6)", border:"1px solid rgba(45,214,104,0.15)" }}>
            {["creator","company"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize"
                style={tab===t ? { background:"#2dd668", color:"#050a06" } : { color:"var(--text-secondary)" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity:0, y:20 }}
              animate={inView ? { opacity:1, y:0 } : {}}
              transition={{ delay: i*0.1, duration:0.45 }}
              className="rounded-2xl p-6 flex flex-col"
              style={{
                background: plan.popular ? "rgba(45,214,104,0.06)" : "rgba(20,40,24,0.5)",
                border: plan.popular ? "1px solid rgba(45,214,104,0.4)" : "1px solid rgba(45,214,104,0.1)",
                boxShadow: plan.popular ? "0 0 40px rgba(45,214,104,0.1)" : "none",
              }}
            >
              {plan.popular && (
                <div className="text-xs font-bold px-3 py-1 rounded-full text-center mb-4 self-start"
                  style={{ background:"#2dd668", color:"#050a06" }}>
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-1" style={{ fontFamily:"Sora,sans-serif" }}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-extrabold" style={{ fontFamily:"Sora,sans-serif", color: plan.popular?"#2dd668":"#f0faf2" }}>{plan.price}</span>
                {plan.period && <span className="text-sm" style={{ color:"var(--text-muted)" }}>/{plan.period}</span>}
              </div>
              <div className="h-px mb-5" style={{ background:"rgba(45,214,104,0.1)" }} />
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color:"var(--text-secondary)" }}>
                    <Check size={14} style={{ color:"#2dd668", flexShrink:0 }} />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200"
                style={plan.popular ? { background:"#2dd668", color:"#050a06" } : { background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#f0faf2" }}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
function Testimonials() {
  const [ref, inView] = useInView();
  const cards = [
    { text:"COREX gave me a reel script that hit 2.4M views. I've tried everything — this actually works.", name:"Priya S.", sub:"Fashion Creator, 180K followers" },
    { text:"We used COREX to plan our Diwali campaign. Best ROI we've had from any tool this year.", name:"Arjun M.", sub:"D2C Brand Founder" },
    { text:"It's like having a senior strategist on call 24/7 for less than a pizza.", name:"Rohit K.", sub:"Fitness Creator, 67K followers" },
  ];

  return (
    <section ref={ref} className="py-24 px-6" style={{ background:"rgba(10,20,12,0.3)" }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-14" style={{ fontFamily:"Sora,sans-serif" }}>
          What creators are saying
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity:0, y:20 }}
              animate={inView ? { opacity:1, y:0 } : {}}
              transition={{ delay: i*0.12, duration:0.5 }}
              className="glass p-6"
            >
              <div className="flex gap-1 mb-4">
                {[0,1,2,3,4].map((s) => <Star key={s} size={13} fill="#2dd668" style={{ color:"#2dd668" }} />)}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color:"var(--text-secondary)" }}>"{c.text}"</p>
              <div>
                <div className="text-sm font-semibold" style={{ fontFamily:"Sora,sans-serif" }}>{c.name}</div>
                <div className="text-xs" style={{ color:"var(--text-muted)" }}>{c.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="py-16 px-6" style={{ borderTop:"1px solid rgba(45,214,104,0.08)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
          <div>
            <CorexLogo />
            <p className="text-sm mt-2" style={{ color:"var(--text-muted)" }}>Creative OS for India</p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm" style={{ color:"var(--text-secondary)" }}>
            {["Home","Features","Pricing","Blog","Contact"].map((l) => (
              <a key={l} href="#" className="hover:text-green-400 transition-colors">{l}</a>
            ))}
          </nav>
          <div className="flex gap-3">
            {[Twitter, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.15)" }}>
                <Icon size={15} style={{ color:"rgba(240,250,242,0.5)" }} />
              </a>
            ))}
          </div>
        </div>
        <div className="h-px mb-6" style={{ background:"rgba(45,214,104,0.08)" }} />
        <p className="text-center text-xs" style={{ color:"var(--text-muted)" }}>
          © 2026 Corex. Built for Indian creators.
        </p>
      </div>
    </footer>
  );
}

/* ── Main Export ── */
export default function LandingPage() {
  const navigate = useNavigate();
  const go = () => navigate("/app");

  return (
    <div className="relative z-10" style={{ overflowX:"hidden" }}>
      <Navbar onGetStarted={go} />
      <HeroSection onGetStarted={go} />
      <SocialProof />
      <FeaturesSection />
      <HowItWorks />
      <GraphShowcase />
      <PricingSection onGetStarted={go} />
      <Testimonials />
      <Footer />
    </div>
  );
}
