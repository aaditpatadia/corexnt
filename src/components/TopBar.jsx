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

function getMsgsLeft() {
  const today = new Date().toDateString();
  const used  = parseInt(localStorage.getItem(`corex_msgs_${today}`) || "0", 10);
  return Math.max(0, 15 - used);
}

/* ── Profile dropdown ── */
function ProfileDropdown({ userName, userEmail, accent, accentRgba, onClose, onSignOut, navigate }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const items = [
    { label: "Dashboard",  icon: "⚡", action: () => { navigate("/app/dashboard"); onClose(); } },
    { label: "Settings",   icon: "⚙️", action: () => { navigate("/app/settings");  onClose(); } },
    { label: "Upgrade",    icon: "✨", action: () => { navigate("/app/payment");   onClose(); } },
  ];

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
      style={{ background: "rgba(10,18,12,0.98)", border: `1px solid ${accentRgba}0.15)`, boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
      <div className="p-3 border-b" style={{ borderColor: `${accentRgba}0.08)` }}>
        <p className="text-sm font-semibold truncate" style={{ color: "#f0faf2", fontFamily: "var(--font-body)" }}>{userName || "User"}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>{userEmail}</p>
      </div>
      {items.map(item => (
        <button key={item.label} onClick={item.action}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-all"
          style={{ color: "rgba(240,250,242,0.7)", fontFamily: "var(--font-body)" }}
          onMouseEnter={e => { e.currentTarget.style.background = `${accentRgba}0.06)`; e.currentTarget.style.color = "#f0faf2"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(240,250,242,0.7)"; }}>
          <span>{item.icon}</span>{item.label}
        </button>
      ))}
      <button onClick={onSignOut}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-all border-t"
        style={{ color: "#f87171", fontFamily: "var(--font-body)", borderColor: `${accentRgba}0.08)` }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.06)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <span>🚪</span>Sign out
      </button>
    </motion.div>
  );
}

export default function TopBar({ userType, userName, userEmail, onUpgrade, onLoadConversation, onNewChat }) {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [msgsLeft,    setMsgsLeft]    = useState(getMsgsLeft());

  const isCreator  = userType !== "company";
  const accent     = isCreator ? "#2dd668" : "#a78bfa";
  const accentRgba = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";
  const modePill   = isCreator ? "Creator" : "Brand";
  const pillStyle  = isCreator
    ? { background: "#e8f5ee", border: "1px solid #c8e6d4", color: "#1a7a3c" }
    : { background: "#ede9f8", border: "1px solid #d4c8f4", color: "#7c3aed" };

  // Refresh msg counter when user returns to tab
  useEffect(() => {
    const handle = () => setMsgsLeft(getMsgsLeft());
    window.addEventListener("focus", handle);
    return () => window.removeEventListener("focus", handle);
  }, []);

  const signOut = () => {
    ["isLoggedIn","isVerified","sessionToken","sessionExpiry"].forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
    navigate("/");
  };

  const iconBtn = (onClick, children, tooltip) => (
    <button onClick={onClick} title={tooltip}
      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
      style={{ color: "#888888" }}
      onMouseEnter={e => { e.currentTarget.style.color = "#1a1a1a"; e.currentTarget.style.background = "#f0f0eb"; }}
      onMouseLeave={e => { e.currentTarget.style.color = "#888888"; e.currentTarget.style.background = "transparent"; }}>
      {children}
    </button>
  );

  return (
    <>
      <div className="flex-shrink-0 flex items-center justify-between px-5 relative z-20"
        style={{ height: 48, background: "#ffffff", borderBottom: "1px solid #e8e8e3" }}>

        {/* Left — Logo → dashboard */}
        <button onClick={() => navigate("/app/dashboard")} title="Back to dashboard"
          className="flex items-center gap-2 transition-opacity"
          onMouseEnter={e => e.currentTarget.style.opacity = "0.75"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="rgba(45,214,104,0.12)" stroke="rgba(45,214,104,0.35)" strokeWidth="1"/>
            <path d="M8 16c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#2dd668" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="16" cy="21" r="3.5" fill="#2dd668"/>
          </svg>
          <span className="text-sm font-bold" style={{ color: "#1a1a1a", fontFamily: "var(--font-body)" }}>Corex</span>
        </button>

        {/* Center — Mode pill */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <button onClick={() => navigate("/app/dashboard")}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={{ fontFamily: "var(--font-body)", ...pillStyle }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.75"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            {modePill}
          </button>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-0.5">

          {/* Messages left indicator */}
          {msgsLeft <= 5 && (
            <button onClick={onUpgrade}
              style={{ fontSize: 12, color: msgsLeft === 0 ? "#f43f5e" : "#888888", fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "pointer", marginRight: 4 }}>
              {msgsLeft === 0 ? "No messages left" : `${msgsLeft} left`}
            </button>
          )}

          {/* New chat */}
          {onNewChat && iconBtn(onNewChat, (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          ), "New chat")}

          {/* History */}
          {iconBtn(() => setShowHistory(true), (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          ), "Conversation history")}

          {/* Settings */}
          {iconBtn(() => navigate("/app/settings"), (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          ), "Settings")}

          {/* Profile avatar */}
          <div className="relative ml-0.5">
            <button onClick={() => setShowProfile(p => !p)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{ background: isCreator ? "#e8f5ee" : "#ede9f8", border: isCreator ? "1px solid #c8e6d4" : "1px solid #d4c8f4", color: accent, fontFamily: "var(--font-body)" }}>
              {(userName || "CX").slice(0, 2).toUpperCase()}
            </button>
            <AnimatePresence>
              {showProfile && (
                <ProfileDropdown
                  userName={userName} userEmail={userEmail}
                  accent={accent} accentRgba={accentRgba}
                  onClose={() => setShowProfile(false)}
                  onSignOut={signOut}
                  navigate={navigate}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Upgrade pill */}
          <button onClick={onUpgrade}
            className="ml-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{ background: "#1a7a3c", border: "1px solid #1a7a3c", color: "#ffffff", fontFamily: "var(--font-body)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#145f2f"; e.currentTarget.style.borderColor = "#145f2f"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1a7a3c"; e.currentTarget.style.borderColor = "#1a7a3c"; }}>
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
