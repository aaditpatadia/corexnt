import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div
        initial={{ opacity:0, y:24 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.4 }}
        className="w-full max-w-md"
      >
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color:"var(--text-muted)" }}
          onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"}
          onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
          <ArrowLeft size={15}/> Back to login
        </button>

        <div className="rounded-2xl p-8" style={{ background:"rgba(20,40,24,0.6)", border:"1px solid rgba(45,214,104,0.2)", backdropFilter:"blur(24px)" }}>
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div className="text-center mb-7">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background:"rgba(45,214,104,0.1)", border:"1px solid rgba(45,214,104,0.25)" }}>
                    <Mail size={22} style={{ color:"#2dd668" }}/>
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily:"Sora,sans-serif" }}>Reset your password</h2>
                  <p className="text-sm leading-relaxed" style={{ color:"var(--text-secondary)" }}>
                    Enter your email and we'll send a reset link.
                  </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color:"var(--text-secondary)" }}>Email address</label>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@brand.in"
                      className="input-green w-full px-4 py-3 rounded-xl text-sm"/>
                  </div>
                  <motion.button type="submit" disabled={loading || !email.trim()} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                    className="w-full py-3 rounded-xl font-bold text-sm btn-green disabled:opacity-50"
                    style={{ color:"#050a06" }}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black/80 rounded-full animate-spin"/>
                        Sending…
                      </span>
                    ) : "Send reset link"}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity:0, scale:0.95 }}
                animate={{ opacity:1, scale:1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale:0 }}
                  animate={{ scale:1 }}
                  transition={{ type:"spring", stiffness:280, damping:20 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background:"rgba(45,214,104,0.12)", border:"1px solid rgba(45,214,104,0.3)" }}
                >
                  <CheckCircle size={30} style={{ color:"#2dd668" }}/>
                </motion.div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily:"Sora,sans-serif" }}>Reset link sent!</h3>
                <p className="text-sm mb-1" style={{ color:"var(--text-secondary)" }}>We've sent a reset link to</p>
                <p className="font-semibold text-sm mb-6" style={{ color:"#2dd668" }}>{email}</p>
                <p className="text-xs mb-6" style={{ color:"var(--text-muted)" }}>Check your inbox and spam folder · Link expires in 30 minutes</p>
                <button onClick={onBack} className="text-sm font-medium transition-colors" style={{ color:"#2dd668" }}>
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
