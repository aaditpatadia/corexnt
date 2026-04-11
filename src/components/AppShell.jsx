import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthFlow          from "./AuthFlow";
import ChatDashboard     from "../pages/app/ChatDashboard";
import PersonalDashboard from "../pages/app/PersonalDashboard";
import ProfileSetup      from "../pages/app/ProfileSetup";
import ReelScripts       from "../pages/app/ReelScripts";
import GrowthAudit       from "../pages/app/GrowthAudit";
import Templates         from "../pages/app/Templates";
import History           from "../pages/app/History";
import PaymentPage       from "./PaymentPage";
import TrendEngine       from "../pages/app/TrendEngine";
import BrandDeals        from "../pages/app/BrandDeals";
import CampaignBuilder   from "../pages/app/CampaignBuilder";
import BudgetAllocator   from "../pages/app/BudgetAllocator";
import BrandAudit        from "../pages/app/BrandAudit";
import CompetitorIntel   from "../pages/app/CompetitorIntel";
import Reports           from "../pages/app/Reports";
import Team              from "../pages/app/Team";
import ModesPage         from "../pages/app/ModesPage";
import ProjectsPage      from "../pages/app/ProjectsPage";
import SettingsPage      from "../pages/SettingsPage";
import { hasProfile }    from "../utils/userProfile";

/* ─── Sidebar ─── */
function Sidebar({ open, onClose, navigate, location, userName, onNewChat, onUpgrade }) {
  const history = (() => {
    try { return JSON.parse(localStorage.getItem("corex_history") || "[]").slice(0, 10); }
    catch { return []; }
  })();

  const initials = (userName || "CX").slice(0, 2).toUpperCase();
  const active   = location.pathname.replace("/app/", "").split("/")[0] || "dashboard";

  const navItems = [
    { icon: "📁", label: "Projects",     path: "projects" },
    { icon: "📄", label: "My Resources", path: "history" },
    { icon: "⊞",  label: "Modes",        path: "modes" },
  ];

  const content = (
    <div
      style={{
        width: 260,
        background: "#222222",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
        overflowY: "auto",
      }}
    >
      {/* Logo + grid */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 20px 16px",
        }}
      >
        <button
          onClick={() => { navigate("/app/dashboard"); onClose?.(); }}
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#ffffff",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Corex
        </button>
        <button
          onClick={() => { navigate("/app/dashboard"); onClose?.(); }}
          style={{
            color: "rgba(255,255,255,0.4)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: 4,
          }}
          title="Dashboard"
        >
          ⊞
        </button>
      </div>

      {/* Nav items */}
      <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(({ icon, label, path }) => (
          <button
            key={path}
            onClick={() => { navigate(`/app/${path}`); onClose?.(); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 10px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: 14,
              fontWeight: active === path ? 600 : 400,
              color: active === path ? "#ffffff" : "rgba(255,255,255,0.6)",
              background: active === path ? "rgba(255,255,255,0.08)" : "transparent",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { if (active !== path) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#ffffff"; } }}
            onMouseLeave={(e) => { if (active !== path) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; } }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* History */}
      <div style={{ padding: "0 12px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 16 }}>🕐</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'Instrument Sans', sans-serif",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            History
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {history.length === 0 ? (
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.25)",
                padding: "6px 10px",
                fontFamily: "'Instrument Sans', sans-serif",
              }}
            >
              No conversations yet
            </p>
          ) : (
            history.map((h) => (
              <button
                key={h.id}
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
                  padding: "7px 10px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 13,
                  fontFamily: "'Instrument Sans', sans-serif",
                  textAlign: "left",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 200,
                  marginBottom: 2,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
              >
                {h.title || "Untitled"}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return content;
}

/* ─── Top-right bar ─── */
function TopRightBar({ userName, onUpgrade, navigate, onNewChat, onMobileMenuOpen }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const initials = (userName || "CX").slice(0, 2).toUpperCase();

  const signOut = () => {
    ["isLoggedIn","isVerified","sessionToken","sessionExpiry"].forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
    navigate("/");
  };

  const msgsLeft = (() => {
    const today = new Date().toDateString();
    const used  = parseInt(localStorage.getItem(`corex_msgs_${today}`) || "0", 10);
    return Math.max(0, 15 - used);
  })();

  return (
    <div
      style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "transparent",
        flexShrink: 0,
      }}
    >
      {/* Left: hamburger (mobile only) + new chat button */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Hamburger — mobile only */}
        <button
          className="md:hidden"
          onClick={onMobileMenuOpen}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.08)",
            color: "#ffffff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          ☰
        </button>

        {/* New chat */}
        <button
          onClick={() => {
            if (typeof window.__corex_newChat === "function") window.__corex_newChat();
            navigate("/app/chat");
          }}
          title="New chat"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Right: msgs indicator + settings + upgrade + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {msgsLeft <= 5 && (
          <button
            onClick={onUpgrade}
            style={{
              fontSize: 12,
              color: msgsLeft === 0 ? "#f87171" : "rgba(255,255,255,0.4)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Instrument Sans', sans-serif",
            }}
          >
            {msgsLeft === 0 ? "No messages left" : `${msgsLeft} left`}
          </button>
        )}

        {/* Settings */}
        <button
          onClick={() => navigate("/app/settings")}
          title="Settings"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        {/* Upgrade */}
        <button
          onClick={onUpgrade}
          style={{
            padding: "8px 20px",
            borderRadius: 100,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
            color: "#000000",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Instrument Sans', sans-serif",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          Upgrade
        </button>

        {/* Avatar */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowDropdown(p => !p)}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
              color: "#000000",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Instrument Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  width: 180,
                  background: "#2a2a2a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "8px 0",
                  zIndex: 100,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                }}
              >
                {[
                  { label: "Dashboard",  action: () => { navigate("/app/dashboard"); setShowDropdown(false); } },
                  { label: "Settings",   action: () => { navigate("/app/settings");  setShowDropdown(false); } },
                  { label: "Upgrade",    action: () => { navigate("/app/payment");   setShowDropdown(false); } },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      border: "none",
                      background: "transparent",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 14,
                      fontFamily: "'Instrument Sans', sans-serif",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s",
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
                    width: "100%",
                    padding: "10px 16px",
                    border: "none",
                    background: "transparent",
                    color: "#f87171",
                    fontSize: 14,
                    fontFamily: "'Instrument Sans', sans-serif",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.15s",
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

/* ─── AppShell ─── */
export default function AppShell() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isVerified = localStorage.getItem("isVerified") === "true";

  // Session expiry check
  useEffect(() => {
    const expiry = localStorage.getItem("sessionExpiry");
    if (expiry && Date.now() > parseInt(expiry, 10)) {
      ["isLoggedIn","isVerified","sessionToken","sessionExpiry"].forEach(k => localStorage.removeItem(k));
      navigate("/app", { replace: true });
    }
  }, [location.pathname]);

  const handleLoadConversation = useCallback((conv) => {
    if (typeof window.__corex_loadConversation === "function") {
      window.__corex_loadConversation(conv);
    }
    if (!location.pathname.includes("/chat")) navigate("/app/chat");
  }, [location.pathname, navigate]);

  const handleNewChat = useCallback(() => {
    if (typeof window.__corex_newChat === "function") window.__corex_newChat();
    if (!location.pathname.includes("/chat")) navigate("/app/chat");
  }, [location.pathname, navigate]);

  if (!isLoggedIn || !isVerified) {
    return <AuthFlow onSuccess={() => {
      const skipProfile = localStorage.getItem("corex_skip_profile") === "true";
      const profileDone = localStorage.getItem("corex_profile_done") === "true";
      if (!skipProfile && !profileDone && !hasProfile()) {
        navigate("/app/profile-setup", { replace: true });
      } else {
        navigate("/app/dashboard", { replace: true });
      }
    }} />;
  }

  const userType  = localStorage.getItem("userType")  || "creator";
  const userName  = localStorage.getItem("userName")  || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  const defaultRoute = (() => {
    const skip = localStorage.getItem("corex_skip_profile") === "true";
    const done = localStorage.getItem("corex_profile_done") === "true";
    if (!skip && !done && !hasProfile()) return "profile-setup";
    return "dashboard";
  })();

  const sidebarProps = {
    navigate,
    location,
    userName,
    onNewChat: handleNewChat,
    onUpgrade: () => navigate("/app/payment"),
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#000000",
        animation: "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Desktop sidebar */}
      <div className="hidden md:flex" style={{ height: "100%" }}>
        <Sidebar {...sidebarProps} />
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 200,
              }}
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                height: "100vh",
                zIndex: 201,
              }}
            >
              <Sidebar {...sidebarProps} onClose={() => setMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Top-right bar */}
        <TopRightBar
          userName={userName}
          onUpgrade={() => navigate("/app/payment")}
          navigate={navigate}
          onNewChat={handleNewChat}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
        />

        {/* Page content */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            position: "relative",
            animation: "fadeUp 0.3s ease both",
          }}
        >
          <Routes>
            <Route index element={<Navigate to={defaultRoute} replace />} />
            <Route path="dashboard"        element={<PersonalDashboard userType={userType} userName={userName} />} />
            <Route path="profile-setup"    element={<ProfileSetup userType={userType} userName={userName} />} />
            <Route path="settings"         element={<SettingsPage userType={userType} />} />
            <Route path="chat"             element={<ChatDashboard userType={userType} userName={userName} onUpgrade={() => navigate("/app/payment")} />} />
            <Route path="modes"            element={<ModesPage />} />
            <Route path="projects"         element={<ProjectsPage />} />
            <Route path="reel-scripts"     element={<ReelScripts />} />
            <Route path="growth-audit"     element={<GrowthAudit />} />
            <Route path="templates"        element={<Templates />} />
            <Route path="history"          element={<History />} />
            <Route path="payment"          element={<PaymentPage onBack={() => navigate("/app/dashboard")} userType={userType} />} />
            <Route path="trend-engine"     element={<TrendEngine />} />
            <Route path="brand-deals"      element={<BrandDeals />} />
            <Route path="campaign-builder" element={<CampaignBuilder />} />
            <Route path="budget-allocator" element={<BudgetAllocator />} />
            <Route path="brand-audit"      element={<BrandAudit />} />
            <Route path="competitor-intel" element={<CompetitorIntel />} />
            <Route path="reports"          element={<Reports />} />
            <Route path="team"             element={<Team />} />
            <Route path="*"                element={<Navigate to={defaultRoute} replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
