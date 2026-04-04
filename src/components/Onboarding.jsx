import { motion } from "framer-motion";
import { Sparkles, Building2, ArrowRight } from "lucide-react";

export default function Onboarding({ onSelect }) {
  const handleSelect = (type) => {
    localStorage.setItem("corex_userType", type);
    onSelect(type);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-14"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl gradient-purple-blue flex items-center justify-center font-bold text-white text-xl"
            style={{ boxShadow: "0 0 32px rgba(124,58,237,0.5)", fontFamily: "Sora, sans-serif" }}
          >
            C
          </div>
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight"
          style={{ fontFamily: "Sora, sans-serif" }}
        >
          Welcome to{" "}
          <span className="gradient-text">Corex</span>
        </h1>
        <p className="text-zinc-500 text-lg max-w-md mx-auto leading-relaxed">
          The world&apos;s most advanced Creative OS for Indian founders, brands &amp; creators.
        </p>
      </motion.div>

      {/* Choose path */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-xs uppercase tracking-widest text-zinc-600 mb-8 font-medium"
      >
        Choose your path
      </motion.p>

      <div className="flex flex-col md:flex-row gap-5 w-full max-w-2xl">
        {/* Creator card */}
        <Card
          delay={0.3}
          type="creator"
          icon={<Sparkles size={28} className="text-violet-400" />}
          title="Creator"
          subtitle="For Creators & Influencers"
          description="Build your personal brand, grow your audience, monetise your content, and script viral reels."
          badges={["Reel Scripts", "Brand Deals", "Trend Engine", "Growth Audit"]}
          gradient="rgba(124,58,237,0.12)"
          border="rgba(124,58,237,0.25)"
          onClick={() => handleSelect("creator")}
        />

        {/* Company card */}
        <Card
          delay={0.4}
          type="company"
          icon={<Building2 size={28} className="text-indigo-400" />}
          title="Company"
          subtitle="For Brands & Companies"
          description="Run campaigns, allocate marketing budgets, audit brand positioning, and outmanoeuvre competitors."
          badges={["Campaign Builder", "Budget Allocator", "Brand Audit", "Competitor Intel"]}
          gradient="rgba(99,102,241,0.12)"
          border="rgba(99,102,241,0.25)"
          onClick={() => handleSelect("company")}
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-zinc-700 text-xs mt-10"
      >
        No credit card required · 10 free messages to start
      </motion.p>
    </div>
  );
}

function Card({ delay, icon, title, subtitle, description, badges, gradient, border, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, boxShadow: `0 20px 60px ${gradient.replace("0.12", "0.3")}, 0 0 0 1px ${border}` }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex-1 text-left rounded-2xl p-7 cursor-pointer transition-all duration-300"
      style={{
        background: `rgba(255,255,255,0.04)`,
        border: `1px solid rgba(255,255,255,0.08)`,
        backdropFilter: "blur(20px)",
        boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: gradient, border: `1px solid ${border}` }}
      >
        {icon}
      </div>

      {/* Text */}
      <h2
        className="text-2xl font-bold text-white mb-1"
        style={{ fontFamily: "Sora, sans-serif" }}
      >
        {title}
      </h2>
      <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">{subtitle}</p>
      <p className="text-sm text-zinc-400 leading-relaxed mb-5">{description}</p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {badges.map((b) => (
          <span
            key={b}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 bg-white/[0.05] border border-white/[0.08]"
          >
            {b}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2 text-sm font-semibold text-violet-400">
        <span>Get started</span>
        <ArrowRight size={15} />
      </div>
    </motion.button>
  );
}
