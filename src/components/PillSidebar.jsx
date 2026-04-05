import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const IC = {
  Chat:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Film:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M10 9L15 12L10 15V9Z" fill="currentColor" stroke="none"/></svg>,
  ChartUp:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 18L8 11L13 14L18 7L21 10"/><path d="M21 6V10H17"/></svg>,
  Fire:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22c4.418 0 8-3.582 8-8 0-5-4-8-5-10-1 3-3 4-3 4S9 5 7 8c-1 2-1 4-.5 5.5C5 16 7 19 12 22z"/></svg>,
  Handshake:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 12l6-6M3 18l4-4M15 6l4 4-8 8-4-4 8-8z"/></svg>,
  Grid:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>,
  Clock:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  Megaphone:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 4L16 8H6C4.895 8 4 8.895 4 10v4c0 1.105.895 2 2 2h2l1 4h2l1-4"/><path d="M16 8l6 4-6 4V8z"/></svg>,
  PieChart: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v9h9"/><circle cx="12" cy="12" r="9"/></svg>,
  Shield:   <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3L4 7v5c0 5 4 9 8 10 4-1 8-5 8-10V7l-8-4z"/></svg>,
  Eye:      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3"/></svg>,
  FileChart:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 18v-4M12 18v-6M16 18v-2"/></svg>,
  Users:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="7" r="4"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 11a4 4 0 1 1 3 6.7"/><path d="M21 20v-1a6 6 0 0 0-1.3-3.7"/></svg>,
  Zap:      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
};

const CREATOR_NAV = [
  { id:"chat",         label:"Chat",           icon:IC.Chat      },
  { id:"reel-scripts", label:"Reel Scripts",   icon:IC.Film      },
  { id:"growth-audit", label:"Growth Audit",   icon:IC.ChartUp   },
  { id:"trend-engine", label:"Trend Engine",   icon:IC.Fire      },
  { id:"brand-deals",  label:"Brand Deals",    icon:IC.Handshake },
  { id:"templates",    label:"Templates",      icon:IC.Grid      },
  { id:"history",      label:"History",        icon:IC.Clock     },
];
const COMPANY_NAV = [
  { id:"chat",               label:"Chat",             icon:IC.Chat      },
  { id:"campaign-builder",   label:"Campaign Builder", icon:IC.Megaphone },
  { id:"budget-allocator",   label:"Budget Allocator", icon:IC.PieChart  },
  { id:"brand-audit",        label:"Brand Audit",      icon:IC.Shield    },
  { id:"competitor-intel",   label:"Competitor Intel", icon:IC.Eye       },
  { id:"reports",            label:"Reports",          icon:IC.FileChart },
  { id:"team",               label:"Team",             icon:IC.Users     },
  { id:"history",            label:"History",          icon:IC.Clock     },
];

function ProgressRing({ used, total, expanded }) {
  const r = 22, circ = 2 * Math.PI * r;
  const pct  = Math.max(0, Math.min(1, used / total));
  const dash = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-1.5 py-3">
      <div className="relative flex items-center justify-center" style={{ width:52, height:52 }}>
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(45,214,104,0.1)" strokeWidth="3"/>
          <circle cx="26" cy="26" r={r} fill="none" stroke="#2dd668" strokeWidth="3"
            strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
            className="ring-progress" style={{ transition:"stroke-dashoffset 0.6s ease" }}/>
        </svg>
        <span className="absolute text-xs font-bold" style={{ color:"#f0faf2", fontFamily:"var(--font-body)" }}>
          {total - used}
        </span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="text-xs whitespace-nowrap" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>
            messages left
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PillSidebar({ userType="creator", activeTab, msgLeft=10, onUpgrade, userName="" }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const nav  = userType === "company" ? COMPANY_NAV : CREATOR_NAV;
  const used = 10 - Math.max(0, msgLeft);

  return (
    <motion.aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      animate={{ width: expanded ? 216 : 64 }}
      transition={{ duration:0.4, ease:[0.34,1.56,0.64,1] }}
      className="hidden md:flex flex-col h-full overflow-hidden flex-shrink-0"
      style={{
        margin:"16px 0 16px 16px",
        borderRadius:24,
        background:"rgba(10,20,12,0.92)",
        border:"1px solid rgba(45,214,104,0.2)",
        backdropFilter:"blur(20px)",
        boxShadow:"0 0 40px rgba(0,0,0,0.4)",
        position:"relative",
        zIndex:30,
      }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3.5 flex-shrink-0 overflow-hidden">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
          style={{ background:"rgba(45,214,104,0.15)", border:"1px solid rgba(45,214,104,0.3)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
          CX
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} transition={{ duration:0.18 }}
              className="ml-2.5 overflow-hidden whitespace-nowrap">
              <div className="text-sm font-bold leading-none text-white" style={{ fontFamily:"var(--font-body)" }}>Corex</div>
              {userName && <div className="text-xs mt-0.5 truncate max-w-[130px]" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>{userName}</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto scroll-area space-y-0.5">
        {nav.map((item) => {
          const active = activeTab === item.id;
          return (
            <button key={item.id}
              onClick={() => navigate(`/app/${item.id}`)}
              title={!expanded ? item.label : undefined}
              className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-200 overflow-hidden"
              style={{
                background: active ? "rgba(45,214,104,0.12)" : "transparent",
                border:     active ? "1px solid rgba(45,214,104,0.25)" : "1px solid transparent",
                color:      active ? "#2dd668" : "rgba(240,250,242,0.5)",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color="#f0faf2"; e.currentTarget.style.background="rgba(45,214,104,0.05)"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color="rgba(240,250,242,0.5)"; e.currentTarget.style.background="transparent"; }}}>
              <span className="flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {expanded && (
                  <motion.span initial={{ opacity:0, width:0 }} animate={{ opacity:1, width:"auto" }} exit={{ opacity:0, width:0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden" style={{ fontFamily:"var(--font-body)" }}>
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Progress ring + upgrade */}
      <div className="px-2 pb-3 flex flex-col items-center">
        <ProgressRing used={used} total={10} expanded={expanded} />
        <motion.button onClick={onUpgrade} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm btn-green overflow-hidden"
          style={{ color:"#050a06", borderRadius:14 }}>
          {IC.Zap}
          <AnimatePresence>
            {expanded && (
              <motion.span initial={{ opacity:0, width:0 }} animate={{ opacity:1, width:"auto" }} exit={{ opacity:0, width:0 }}
                className="whitespace-nowrap overflow-hidden text-sm" style={{ fontFamily:"var(--font-body)" }}>
                Upgrade
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}
