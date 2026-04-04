import { motion } from "framer-motion";

export default function Loader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3"
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex-shrink-0 gradient-purple-blue flex items-center justify-center text-xs font-bold text-white"
        style={{ boxShadow: "0 0 14px rgba(124,58,237,0.5)", fontFamily: "Sora, sans-serif" }}
      >
        CX
      </div>

      {/* Three dots card */}
      <div
        className="glass rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2.5"
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-400"
            animate={{ y: [0, -7, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.9,
              delay: i * 0.18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
