import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import HistoryDrawer from "./HistoryDrawer";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "Just now";
}

/* ── Profile dropdown ── */
function ProfileDropdown({ userName, userEmail, onClose, onSignOut }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div ref={ref}
      initial={{ opacity:0, y:-8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.95 }}
      transition={{ duration:0.15 }}
      className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
      style={{ background:"rgba(10,18,12,0.98)", border:"1px solid rgba(45,214,104,0.15)", boxShadow:"0 16px 48px rgba(0,0,0,0.5)" }}>
      <div className="p-3 border-b" style={{ borderColor:"rgba(45,214,104,0.08)" }}>
        <p className="text-sm font-semibold truncate" style={{ color:"#f0faf2", fontFamily:"var(--font-body)" }}>{userName || "User"}</p>
        <p className="text-xs truncate mt-0.5" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>{userEmail}</p>
      </div>
      {[
        { label:"Settings", icon:"⚙️", onClick: onClose },
      ].map(item => (
        <button key={item.label} onClick={item.onClick}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-all"
          style={{ color:"rgba(240,250,242,0.7)", fontFamily:"var(--font-body)" }}
          onMouseEnter={e=>{ e.currentTarget.style.background="rgba(45,214,104,0.06)"; e.currentTarget.style.color="#f0faf2"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(240,250,242,0.7)"; }}>
          <span>{item.icon}</span>{item.label}
        </button>
      ))}
      <button onClick={onSignOut}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-all border-t"
        style={{ color:"#f87171", fontFamily:"var(--font-body)", borderColor:"rgba(45,214,104,0.08)" }}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(248,113,113,0.06)"}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <span>🚪</span>Sign out
      </button>
    </motion.div>
  );
}

export default function TopBar({ userType, userName, userEmail, onUpgrade, onLoadConversation }) {
  const navigate = useNavigate();
  const [showHistory,  setShowHistory]  = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);

  const isCreator = userType !== "company";
  const accent    = isCreator ? "#2dd668" : "#a78bfa";
  const modePill  = isCreator ? "Creator" : "Brand";
  const pillStyle = isCreator
    ? { background:"rgba(45,214,104,0.1)", border:"1px solid rgba(45,214,104,0.25)", color:"#2dd668" }
    : { background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.3)", color:"#a78bfa" };

  const signOut = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isVerified");
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("sessionExpiry");
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <>
      <div className="flex-shrink-0 flex items-center justify-between px-5 relative z-20"
        style={{ height:48, background:"transparent", backdropFilter:"none", WebkitBackdropFilter:"none" }}>

        {/* Left — Logo */}
        <button onClick={() => navigate("/app/chat")}
          className="flex items-center gap-2 transition-opacity"
          onMouseEnter={e=>e.currentTarget.style.opacity="0.8"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="rgba(45,214,104,0.12)" stroke="rgba(45,214,104,0.35)" strokeWidth="1"/>
            <path d="M8 16c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#2dd668" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="16" cy="21" r="3.5" fill="#2dd668"/>
          </svg>
          <span className="text-sm font-bold" style={{ color:"#f0faf2", fontFamily:"var(--font-body)" }}>Corex</span>
        </button>

        {/* Center — Mode pill */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ fontFamily:"var(--font-body)", ...pillStyle }}>
            {modePill}
          </span>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1">

          {/* History */}
          <button onClick={() => setShowHistory(true)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ color:"rgba(240,250,242,0.4)" }}
            onMouseEnter={e=>{ e.currentTarget.style.color="#f0faf2"; e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.color="rgba(240,250,242,0.4)"; e.currentTarget.style.background="transparent"; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </button>

          {/* Profile */}
          <div className="relative">
            <button onClick={() => setShowProfile(p => !p)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ml-0.5 transition-all"
              style={{ background:`rgba(${isCreator?"45,214,104":"124,58,237"},0.15)`, border:`1px solid rgba(${isCreator?"45,214,104":"124,58,237"},0.3)`, color:accent, fontFamily:"var(--font-body)" }}>
              {(userName||"CX").slice(0,2).toUpperCase()}
            </button>
            <AnimatePresence>
              {showProfile && (
                <ProfileDropdown userName={userName} userEmail={userEmail} onClose={() => setShowProfile(false)} onSignOut={signOut}/>
              )}
            </AnimatePresence>
          </div>

          {/* Upgrade */}
          <button onClick={onUpgrade}
            className="ml-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{ background:"rgba(45,214,104,0.1)", border:"1px solid rgba(45,214,104,0.25)", color:"#2dd668", fontFamily:"var(--font-body)" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(45,214,104,0.18)"; e.currentTarget.style.borderColor="rgba(45,214,104,0.4)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(45,214,104,0.1)"; e.currentTarget.style.borderColor="rgba(45,214,104,0.25)"; }}>
            Upgrade
          </button>
        </div>
      </div>

      {/* History Drawer */}
      <HistoryDrawer
        open={showHistory}
        onClose={() => setShowHistory(false)}
        onLoad={(conv) => { setShowHistory(false); onLoadConversation?.(conv); }}
        userType={userType}
      />
    </>
  );
}
