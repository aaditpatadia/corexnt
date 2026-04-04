import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const MESSAGES = [
  "Corex is thinking…",
  "Analysing the strategy…",
  "Pulling deep insights…",
  "Building your system…",
  "Cutting through the noise…",
  "Almost ready…",
];

function SkeletonLine({ width = "100%", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="h-3 rounded-full shimmer-bg"
      style={{ width }}
    />
  );
}

export default function Loader() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl"
    >
      {/* Thinking header */}
      <div className="flex items-center gap-3 mb-4">
        {/* Animated logo */}
        <div className="relative w-8 h-8 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-purple-blue flex items-center justify-center"
            style={{ boxShadow: "0 0 16px rgba(139,92,246,0.4)" }}>
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{ boxShadow: ["0 0 0 0 rgba(139,92,246,0.4)", "0 0 0 8px rgba(139,92,246,0)", "0 0 0 0 rgba(139,92,246,0)"] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={msgIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-zinc-400 font-medium"
            >
              {MESSAGES[msgIdx]}
            </motion.span>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-violet-500"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton card */}
      <div className="glass rounded-2xl p-5 space-y-4"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
        {/* Title skeleton */}
        <SkeletonLine width="60%" delay={0.05} />

        {/* Summary lines */}
        <div className="space-y-2">
          <SkeletonLine width="100%" delay={0.1} />
          <SkeletonLine width="88%" delay={0.15} />
          <SkeletonLine width="72%" delay={0.2} />
        </div>

        <div className="h-px bg-white/[0.05]" />

        {/* Bullet skeletons */}
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="w-3 h-3 rounded shimmer-bg flex-shrink-0"
              />
              <SkeletonLine width={`${[80, 65, 70][i]}%`} delay={0.28 + i * 0.05} />
            </div>
          ))}
        </div>

        <div className="h-px bg-white/[0.05]" />

        {/* Graph skeleton */}
        <div className="space-y-2">
          <SkeletonLine width="30%" delay={0.4} />
          <div className="flex items-end gap-2 h-24 pt-2">
            {[60, 85, 45, 95, 70, 55].map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: 0.45 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 rounded-t shimmer-bg"
                style={{ height: `${h}%`, transformOrigin: "bottom" }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
