import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Home",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    id: "chat",
    label: "Chat",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    id: "tools",
    label: "Tools",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

const TOOL_ROUTES = {
  creator: "reel-scripts",
  company: "campaign-builder",
};

export default function BottomNav({ activeTab, onTabChange, userType = "creator" }) {
  const navigate = useNavigate();

  const handleClick = (id) => {
    if (id === "tools") {
      const route = TOOL_ROUTES[userType] || TOOL_ROUTES.creator;
      navigate(`/app/${route}`);
      onTabChange?.(route);
    } else if (id === "profile") {
      navigate("/app/settings");
      onTabChange?.("settings");
    } else {
      navigate(`/app/${id}`);
      onTabChange?.(id);
    }
  };

  const isActive = (id) => {
    if (id === "tools") return ["reel-scripts","campaign-builder","brand-audit","growth-audit","budget-allocator","trend-engine","competitor-intel","reports","templates"].includes(activeTab);
    if (id === "profile") return activeTab === "settings";
    return activeTab === id;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        height: 60,
        background: "#ffffff",
        borderTop: "1px solid #e8e8e3",
        display: "flex",
        alignItems: "center",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.id);
        return (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: active ? "#1a7a3c" : "#aaaaaa",
              position: "relative",
              transition: "color 0.2s ease",
            }}>
            {active && (
              <motion.div
                layoutId="bottomNavIndicator"
                style={{
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  right: "20%",
                  height: 2,
                  borderRadius: "0 0 3px 3px",
                  background: "#1a7a3c",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span style={{ display: "flex", transition: "transform 0.2s ease", transform: active ? "scale(1.1)" : "scale(1)" }}>
              {item.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, fontFamily: "var(--font-body)", letterSpacing: "0.3px" }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
