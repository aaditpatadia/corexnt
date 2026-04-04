import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Layers, Clock, Settings, ChevronLeft,
  ChevronRight, Zap, TrendingUp, FileText, Star,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { icon: MessageSquare, label: "AI Chat",   id: "chat",      shortcut: "⌘K" },
  { icon: Layers,        label: "Templates", id: "templates", shortcut: "⌘T" },
  { icon: Clock,         label: "History",   id: "history",   shortcut: "⌘H" },
  { icon: Settings,      label: "Settings",  id: "settings",  shortcut: "⌘," },
];

const QUICK_ACTIONS = [
  { icon: TrendingUp, label: "Growth Strategy", color: "#8B5CF6" },
  { icon: FileText,   label: "Content Ideas",   color: "#3B82F6" },
  { icon: Zap,        label: "Brand Positioning",color: "#F59E0B" },
  { icon: Star,       label: "Creator Pricing",  color: "#10B981" },
];

export default function Sidebar({ collapsed, onToggle, activeTab, onTabChange, onQuickAction }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full glass border-r border-white/[0.07] overflow-hidden flex-shrink-0 z-20"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 flex-shrink-0 border-b border-white/[0.06]">
        <motion.div
          className="flex items-center gap-3"
          animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          {/* Logo mark */}
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-purple-blue flex items-center justify-center shadow-lg"
              style={{ boxShadow: "0 2px 12px rgba(139,92,246,0.45)" }}>
              <span className="text-white font-bold text-sm" style={{ fontFamily: "Syne, sans-serif" }}>C</span>
            </div>
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <div className="font-bold text-white leading-none tracking-tight" style={{ fontFamily: "Syne, sans-serif", fontSize: 15 }}>
                  Corex
                </div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
                  Creative OS
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] uppercase tracking-widest text-zinc-600 px-2 pb-2 pt-1"
            >
              Menu
            </motion.p>
          )}
        </AnimatePresence>

        {NAV.map((item) => {
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
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]",
                collapsed && "justify-center"
              )}
            >
              <Icon size={16} className={active ? "text-violet-400" : ""} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 text-left whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] text-zinc-600 font-mono"
                  >
                    {item.shortcut}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        {/* Quick actions */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4"
            >
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 px-2 pb-2">
                Quick Actions
              </p>
              <div className="space-y-0.5">
                {QUICK_ACTIONS.map((qa) => {
                  const Icon = qa.icon;
                  return (
                    <motion.button
                      key={qa.label}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onQuickAction(qa.label)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-all duration-200"
                    >
                      <div className="w-5 h-5 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: qa.color + "25" }}>
                        <Icon size={11} style={{ color: qa.color }} />
                      </div>
                      {qa.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-white/[0.06]">
        {!collapsed && (
          <div className="px-2 py-2 mb-1">
            <div className="text-[10px] text-zinc-600">Version 2.0</div>
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className={clsx(
            "w-full flex items-center justify-center py-2 px-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-all duration-200",
          )}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </motion.button>
      </div>
    </motion.aside>
  );
}
