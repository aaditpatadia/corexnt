import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthFlow          from "./AuthFlow";
import CreditModal       from "./CreditModal";
import ChatDashboard     from "../pages/app/ChatDashboard";
import PersonalDashboard from "../pages/app/PersonalDashboard";
import ProfileSetup      from "../pages/app/ProfileSetup";
import PaymentPage       from "./PaymentPage";
import CompetitorIntel   from "../pages/app/CompetitorIntel";
import BriefBuilder      from "../pages/app/BriefBuilder";
import ProjectsPage      from "../pages/app/ProjectsPage";
import SettingsPage      from "../pages/SettingsPage";
import { hasProfile }    from "../utils/userProfile";
import { getCredits, translateCredits } from "../utils/credits";
import { isAdmin }       from "../utils/modelConfig";
import { getPlanTheme, applyTheme, PLAN_THEMES } from "../utils/planTheme";

const FONT = "'Instrument Sans', sans-serif";

/* ─── Sidebar nav item ─── */
function NavItem({ icon, label, active, onClick, premium }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        fontFamily: FONT,
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
        background: active ? "rgba(255,255,255,0.07)" : "transparent",
        textAlign: "left",
        width: "100%",
        transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          e.currentTarget.style.color = "#ffffff";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,0.55)";
        }
      }}
    >
      <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {premium && (
        <span style={{ fontSize: 10, color: "rgba(156,252,175,0.6)", fontWeight: 600, letterSpacing: "0.5px" }}>PRO</span>
      )}
    </button>
  );
}

/* ─── Left Sidebar ─── */
function Sidebar({ navigate, location, onNewChat, onClose }) {
  const active = location.pathname.replace("/app/", "").split("/")[0] || "dashboard";

  const [sidebarCredits, setSidebarCredits] = useState(() => parseInt(localStorage.getItem('corex_credits') || '0'));
  useEffect(() => {
    const refresh = () => setSidebarCredits(parseInt(localStorage.getItem('corex_credits') || '0'));
    const interval = setInterval(refresh, 3000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(interval); window.removeEventListener('focus', refresh); };
  }, []);

  const history = (() => {
    try { return JSON.parse(localStorage.getItem("corex_history") || "[]").slice(0, 8); }
    catch { return []; }
  })();

  const nav = [
    { icon: "🗨", label: "Chat",           path: "chat",            action: () => { onNewChat(); navigate("/app/chat"); onClose?.(); } },
    { icon: "📁", label: "Projects",       path: "projects",        action: () => { navigate("/app/projects"); onClose?.(); } },
    { icon: "✦",  label: "Brief Builder",  path: "brief-builder",   action: () => { navigate("/app/brief-builder"); onClose?.(); } },
    { icon: "◎",  label: "Competitor Intel", path: "competitor-intel", action: () => { navigate("/app/competitor-intel"); onClose?.(); } },
  ];

  return (
    <div
      style={{
        width: onClose ? "100%" : 220,  /* fill mobile drawer container, fixed on desktop */
        minWidth: onClose ? "100%" : 220,
        background: "#0D0D0D",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Wordmark */}
      <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => { navigate("/app/dashboard"); onClose?.(); }}
          style={{ fontFamily: FONT, fontWeight: 600, fontSize: 16, color: "#ffffff", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          Corex
        </button>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8, border: "none",
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Nav items */}
      <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={active === item.path}
            onClick={item.action}
            premium={item.premium}
          />
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "16px 12px" }} />

      {/* History */}
      <div style={{ padding: "0 8px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={{ fontSize: 10, fontFamily: FONT, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", textTransform: "uppercase", padding: "0 10px 8px" }}>
          History
        </p>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {history.length === 0 ? (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", padding: "6px 10px", fontFamily: FONT }}>
              No conversations yet
            </p>
          ) : (
            history.map((h, i) => (
              <motion.button
                key={h.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  if (typeof window.__corex_loadConversation === "function") {
                    window.__corex_loadConversation(h);
                  }
                  navigate("/app/chat");
                  onClose?.();
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  fontFamily: FONT,
                  textAlign: "left",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              >
                {(h.title || "Untitled").slice(0, 28)}
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Bottom credit pill */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button
          onClick={() => { document.dispatchEvent(new CustomEvent("corex:openCredits")); onClose?.(); }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            width: "100%", padding: "8px 12px", borderRadius: 10,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.6)", fontSize: 13,
            fontFamily: "'Instrument Sans', sans-serif", cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
        >
          ⚡ {sidebarCredits} credits
        </button>
      </div>
    </div>
  );
}

/* ─── Top Bar ─── */
function TopBar({ userName, navigate, onNewChat, onCreditClick }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [credits, setCredits] = useState(getCredits);
  const initials = (userName || localStorage.getItem("corex_user_name") || "CX").slice(0, 2).toUpperCase();
  const isEmpty = credits === 0;
  const isLow   = !isEmpty && credits < 30;

  // Refresh credits on focus
  useEffect(() => {
    const refresh = () => setCredits(getCredits());
    window.addEventListener("focus", refresh);
    const interval = setInterval(refresh, 5000);
    return () => { window.removeEventListener("focus", refresh); clearInterval(interval); };
  }, []);

  const signOut = () => {
    ["isLoggedIn","isVerified","sessionToken","sessionExpiry"].forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
    navigate("/");
  };

  // Credit pill derived styles
  const pillBorder = isEmpty ? "rgba(255,100,100,0.5)" : isLow ? "rgba(255,234,113,0.5)" : "rgba(255,255,255,0.07)";
  const pillColor  = isEmpty ? "#ff6b6b"               : isLow ? "#FFEA71"               : "rgba(255,255,255,0.7)";
  const pillBg     = isEmpty || isLow ? "transparent"  : "rgba(255,255,255,0.06)";
  const pillLabel  = isEmpty ? "⚡ Top up" : isLow ? `⚡ ${credits} left` : `⚡ ${credits} credits`;

  return (
    <div
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        flexShrink: 0,
        position: "relative",
        zIndex: 50,
        background: "#000000",
      }}
    >
      {/* Left: wordmark */}
      <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 16, color: "#ffffff" }}>Corex</span>

      {/* Right: credit pill + settings + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Credit pill — 3 states */}
        <button
          onClick={onCreditClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 14px",
            borderRadius: 100,
            background: pillBg,
            border: `1px solid ${pillBorder}`,
            cursor: "pointer",
            fontFamily: FONT,
            fontSize: 13,
            color: pillColor,
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#ffffff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = pillBorder; e.currentTarget.style.color = pillColor; }}
        >
          {pillLabel}
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate("/app/settings")}
          title="Settings"
          style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "transparent", color: "rgba(255,255,255,0.4)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        {/* Avatar */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowDropdown((p) => !p)}
            style={{
              width: 32, height: 32, borderRadius: "50%", border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
              color: "#000000", fontSize: 12, fontWeight: 600, fontFamily: FONT,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {initials}
          </button>
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "fixed", right: 16, top: 64,
                  width: 180, background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, padding: "8px 0", zIndex: 9999,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                }}
              >
                {[
                  { label: "Dashboard", action: () => { navigate("/app/dashboard"); setShowDropdown(false); } },
                  { label: "Settings",  action: () => { navigate("/app/settings");  setShowDropdown(false); } },
                  { label: "Top up",    action: () => { setShowDropdown(false); document.dispatchEvent(new CustomEvent("corex:openCredits")); } },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      width: "100%", padding: "10px 16px", border: "none",
                      background: "transparent", color: "rgba(255,255,255,0.7)",
                      fontSize: 14, fontFamily: FONT, textAlign: "left", cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#ffffff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  >
                    {item.label}
                  </button>
                ))}
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />
                <button
                  onClick={signOut}
                  style={{
                    width: "100%", padding: "10px 16px", border: "none",
                    background: "transparent", color: "#f87171",
                    fontSize: 14, fontFamily: FONT, textAlign: "left", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.06)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── Admin Bar (admin only, hidden from regular users) ─── */
function AdminBar() {
  const [model, setModel] = useState(localStorage.getItem("corex_model_override") || "gpt-4o");
  const [plan, setPlanKey] = useState(localStorage.getItem("corex_plan") || "free");

  const selectStyle = {
    background: "#2d1a4e", border: "1px solid #5b21b6", color: "#ffffff",
    borderRadius: 8, padding: "4px 10px", fontSize: 12, fontFamily: FONT, cursor: "pointer",
  };

  return (
    <div style={{
      height: 36, display: "flex", alignItems: "center", gap: 12, padding: "0 16px",
      background: "#1a0a2e", borderBottom: "1px solid #3d1a6e", flexShrink: 0, zIndex: 100,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.5px" }}>Admin</span>
      <select value={model} onChange={(e) => { setModel(e.target.value); localStorage.setItem("corex_model_override", e.target.value); }} style={selectStyle}>
        <option value="gpt-4o-mini">GPT-4o Mini</option>
        <option value="gpt-4o">GPT-4o Full</option>
      </select>
      <select value={plan} onChange={(e) => {
        setPlanKey(e.target.value);
        localStorage.setItem("corex_plan", e.target.value);
        const theme = getPlanTheme(e.target.value);
        applyTheme(theme);
        if (window.__corex_setTheme) window.__corex_setTheme(e.target.value);
      }} style={selectStyle}>
        {Object.keys(PLAN_THEMES).map((k) => (
          <option key={k} value={k}>{PLAN_THEMES[k]?.name || k}</option>
        ))}
      </select>
    </div>
  );
}

/* ─── AppShell ─── */
export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isVerified = localStorage.getItem("isVerified") === "true";

  // Session expiry
  useEffect(() => {
    const expiry = localStorage.getItem("sessionExpiry");
    if (expiry && Date.now() > parseInt(expiry, 10)) {
      ["isLoggedIn","isVerified","sessionToken","sessionExpiry"].forEach((k) => localStorage.removeItem(k));
      navigate("/app", { replace: true });
    }
  }, [location.pathname]);

  // Listen for credit modal trigger from dropdown / sidebar
  useEffect(() => {
    const handler = () => setCreditModalOpen(true);
    document.addEventListener("corex:openCredits", handler);
    return () => document.removeEventListener("corex:openCredits", handler);
  }, []);

  // ESC key closes mobile menu
  useEffect(() => {
    const escHandler = (e) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
    document.addEventListener('keydown', escHandler);
    return () => document.removeEventListener('keydown', escHandler);
  }, []);

  const handleNewChat = useCallback(() => {
    if (typeof window.__corex_newChat === "function") window.__corex_newChat();
    if (!location.pathname.includes("/chat")) navigate("/app/chat");
  }, [location.pathname, navigate]);

  const handleLoadConversation = useCallback((conv) => {
    if (typeof window.__corex_loadConversation === "function") {
      window.__corex_loadConversation(conv);
    }
    if (!location.pathname.includes("/chat")) navigate("/app/chat");
  }, [location.pathname, navigate]);

  if (!isLoggedIn || !isVerified) {
    return (
      <AuthFlow
        onSuccess={() => {
          const skipProfile = localStorage.getItem("corex_skip_profile") === "true";
          const profileDone = localStorage.getItem("corex_profile_done") === "true";
          if (!skipProfile && !profileDone && !hasProfile()) {
            navigate("/app/profile-setup", { replace: true });
          } else {
            navigate("/app/dashboard", { replace: true });
          }
        }}
      />
    );
  }

  const userName  = localStorage.getItem("corex_user_name") || localStorage.getItem("userName") || "";
  const userType  = localStorage.getItem("userType") || "creator";

  const defaultRoute = (() => {
    const skip = localStorage.getItem("corex_skip_profile") === "true";
    const done = localStorage.getItem("corex_profile_done") === "true";
    if (!skip && !done && !hasProfile()) return "profile-setup";
    return "dashboard";
  })();

  const sidebarProps = {
    navigate,
    location,
    onNewChat: handleNewChat,
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#000000",
        position: "relative",
      }}
    >
      {/* Desktop sidebar */}
      <div className="hidden md:flex" style={{ height: "100%" }}>
        <Sidebar {...sidebarProps} />
      </div>

      {/* Mobile sidebar — backdrop and drawer each get their own AnimatePresence
           so exit animations fire properly (fragment children don't animate) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200, backdropFilter: "blur(4px)" }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-sidebar"
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            style={{ position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 201, width: 240 }}
          >
            <Sidebar {...sidebarProps} onClose={() => setMobileMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {isAdmin() && <AdminBar />}

        <TopBar
          userName={userName}
          navigate={navigate}
          onNewChat={handleNewChat}
          onCreditClick={() => setCreditModalOpen(true)}
        />

        {/* Page content */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Routes>
            <Route index element={<Navigate to={defaultRoute} replace />} />
            <Route path="dashboard"     element={<PersonalDashboard userName={userName} userType={userType} />} />
            <Route path="profile-setup" element={<ProfileSetup />} />
            <Route path="settings"      element={<SettingsPage />} />
            <Route path="chat"          element={<ChatDashboard userType={userType} userName={userName} onUpgrade={() => setCreditModalOpen(true)} />} />
            <Route path="projects"      element={<ProjectsPage />} />
            <Route path="competitor-intel" element={<CompetitorIntel />} />
            <Route path="brief-builder"   element={<BriefBuilder />} />
            <Route path="payment"       element={<PaymentPage onBack={() => navigate("/app/dashboard")} userType={userType} />} />
            <Route path="*"             element={<Navigate to={defaultRoute} replace />} />
          </Routes>
        </div>
      </div>

      {/* Credit modal */}
      <CreditModal open={creditModalOpen} onClose={() => setCreditModalOpen(false)} />
    </div>
  );
}
