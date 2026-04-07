import { useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import AuthFlow          from "./AuthFlow";
import TopBar            from "./TopBar";
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
import SettingsPage      from "../pages/SettingsPage";
import { hasProfile }    from "../utils/userProfile";

export default function AppShell() {
  const navigate  = useNavigate();
  const location  = useLocation();

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

  // These hooks must be declared before any early return (rules of hooks)
  const handleLoadConversation = useCallback((conv) => {
    if (typeof window.__corex_loadConversation === "function") {
      window.__corex_loadConversation(conv);
    }
    if (!location.pathname.includes("/chat")) {
      navigate("/app/chat");
    }
  }, [location.pathname, navigate]);

  const handleNewChat = useCallback(() => {
    if (typeof window.__corex_newChat === "function") {
      window.__corex_newChat();
    }
    if (!location.pathname.includes("/chat")) {
      navigate("/app/chat");
    }
  }, [location.pathname, navigate]);

  if (!isLoggedIn || !isVerified) {
    return <AuthFlow onSuccess={() => {
      // After login: check for profile, go to profile-setup or dashboard
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

  // Default route: dashboard (profile-setup if no profile and not skipped)
  const defaultRoute = (() => {
    const skip = localStorage.getItem("corex_skip_profile") === "true";
    const done = localStorage.getItem("corex_profile_done") === "true";
    if (!skip && !done && !hasProfile()) return "profile-setup";
    return "dashboard";
  })();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: "var(--bg-base)", animation: "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
      {/* Ambient orbs */}
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

      {/* Top bar */}
      <TopBar
        userType={userType}
        userName={userName}
        userEmail={userEmail}
        onUpgrade={() => navigate("/app/payment")}
        onLoadConversation={handleLoadConversation}
        onNewChat={handleNewChat}
      />

      {/* Main content */}
      <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
        <Routes>
          <Route index element={<Navigate to={defaultRoute} replace />} />
          <Route path="dashboard"        element={<PersonalDashboard userType={userType} userName={userName} />} />
          <Route path="profile-setup"    element={<ProfileSetup userType={userType} userName={userName} />} />
          <Route path="settings"         element={<SettingsPage userType={userType} />} />
          <Route path="chat"             element={<ChatDashboard userType={userType} userName={userName} onUpgrade={() => navigate("/app/payment")} />} />
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

      {/* Mobile bottom navigation */}
      <BottomNav
        activeTab={location.pathname.replace("/app/", "").split("/")[0] || "dashboard"}
        userType={userType}
      />
    </div>
  );
}
