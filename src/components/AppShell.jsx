import { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import AuthFlow        from "./AuthFlow";
import PillSidebar     from "./PillSidebar";
import BottomNav       from "./BottomNav";
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
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const navigate   = useNavigate();
  const location   = useLocation();

  // Auth check
  if (!isLoggedIn) {
    return <AuthFlow onSuccess={() => navigate("/app/chat", { replace:true })} />;
  }

  const userType  = localStorage.getItem("userType") || "creator";
  const userName  = localStorage.getItem("userName")  || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  // Calculate messages left from date-keyed counter
  const _dateKey  = new Date().toISOString().slice(0,10);
  const _used     = parseInt(localStorage.getItem("corex_messages_" + _dateKey) || "0", 10);
  const _msgLeft  = Math.max(0, 10 - _used);

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("corex_chat");
    navigate("/");
  };

  const currentPath = location.pathname.replace("/app/","").replace("/app","") || "chat";

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background:"var(--bg-base)" }}>
      {/* Orbs */}
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

      {/* Sidebar */}
      <PillSidebar
        userType={userType}
        activeTab={currentPath}
        msgLeft={_msgLeft}
        onUpgrade={() => navigate("/app/payment")}
        userName={userName}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 relative z-10">

        {/* Top bar */}
        <div className="flex items-center justify-between h-14 px-5 flex-shrink-0 md:px-6"
          style={{ borderBottom:"1px solid rgba(45,214,104,0.07)", background:"rgba(5,10,6,0.88)", backdropFilter:"blur(20px)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/app/chat")}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}
              onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
              ← Dashboard
            </button>
            <div className="w-px h-4" style={{ background:"rgba(45,214,104,0.15)" }}/>
            <span className="text-sm font-medium capitalize" style={{ color:"rgba(240,250,242,0.7)", fontFamily:"var(--font-body)" }}>
              {currentPath.replace(/-/g," ")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* User avatar */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{ background:"rgba(45,214,104,0.15)", border:"1px solid rgba(45,214,104,0.3)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
                {userName.slice(0,2).toUpperCase()||"CX"}
              </div>
              <span className="hidden md:block text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
                {userName||userEmail}
              </span>
            </div>
            {/* Logout */}
            <button onClick={logout} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ color:"var(--text-muted)", border:"1px solid rgba(45,214,104,0.1)" }}
              onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route index element={<Navigate to="chat" replace />} />
            <Route path="chat"             element={<ChatDashboard userType={userType} userName={userName} onUpgrade={()=>navigate("/app/payment")} />} />
            <Route path="reel-scripts"     element={<ReelScripts />} />
            <Route path="growth-audit"     element={<GrowthAudit />} />
            <Route path="templates"        element={<Templates />} />
            <Route path="history"          element={<History />} />
            <Route path="payment"          element={<PaymentPage onBack={()=>navigate("/app/chat")} userType={userType} />} />
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

      {/* Mobile bottom nav */}
      <BottomNav
        activeTab={currentPath}
        onTabChange={(tab) => navigate(`/app/${tab}`)}
        onUpgrade={() => navigate("/app/payment")}
        userType={userType}
      />
    </div>
  );
}
