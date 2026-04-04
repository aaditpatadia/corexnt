import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to login
        </button>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
          }}
        >
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-7">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}
                  >
                    <Mail size={22} className="text-violet-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
                    Reset password
                  </h2>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@brand.in"
                      className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || !email.trim()}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-white btn-purple disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      "Send reset link"
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
                >
                  <CheckCircle size={30} className="text-emerald-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
                  Reset link sent!
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                  We&apos;ve sent a password reset link to
                </p>
                <p className="text-violet-400 font-medium text-sm mb-6">{email}</p>
                <p className="text-zinc-600 text-xs">
                  Check your inbox (and spam) · Link expires in 30 minutes
                </p>
                <button
                  onClick={onBack}
                  className="mt-6 text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  ← Back to login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
