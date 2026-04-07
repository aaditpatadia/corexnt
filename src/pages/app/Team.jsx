import { useState } from "react";
import { motion } from "framer-motion";

const FEATURES = [
  { emoji:"👥", title:"Shared workspaces", desc:"Collaborate on campaigns, briefs, and strategies with your whole team in real time." },
  { emoji:"💬", title:"Team chat threads", desc:"Discuss AI responses, leave notes, and assign follow-ups without leaving COREX." },
  { emoji:"📁", title:"Shared reports library", desc:"Save and organise AI-generated reports that every team member can access." },
  { emoji:"🔐", title:"Role-based access", desc:"Give team members different permissions — editor, viewer, or admin." },
  { emoji:"📊", title:"Team analytics", desc:"See how your team is using COREX and which tools are driving results." },
];

export default function Team() {
  const [email,   setEmail]   = useState("");
  const [saved,   setSaved]   = useState(false);
  const [invalid, setInvalid] = useState(false);

  const notify = () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setInvalid(true); return;
    }
    setInvalid(false);
    try {
      const existing = JSON.parse(localStorage.getItem("corex_team_notify") || "[]");
      if (!existing.includes(trimmed)) {
        localStorage.setItem("corex_team_notify", JSON.stringify([...existing, trimmed]));
      }
    } catch {}
    setSaved(true);
  };

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
            style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
            🚧 Coming Soon
          </div>

          {/* Animated icon stack */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {["👩‍💻","👨‍💼","👩‍🎨","🧑‍🚀"].map((em, i) => (
              <motion.div key={i}
                initial={{ opacity:0, scale:0.5, y:10 }}
                animate={{ opacity:1, scale:1, y:0 }}
                transition={{ delay:0.2 + i * 0.1, type:"spring", stiffness:300, damping:20 }}
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ background:"rgba(14,28,16,0.8)", border:"2px solid rgba(45,214,104,0.2)", marginLeft: i > 0 ? -8 : 0, zIndex:4-i }}>
                {em}
              </motion.div>
            ))}
          </div>

          <motion.h1 initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
            className="text-4xl font-bold mb-3" style={{ fontFamily:"var(--font-body)", color:"#1a1a1a" }}>
            Team Collaboration
          </motion.h1>
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
            className="text-base" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)", maxWidth:480, margin:"0 auto" }}>
            COREX is getting a full team mode. Collaborate with your marketing team, share AI strategies, and move faster together.
          </motion.p>
        </motion.div>

        {/* Feature list */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          className="rounded-2xl p-6 mb-8 space-y-4"
          style={{ background:"rgba(14,28,16,0.7)", border:"1px solid rgba(45,214,104,0.15)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color:"rgba(45,214,104,0.6)", fontFamily:"var(--font-body)" }}>
            What's coming
          </p>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:0.55 + i * 0.08 }}
              className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.12)" }}>
                {f.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color:"#1a1a1a", fontFamily:"var(--font-body)" }}>{f.title}</p>
                <p className="text-xs leading-relaxed" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Email capture */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }}
          className="rounded-2xl p-6"
          style={{ background:"rgba(14,28,16,0.7)", border:"1px solid rgba(45,214,104,0.15)" }}>
          {saved ? (
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="text-center py-4">
              <div className="text-3xl mb-3">🎉</div>
              <p className="text-base font-bold mb-1" style={{ color:"#1a1a1a", fontFamily:"var(--font-body)" }}>You're on the list!</p>
              <p className="text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>We'll email you the moment Team drops.</p>
            </motion.div>
          ) : (
            <>
              <p className="text-sm font-semibold mb-1" style={{ color:"#1a1a1a", fontFamily:"var(--font-body)" }}>Get early access</p>
              <p className="text-xs mb-4" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
                Be first to know when Team launches. No spam, just one email.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e=>{ setEmail(e.target.value); setInvalid(false); }}
                  onKeyDown={e=>e.key==="Enter"&&notify()}
                  style={{
                    flex:1, background:"#ffffff",
                    border:`1px solid ${invalid?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}`,
                    color:"#1a1a1a", borderRadius:12, fontFamily:"var(--font-body)",
                    fontSize:14, outline:"none", padding:"10px 14px",
                  }}
                  onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.5)"}
                  onBlur={e=>e.target.style.borderColor=invalid?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}/>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={notify}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm btn-green flex-shrink-0"
                  style={{ color:"#050a06", fontFamily:"var(--font-body)" }}>
                  Notify me
                </motion.button>
              </div>
              {invalid && <p className="text-xs mt-2" style={{ color:"#f87171", fontFamily:"var(--font-body)" }}>Enter a valid email address.</p>}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
