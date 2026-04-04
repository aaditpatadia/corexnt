import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

function CorexMark() {
  return (
    <div className="flex items-center justify-center gap-2.5 mb-12">
      <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="rgba(45,214,104,0.12)" stroke="rgba(45,214,104,0.4)" strokeWidth="1"/>
        <path d="M8 16c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#2dd668" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="16" cy="21" r="3.5" fill="#2dd668"/>
      </svg>
      <span style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:22, color:"#f0faf2" }}>Corex</span>
    </div>
  );
}

function TypeCard({ type, icon, title, subtitle, stats, onClick, delay }) {
  return (
    <motion.button
      initial={{ opacity:0, y:24 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay, duration:0.45, ease:[0.16,1,0.3,1] }}
      whileHover={{ y:-6 }}
      whileTap={{ scale:0.98 }}
      onClick={onClick}
      className="flex-1 text-left rounded-2xl p-8 cursor-pointer transition-all duration-300 group"
      style={{
        background:"rgba(20,40,24,0.5)",
        border:"1px solid rgba(45,214,104,0.15)",
        backdropFilter:"blur(20px)",
        boxShadow:"0 4px 24px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(45,214,104,0.5)"; e.currentTarget.style.boxShadow="0 0 40px rgba(45,214,104,0.12), 0 8px 40px rgba(0,0,0,0.4)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(45,214,104,0.15)"; e.currentTarget.style.boxShadow="0 4px 24px rgba(0,0,0,0.3)"; }}
    >
      {/* Animated icon */}
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl"
        style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)" }}>
        <motion.div
          animate={{ scale:[1,1.05,1] }}
          transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}
        >
          {icon}
        </motion.div>
      </div>

      <h3 className="text-2xl font-bold mb-1.5" style={{ fontFamily:"Sora,sans-serif" }}>{title}</h3>
      <p className="text-sm mb-5" style={{ color:"var(--text-secondary)" }}>{subtitle}</p>

      <div className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
        style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#2dd668" }}>
        {stats}
      </div>

      <div className="flex items-center gap-2 font-semibold text-sm" style={{ color:"#2dd668" }}>
        Get started <ArrowRight size={15} />
      </div>
    </motion.button>
  );
}

export default function Onboarding({ onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative z-10">
      <CorexMark />

      <motion.div
        initial={{ opacity:0, y:-12 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.4 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ fontFamily:"Sora,sans-serif" }}>
          Who are you building for?
        </h2>
        <p style={{ color:"var(--text-secondary)", fontSize:15 }}>
          Your entire experience adapts to your answer.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-5 w-full max-w-2xl">
        <TypeCard
          delay={0.2}
          type="creator"
          icon="🎬"
          title="I'm a Creator"
          subtitle="Reels, growth, brand deals, trends"
          stats="3.5M+ Indian creators"
          onClick={() => onSelect("creator")}
        />
        <TypeCard
          delay={0.3}
          type="company"
          icon="💼"
          title="I'm a Brand / Startup"
          subtitle="Campaigns, budgets, brand strategy"
          stats="B2B & Funded Startups"
          onClick={() => onSelect("company")}
        />
      </div>

      <motion.p
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:0.5 }}
        className="text-xs mt-10"
        style={{ color:"var(--text-muted)" }}
      >
        No credit card required · 10 free messages to start
      </motion.p>
    </div>
  );
}
