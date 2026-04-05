import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import AuthFlow        from "./AuthFlow";
import TopBar          from "./TopBar";
import ChatDashboard   from "../pages/app/ChatDashboard";
import ReelScripts     from "../pages/app/ReelScripts";
import GrowthAudit     from "../pages/app/GrowthAudit";
import Templates       from "../pages/app/Templates";
import History         from "../pages/app/History";
import PaymentPage     from "./PaymentPage";
import TrendEngine     from "../pages/app/TrendEngine";
import BrandDeals      from "../pages/app/BrandDeals";
import CampaignBuilder from "../pages/app/CampaignBuilder";
import BudgetAllocator from "../pages/app/BudgetAllocator";
import BrandAudit      from "../pages/app/BrandAudit";
import CompetitorIntel from "../pages/app/CompetitorIntel";
import Reports         from "../pages/app/Reports";
import Team            from "../pages/app/Team";

export default function AppShell() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isVerified = localStorage.getItem("isVerified") === "true";

  // Session expiry check
  useEffect(() => {
    const expiry = localStorage.getItem("sessionExpiry");
    if (expiry && Date.now() > parseInt(expiry, 10)) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isVerified");
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("sessionExpiry");
      navigate("/app", { replace:true });
    }
  }, [location.pathname]);

  if (!isLoggedIn || !isVerified) {
    return <AuthFlow onSuccess={() => navigate("/app/chat", { replace:true })} />;
  }

  const userType  = localStorage.getItem("userType")  || "creator";
  const userName  = localStorage.getItem("userName")   || "";
  const userEmail = localStorage.getItem("userEmail")  || "";

  const handleLoadConversation = (conv) => {
    // Chat dashboard reads from window.__corex_loadConversation
    if (typeof window.__corex_loadConversation === "function") {
      window.__corex_loadConversation(conv);
    }
    // Navigate to chat if not already there
    if (!location.pathname.includes("/chat")) {
      navigate("/app/chat");
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background:"var(--bg-base)" }}>
      {/* Ambient orbs */}
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

      {/* Top bar — replaces pill sidebar */}
      <TopBar
        userType={userType}
        userName={userName}
        userEmail={userEmail}
        onUpgrade={() => navigate("/app/payment")}
        onLoadConversation={handleLoadConversation}
      />

      {/* Main content */}
      <div className="flex-1 overflow-hidden relative z-10">
        <Routes>
          <Route index element={<Navigate to="chat" replace />} />
          <Route path="chat"             element={<ChatDashboard userType={userType} userName={userName} onUpgrade={() => navigate("/app/payment")} />} />
          <Route path="reel-scripts"     element={<ReelScripts />} />
          <Route path="growth-audit"     element={<GrowthAudit />} />
          <Route path="templates"        element={<Templates />} />
          <Route path="history"          element={<History />} />
          <Route path="payment"          element={<PaymentPage onBack={() => navigate("/app/chat")} userType={userType} />} />
          <Route path="trend-engine"     element={<TrendEngine />} />
          <Route path="brand-deals"      element={<BrandDeals />} />
          <Route path="campaign-builder" element={<CampaignBuilder />} />
          <Route path="budget-allocator" element={<BudgetAllocator />} />
          <Route path="brand-audit"      element={<BrandAudit />} />
          <Route path="competitor-intel" element={<CompetitorIntel />} />
          <Route path="reports"          element={<Reports />} />
          <Route path="team"             element={<Team />} />
          <Route path="*" element={<Navigate to="chat" replace />} />
        </Routes>
      </div>
    </div>
  );
}
