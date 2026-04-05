import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NAV_CREATOR = [
  { id:"chat",         label:"Chat",      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { id:"reel-scripts", label:"Scripts",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M10 9L15 12L10 15V9Z" fill="currentColor" stroke="none"/></svg> },
  { id:"history",      label:"History",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg> },
  { id:"payment",      label:"Upgrade",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
];
const NAV_COMPANY = [
  { id:"chat",              label:"Chat",     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { id:"campaign-builder",  label:"Campaigns",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 4L16 8H6C4.895 8 4 8.895 4 10v4c0 1.105.895 2 2 2h2l1 4h2l1-4"/><path d="M16 8l6 4-6 4V8z"/></svg> },
  { id:"history",           label:"History",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg> },
  { id:"payment",           label:"Upgrade",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
];

export default function BottomNav({ activeTab, onTabChange, onUpgrade, userType="creator" }) {
  const navigate = useNavigate();
  const nav = userType === "company" ? NAV_COMPANY : NAV_CREATOR;

  const handleClick = (id) => {
    if (id === "payment") { onUpgrade?.(); return; }
    navigate(`/app/${id}`);
    onTabChange?.(id);
  };

  return (
    <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 px-2 py-2 rounded-full"
        style={{ background:"rgba(10,20,12,0.95)", border:"1px solid rgba(45,214,104,0.25)", backdropFilter:"blur(20px)", boxShadow:"0 8px 40px rgba(0,0,0,0.5)" }}>
        {nav.map((item) => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => handleClick(item.id)}
              className="relative flex flex-col items-center justify-center rounded-full transition-all duration-300"
              style={{ width:52, height:52, color: active ? "#050a06" : "rgba(240,250,242,0.45)" }}>
              {active && (
                <motion.div layoutId="bottomNavActive" className="absolute inset-0 rounded-full"
                  style={{ background:"#2dd668" }} transition={{ type:"spring", stiffness:400, damping:35 }}/>
              )}
              <span className="relative z-10">{item.icon}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
