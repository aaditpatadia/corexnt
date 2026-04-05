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
import ComingSoon      from "./ComingSoon";

// ── coming-soon page configs ──────────────────────────────────────
const CS_PAGES = {
  "trend-engine": {
    title:"Trend Engine", icon:"🔥",
    description:"Real-time trending topics in your niche, delivered daily with pre-written scripts.",
    features:["Daily trend alerts","Pre-written reel scripts for each trend","Trending audio recommendations","Competitor content monitoring"],
    estimatedDate:"Q2 2026",
  },
  "brand-deals": {
    title:"Brand Deal Kit", icon:"🤝",
    description:"Everything you need to land, price, and close brand partnerships.",
    features:["Media kit generator","Brand deal pricing calculator","Pitch email templates","Contract templates","Rate negotiation guide"],
    estimatedDate:"Q2 2026",
  },
  "campaign-builder": {
    title:"Campaign Builder", icon:"🚀",
    description:"Build full marketing campaigns with strategy, timeline, and KPIs in minutes.",
    features:["Full campaign strategy generation","Influencer brief creator","Content calendar builder","KPI tracking setup"],
    estimatedDate:"Q3 2026",
  },
  "budget-allocator": {
    title:"Budget Allocator", icon:"💼",
    description:"Allocate your marketing budget with AI precision across every channel.",
    features:["AI-powered budget split","Channel recommendation engine","ROI prediction model","Monthly reallocation suggestions"],
    estimatedDate:"Q3 2026",
  },
  "brand-audit": {
    title:"Brand Audit", icon:"🛡️",
    description:"Get a full report on your brand's positioning, messaging, and identity.",
    features:["Brand positioning analysis","Messaging clarity score","Visual identity review","Competitor comparison report"],
    estimatedDate:"Q3 2026",
  },
  "competitor-intel": {
    title:"Competitor Intel", icon:"🔍",
    description:"Know exactly what your competitors are doing before it's too late.",
    features:["Content strategy analysis","Posting frequency tracking","Engagement benchmark comparison","Gap opportunity finder"],
    estimatedDate:"Q4 2026",
  },
  "reports": {
    title:"Reports", icon:"📊",
    description:"Monthly performance reports with growth charts you can actually share.",
    features:["Monthly performance reports","Growth trajectory charts","Export to PDF","Team sharing"],
    estimatedDate:"Q4 2026",
  },
  "team": {
    title:"Team Collaboration", icon:"👥",
    description:"Work with your team inside Corex — share, comment, assign, build together.",
    features:["Multiple team members","Shared workspace","Comment on responses","Role-based access"],
    estimatedDate:"Q4 2026",
  },
};

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

            {/* Coming soon pages */}
            {Object.entries(CS_PAGES).map(([slug, cfg]) => (
              <Route key={slug} path={slug} element={<ComingSoon {...cfg} />} />
            ))}

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
