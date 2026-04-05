import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";

function handleGetStarted(navigate) {
  if (localStorage.getItem("isLoggedIn") === "true") {
    navigate("/app/chat");
  } else {
    navigate("/app");
  }
}

/* ─── Navbar ─── */
function Navbar({ scrolled }) {
  const navigate = useNavigate();
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16"
      style={{
        background: scrolled ? "rgba(8,8,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div className="font-display font-bold text-xl text-white" style={{ letterSpacing: "-0.02em" }}>
        Corex
      </div>
      <div className="hidden md:flex items-center gap-8">
        {[
          { label: "Features", action: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
          { label: "Pricing",  action: () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }) },
          { label: "Creators", action: () => navigate("/creators") },
          { label: "Brands",   action: () => navigate("/brands") },
        ].map(({ label, action }) => (
          <button key={label} onClick={action}
            className="text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/app")}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all"
          style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", fontFamily: "var(--font-body)" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
          Sign in
        </button>
        <button
          onClick={() => handleGetStarted(navigate)}
          className="btn-white px-4 py-2 rounded-full text-sm">
          Get started
        </button>
      </div>
    </nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden"
      style={{ background: "var(--main-bg)" }}>

      {/* Bottom arc decoration */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 1 }}>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" width="100%" height="280">
          <defs>
            <radialGradient id="arcGrad" cx="50%" cy="100%" r="80%">
              <stop offset="0%" stopColor="rgba(40,28,14,0.7)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <ellipse cx="720" cy="340" rx="900" ry="200" fill="url(#arcGrad)" />
        </svg>
      </div>

      {/* Content */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center" style={{ zIndex: 10 }}>

        {/* Beta pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-10"
          style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-body)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Now in Beta — Free to try
        </div>

        <h1 className="font-display font-bold leading-none mb-2"
          style={{ fontSize: "clamp(48px, 7vw, 88px)", color: "#ffffff", letterSpacing: "-0.03em" }}>
          The Creative OS
        </h1>
        <h1 className="font-display leading-none mb-8"
          style={{ fontSize: "clamp(48px, 7vw, 88px)", color: "#ffffff", letterSpacing: "-0.03em", fontStyle: "italic", fontWeight: 400 }}>
          for what you're building.
        </h1>

        <p className="text-lg mb-10 max-w-lg leading-relaxed"
          style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)", fontSize: "clamp(15px,1.1vw,18px)" }}>
          Not a chatbot. A system. Built for creators and brands who move fast and think bigger.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <button onClick={() => navigate("/creators")}
            className="btn-white px-8 py-3.5 rounded-full font-semibold text-base"
            style={{ fontFamily: "var(--font-body)" }}>
            For Creators →
          </button>
          <button onClick={() => navigate("/brands")}
            className="btn-ghost-white px-8 py-3.5 rounded-full font-semibold text-base"
            style={{ fontFamily: "var(--font-body)" }}>
            For Brands →
          </button>
        </div>

        <p className="mt-6 text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>
          10 free messages daily · No credit card required
        </p>
      </motion.div>
    </section>
  );
}

/* ─── Product Preview ─── */
function ProductPreview() {
  return (
    <section className="py-16 px-6" style={{ background: "var(--main-bg)" }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          data-reveal
          className="rounded-3xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }}
        >
          {/* Fake browser bar */}
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
            <div className="ml-3 px-4 py-1 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)" }}>
              corexnt.vercel.app/app/chat
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-sm px-4 py-3 rounded-2xl rounded-br-sm text-sm"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-body)" }}>
                Write me a viral reel script for my fitness brand
              </div>
            </div>
            {/* COREX response */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: "rgba(45,214,104,0.15)", border: "1px solid rgba(45,214,104,0.3)", color: "#2dd668", fontFamily: "var(--font-body)" }}>
                CX
              </div>
              <div className="flex-1 px-4 py-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
                style={{ background: "rgba(14,28,16,0.8)", border: "1px solid rgba(45,214,104,0.18)", color: "rgba(240,250,242,0.85)", fontFamily: "var(--font-body)", boxShadow: "0 0 30px rgba(45,214,104,0.05)" }}>
                Here's the thing — the reel that goes viral isn't the one with the best production. It's the one that stops someone mid-scroll in the first 2 seconds. Here's your script...
                <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(45,214,104,0.1)" }}>
                  <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(45,214,104,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: "72%", background: "linear-gradient(90deg, #2dd668, #4ade80)" }} />
                  </div>
                  <span className="text-xs whitespace-nowrap" style={{ color: "#2dd668" }}>↑ 72% viral score</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function Features() {
  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      title: "Visual + Text Answers",
      desc: "Every response comes with live charts, real metrics, and zero AI fluff",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
        </svg>
      ),
      title: "Creator Mode",
      desc: "Reel scripts, growth audits, trend intelligence, brand deal pricing — all in one place",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      title: "Brand Mode",
      desc: "Campaigns, budget allocation, competitor intel, full marketing strategy",
    },
  ];

  return (
    <section id="features" className="py-24 px-6" style={{ background: "var(--main-bg)" }}>
      <div className="max-w-5xl mx-auto">
        <h2 data-reveal className="font-display font-bold text-center mb-16"
          style={{ fontSize: "clamp(36px, 4vw, 56px)", color: "#ffffff", letterSpacing: "-0.02em" }}>
          Everything in one system
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={f.title} data-reveal className="p-7 rounded-2xl glass-white group"
              style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#ffffff" }}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2"
                style={{ fontFamily: "var(--font-body)", fontSize: 18 }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Choose your mode", desc: "Creator or brand — your entire experience adapts from the first click." },
    { n: "02", title: "Ask anything",      desc: "Strategy, scripts, audits, campaigns — just type like you're texting a smart friend." },
    { n: "03", title: "Get real answers",  desc: "Not generic advice. Specific, data-backed, actionable strategy with a chart every time." },
  ];
  return (
    <section className="py-24 px-6" style={{ background: "var(--main-bg)" }}>
      <div className="max-w-4xl mx-auto">
        <h2 data-reveal className="font-display font-bold text-center mb-16"
          style={{ fontSize: "clamp(36px, 4vw, 48px)", color: "#ffffff", letterSpacing: "-0.02em" }}>
          How it works
        </h2>
        <div className="relative">
          {/* Dotted connecting line */}
          <div className="hidden md:block absolute top-8 left-1/2 -translate-x-1/2 w-[60%] h-px"
            style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 5px, transparent 5px, transparent 12px)" }} />
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.n} data-reveal className="text-center relative"
                style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10"
                  style={{ background: "#ffffff", color: "#080808" }}>
                  <span className="font-display font-bold text-sm">{s.n}</span>
                </div>
                <h3 className="font-semibold text-white mb-2" style={{ fontFamily: "var(--font-body)", fontSize: 17 }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
const CREATOR_PLANS = [
  { name: "Trial", price: "₹192", period: "15 days", popular: false, desc: "Perfect for trying Corex", features: ["50 AI messages", "Reel Script generator", "Growth Audit", "Templates library", "Email support"], cta: "Start trial" },
  { name: "Pro",   price: "₹499", period: "month",   popular: true,  desc: "For serious creators",    features: ["Unlimited messages", "All 5 engines", "Trend Intelligence", "Brand Deal Kit", "Priority support", "Content calendar"], cta: "Get Pro" },
  { name: "Elite", price: "₹999", period: "month",   popular: false, desc: "For top creators",         features: ["Everything in Pro", "Custom AI persona", "Analytics dashboard", "1-on-1 onboarding", "5 team seats", "White-label exports"], cta: "Go Elite" },
];
const COMPANY_PLANS = [
  { name: "Starter",    price: "₹2,999", period: "month", popular: false, desc: "For early-stage startups", features: ["3 team members", "Campaign Builder", "Budget Allocator", "100 sessions/month", "Email support"], cta: "Get Starter" },
  { name: "Growth",     price: "₹7,999", period: "month", popular: true,  desc: "For scaling brands",       features: ["10 team members", "Full suite access", "Competitor Intel", "Unlimited sessions", "Influencer briefs", "Priority CSM"], cta: "Get Growth" },
  { name: "Enterprise", price: "Custom", period: "",      popular: false, desc: "For large organisations",  features: ["Unlimited seats", "White label", "API access", "SLA guarantee", "Dedicated account team", "Custom integrations"], cta: "Contact us" },
];

function PricingCard({ plan, navigate }) {
  return (
    <div className="relative flex flex-col rounded-2xl p-6 transition-all duration-300"
      style={{
        background: plan.popular ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
        border: plan.popular ? "1px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.1)",
        boxShadow: plan.popular ? "0 0 60px rgba(255,255,255,0.06)" : "none",
      }}>
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
          style={{ background: "#ffffff", color: "#080808", fontFamily: "var(--font-body)" }}>
          Most Popular
        </div>
      )}
      <h3 className="font-bold text-white text-xl mb-1" style={{ fontFamily: "var(--font-body)" }}>{plan.name}</h3>
      <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>{plan.desc}</p>
      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-body)" }}>{plan.price}</span>
        {plan.period && <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>/{plan.period}</span>}
      </div>
      <div className="h-px mb-5" style={{ background: "rgba(255,255,255,0.08)" }} />
      <ul className="space-y-2.5 flex-1 mb-6">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
            {f}
          </li>
        ))}
      </ul>
      <button onClick={() => handleGetStarted(navigate)}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
        style={plan.popular
          ? { background: "#ffffff", color: "#080808", fontFamily: "var(--font-body)" }
          : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", fontFamily: "var(--font-body)" }}>
        {plan.cta}
      </button>
    </div>
  );
}

function Pricing() {
  const [tab, setTab] = useState("creator");
  const navigate = useNavigate();
  const plans = tab === "company" ? COMPANY_PLANS : CREATOR_PLANS;

  return (
    <section id="pricing" className="py-24 px-6" style={{ background: "var(--main-bg)" }}>
      <div className="max-w-5xl mx-auto">
        <h2 data-reveal className="font-display font-bold text-center mb-4"
          style={{ fontSize: "clamp(36px, 4vw, 56px)", color: "#ffffff", letterSpacing: "-0.02em" }}>
          Simple pricing
        </h2>
        <p data-reveal className="text-center mb-10 text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
          Cancel anytime. No hidden fees.
        </p>
        <div className="flex justify-center mb-10">
          <div className="flex p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {["creator", "company"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-7 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
                style={tab === t ? { background: "#ffffff", color: "#080808", fontFamily: "var(--font-body)" } : { color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)" }}>
                {t === "company" ? "Brands" : "Creators"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(p => <PricingCard key={p.name} plan={p} navigate={navigate} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  const items = [
    { q: "COREX gave me a reel script that hit 2.4M views. I've tried everything — this actually works.", name: "Priya S.", role: "Fashion Creator, 180K followers" },
    { q: "We used COREX to plan our Diwali campaign. Best ROI we've had from any tool this year.", name: "Arjun M.", role: "D2C Brand Founder" },
    { q: "It's like having a senior strategist on call 24/7 for less than a pizza.", name: "Rohit K.", role: "Fitness Creator, 67K followers" },
  ];
  return (
    <section className="py-24 px-6" style={{ background: "var(--main-bg)" }}>
      <div className="max-w-5xl mx-auto">
        <h2 data-reveal className="font-display font-bold text-center mb-16"
          style={{ fontSize: "clamp(32px, 3.5vw, 48px)", color: "#ffffff", letterSpacing: "-0.02em" }}>
          What creators are saying
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <div key={i} data-reveal className="p-7 rounded-2xl glass-white"
              style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="flex gap-1 mb-4">
                {Array(5).fill(0).map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#ffffff" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)" }}>"{t.q}"</p>
              <p className="font-semibold text-white text-sm" style={{ fontFamily: "var(--font-body)" }}>{t.name}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="py-12 px-6 border-t" style={{ background: "var(--main-bg)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <div className="font-display font-bold text-white text-xl mb-1">Corex</div>
            <div className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>The Creative OS</div>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "Features", action: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
              { label: "Pricing",  action: () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }) },
              { label: "Creators", action: () => navigate("/creators") },
              { label: "Brands",   action: () => navigate("/brands") },
            ].map(({ label, action }) => (
              <button key={label} onClick={action} className="text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
                {label}
              </button>
            ))}
          </div>
          <a href="https://www.instagram.com/corexnt" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
        </div>
        <div className="h-px mb-6" style={{ background: "rgba(255,255,255,0.06)" }} />
        <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)" }}>
          © 2026 Corex. A Creative OS for everyone.
        </p>
      </div>
    </footer>
  );
}

/* ─── Main Export ─── */
export default function MainLanding() {
  const [scrolled, setScrolled] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "var(--main-bg)", minHeight: "100vh" }}>
      <Navbar scrolled={scrolled} />
      <Hero />
      <ProductPreview />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
}
