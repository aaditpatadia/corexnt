import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "./Toast";

export default function ComingSoon({ title, description, icon, estimatedDate, features = [] }) {
  const navigate = useNavigate();
  const toast    = useToast();
  const [email, setEmail]     = useState("");
  const [notified, setNotified] = useState(false);

  const notify = () => {
    if (!email.trim()) return;
    const list = JSON.parse(localStorage.getItem("corex_notify")||"[]");
    if (!list.includes(email)) {
      list.push(email);
      localStorage.setItem("corex_notify", JSON.stringify(list));
    }
    setNotified(true);
    toast("You're on the list! We'll email you when it launches.");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-16 overflow-y-auto scroll-area">
      <motion.div
        initial={{ opacity:0, y:30 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
        className="text-center max-w-lg"
      >
        {/* Icon */}
        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
            style={{ background:"rgba(45,214,104,0.07)", border:"1px solid rgba(45,214,104,0.2)" }}>
            {icon}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background:"rgba(45,214,104,0.15)", border:"1px solid rgba(45,214,104,0.35)", color:"#2dd668" }}>
            ⚡
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-accent animate-pulse" style={{ background:"#2dd668" }}/>
          Coming {estimatedDate || "Soon"}
        </div>

        <h1 className="text-3xl font-bold text-white mb-4" style={{ fontFamily:"var(--font-body)" }}>
          {title}
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
          {description}
        </p>

        {/* Features list */}
        {features.length > 0 && (
          <div className="p-5 rounded-2xl mb-8 text-left"
            style={{ background:"rgba(45,214,104,0.04)", border:"1px solid rgba(45,214,104,0.1)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>
              What's coming
            </p>
            <ul className="space-y-3">
              {features.map((f, i) => (
                <motion.li key={f}
                  initial={{ opacity:0, x:-10 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay:0.1+i*0.07 }}
                  className="flex items-center gap-3 text-sm"
                  style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 dot-pulse" style={{ background:"#2dd668" }}/>
                  {f}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Notify form */}
        {!notified ? (
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-green flex-1 px-4 py-3 rounded-xl text-sm"
              style={{ fontFamily:"var(--font-body)" }}
              onKeyDown={e => e.key === "Enter" && notify()}
            />
            <button onClick={notify}
              className="btn-green px-5 py-3 rounded-xl text-sm font-semibold"
              style={{ color:"#050a06", fontFamily:"var(--font-body)" }}>
              Notify me
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm"
            style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
            ✓ You're on the list!
          </motion.div>
        )}

        {/* Back link */}
        <button onClick={() => navigate("/app/chat")}
          className="mt-8 text-sm transition-colors"
          style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}
          onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
          ← Back to Chat
        </button>
      </motion.div>
    </div>
  );
}
