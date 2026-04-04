import { motion, AnimatePresence } from "framer-motion";
import {
  Video, TrendingUp, BarChart2, DollarSign, LayoutTemplate,
  Clock, Zap, ChevronLeft, ChevronRight, Megaphone,
  PieChart, Search, Users, FileText, Star,
} from "lucide-react";
import clsx from "clsx";

const CREATOR_NAV = [
  { icon: Video,          label: "Reel Scripts",     id: "reel-scripts" },
  { icon: TrendingUp,     label: "Growth Audit",     id: "growth-audit" },
  { icon: Zap,            label: "Trend Engine",     id: "trend-engine" },
  { icon: DollarSign,     label: "Brand Deals",      id: "brand-deals" },
  { icon: LayoutTemplate, label: "Templates",        id: "templates" },
  { icon: Clock,          label: "History",          id: "history" },
];

const COMPANY_NAV = [
  { icon: Megaphone,      label: "Campaign Builder", id: "campaigns" },
  { icon: PieChart,       label: "Budget Allocator", id: "budget" },
  { icon: Star,           label: "Brand Audit",      id: "brand-audit" },
  { icon: Search,         label: "Competitor Intel", id: "competitor" },
  { icon: FileText,       label: "Reports",          id: "reports" },
  { icon: Users,          label: "Team",             id: "team" },
];

export default function Sidebar({
  collapsed,
  onToggle,
  activeTab,
  onTabChange,
  onQuickAction,
  userType = "creator",
  msgLeft = 10,
  onUpgrade,
  userName = "",
}) {
  const nav = userType === "company" ? COMPANY_NAV : CREATOR_NAV;

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full overflow-hidden flex-shrink-0 z-20"
      style={{
        background: "rgba(8,8,16,0.92)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 flex-shrink-0 border-b border-white/[0.06]">
        <div className="flex items-center gap-3" style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
          <div
            className="w-8 h-8 rounded-xl flex-shrink-0 gradient-purple-blue flex items-center justify-center font-bold text-white text-sm"
            style={{ boxShadow: "0 2px 14px rgba(124,58,237,0.5)", fontFamily: "Sora, sans-serif" }}
          >
            C
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <div className="font-bold text-white text-sm leading-none" style={{ fontFamily: "Sora, sans-serif" }}>
                  Corex
                </div>
                <div className="text-[9px] text-zinc-600 uppercase tracking-widest mt-0.5">
                  {userType === "company" ? "Company OS" : "Creator OS"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User greeting */}
      <AnimatePresence>
        {!collapsed && userName && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pt-3 pb-1"
          >
            <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] text-zinc-600">Welcome back</p>
              <p className="text-xs font-semibold text-zinc-300 truncate">{userName}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scroll-area">
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] uppercase tracking-widest text-zinc-700 px-2 pb-2 pt-1"
            >
              {userType === "company" ? "Tools" : "Studio"}
            </motion.p>
          )}
        </AnimatePresence>

        {nav.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={clsx(
                "w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-violet-600/15 text-violet-300 border border-violet-500/20"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05]",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon size={15} className={active ? "text-violet-400" : ""} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 text-left whitespace-nowrap overflow-hidden text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Message counter */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 pb-2"
          >
            <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Free messages</span>
                <span className="text-[10px] font-bold text-violet-400">{msgLeft}/10</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#7c3aed,#6366f1)" }}
                  animate={{ width: `${(msgLeft / 10) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <p className="text-[10px] text-zinc-700 mt-1.5">
                {msgLeft > 0 ? `${msgLeft} messages remaining` : "Upgrade to continue"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade button */}
      <div className="px-2 pb-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onUpgrade}
          className={clsx(
            "w-full py-2.5 rounded-xl font-semibold text-white text-xs transition-all duration-200 btn-purple",
            collapsed && "px-2"
          )}
        >
          {collapsed ? "⚡" : "⚡ Upgrade"}
        </motion.button>
      </div>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-white/[0.06]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 rounded-xl text-zinc-600
            hover:text-zinc-300 hover:bg-white/[0.05] transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </motion.button>
      </div>
    </motion.aside>
  );
}
