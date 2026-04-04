import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronRight, Zap, TrendingUp, FileText, Star } from "lucide-react";

const QUICK = [
  { icon: TrendingUp, label: "Growth Audit",      color: "#8B5CF6" },
  { icon: FileText,   label: "Content Calendar",  color: "#3B82F6" },
  { icon: Zap,        label: "Hook Generator",    color: "#F59E0B" },
  { icon: Star,       label: "Creator Pricing",   color: "#10B981" },
];

export default function RightPanel({ visible, history, onHistoryClick, onQuickAction }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 220, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col h-full glass border-l border-white/[0.07] overflow-hidden flex-shrink-0"
        >
          <div className="p-4 flex-1 overflow-y-auto">
            {/* Quick actions */}
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-medium">
                Quick Actions
              </p>
              <div className="space-y-1">
                {QUICK.map((q) => {
                  const Icon = q.icon;
                  return (
                    <motion.button
                      key={q.label}
                      whileHover={{ x: 2, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onQuickAction(q.label)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl
                        text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]
                        transition-all duration-200 group"
                    >
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: q.color + "20" }}>
                        <Icon size={11} style={{ color: q.color }} />
                      </div>
                      <span className="flex-1 text-left truncate">{q.label}</span>
                      <ChevronRight size={10} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* History */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-medium flex items-center gap-1.5">
                <Clock size={9} />
                Recent
              </p>
              <div className="space-y-0.5">
                {history.length === 0 ? (
                  <p className="text-xs text-zinc-700 px-2 py-2">No history yet</p>
                ) : (
                  history.map((h, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ x: 2 }}
                      onClick={() => onHistoryClick(h)}
                      className="w-full flex items-start gap-2 px-2.5 py-2 rounded-xl
                        text-left text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]
                        transition-all duration-200"
                    >
                      <div className="w-1 h-1 rounded-full bg-violet-500/60 flex-shrink-0 mt-1.5" />
                      <span className="truncate">{h}</span>
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
