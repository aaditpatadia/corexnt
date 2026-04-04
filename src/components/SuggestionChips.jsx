import { motion } from "framer-motion";

const CREATOR_CHIPS = [
  { label: "Write me a viral reel script", emoji: "🎬" },
  { label: "Audit my Instagram growth", emoji: "📈" },
  { label: "What's trending this week", emoji: "🔥" },
  { label: "Price my brand deal", emoji: "💰" },
  { label: "Build my 30-day content calendar", emoji: "📅" },
  { label: "Find my niche angle", emoji: "🎯" },
];

const COMPANY_CHIPS = [
  { label: "Build a campaign for my product", emoji: "🚀" },
  { label: "Allocate my ₹5L marketing budget", emoji: "💼" },
  { label: "Audit our brand positioning", emoji: "🔍" },
  { label: "What are competitors doing", emoji: "👁️" },
  { label: "Generate influencer brief", emoji: "✍️" },
  { label: "Find where we lose customers", emoji: "🧩" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 12, scale: 0.93 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 380, damping: 26 } },
};

export default function SuggestionChips({ onSelect, userType = "creator" }) {
  const chips = userType === "company" ? COMPANY_CHIPS : CREATOR_CHIPS;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-wrap gap-2.5 justify-center max-w-2xl mx-auto"
    >
      {chips.map((chip) => (
        <motion.button
          key={chip.label}
          variants={item}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(chip.label)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium
            text-zinc-300 border border-white/[0.08] bg-white/[0.04]
            hover:border-violet-500/30 hover:bg-violet-600/10 hover:text-white
            transition-all duration-200 cursor-pointer"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
        >
          <span className="text-base leading-none">{chip.emoji}</span>
          <span>{chip.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
