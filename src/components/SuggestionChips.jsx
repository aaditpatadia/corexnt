import { motion } from "framer-motion";
import { TrendingUp, FileText, Zap, Star, Users, BarChart2, Target, Sparkles } from "lucide-react";

const CHIPS = [
  { label: "Growth strategy",    icon: TrendingUp, color: "#8B5CF6" },
  { label: "Content ideas",      icon: FileText,   color: "#3B82F6" },
  { label: "Brand positioning",  icon: Zap,        color: "#F59E0B" },
  { label: "Creator pricing",    icon: Star,       color: "#10B981" },
  { label: "Viral trend ideas",  icon: Sparkles,   color: "#F43F5E" },
  { label: "Audience building",  icon: Users,      color: "#06B6D4" },
  { label: "Budget allocation",  icon: BarChart2,  color: "#A78BFA" },
  { label: "Launch strategy",    icon: Target,     color: "#FB923C" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 28 } },
};

export default function SuggestionChips({ onSelect }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
      {CHIPS.map((chip) => {
        const Icon = chip.icon;
        return (
          <motion.button
            key={chip.label}
            variants={item}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(chip.label)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium
              text-zinc-300 border border-white/[0.07] bg-white/[0.04]
              hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white
              transition-all duration-200 cursor-pointer"
            style={{
              boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            <div className="w-4 h-4 rounded-md flex items-center justify-center"
              style={{ backgroundColor: chip.color + "20" }}>
              <Icon size={10} style={{ color: chip.color }} />
            </div>
            {chip.label}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
