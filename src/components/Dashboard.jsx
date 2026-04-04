import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRight, PanelRightClose, Sparkles, Plus, LogOut } from "lucide-react";

import Sidebar from "./Sidebar";
import ChatInput from "./ChatInput";
import ResponseCard from "./ResponseCard";
import SuggestionChips from "./SuggestionChips";
import Loader from "./Loader";

/* ── Engine focus additions ── */
const ENGINE_ADDITIONS = {
  Narrative: "Focus on brand story, messaging framework, and positioning.",
  Content:   "Focus on content strategy, hooks, posting cadence, formats.",
  Growth:    "Focus on growth hacking, acquisition channels, ROAS, LTV.",
  Trend:     "Focus on real-time trends, viral formats, cultural moments.",
  Creator:   "Focus on creator monetisation, pricing, audience growth.",
};

export default function Dashboard({ onUpgrade, onLogout }) {
  // Auth state from localStorage
  const userType  = localStorage.getItem("corex_userType") || "creator";
  const userName  = localStorage.getItem("corex_userName") || "";
  const userEmail = localStorage.getItem("corex_userEmail") || "";

  // Message counter
  const [msgLeft, setMsgLeft] = useState(() => {
    const v = parseInt(localStorage.getItem("corex_msgLeft") || "10", 10);
    return isNaN(v) ? 10 : v;
  });

  // Chat state
  const [messages,   setMessages]   = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("corex_chat") || "[]"); } catch { return []; }
  });
  const [apiHistory, setApiHistory] = useState([]);
  const [loading,    setLoading]    = useState(false);

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightOpen,        setRightOpen]        = useState(false);
  const [activeTab,        setActiveTab]        = useState("chat");
  const [activeEngine,     setActiveEngine]     = useState(null);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  const bottomRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Persist chat to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("corex_chat", JSON.stringify(messages));
  }, [messages]);

  // Sync msgLeft to localStorage
  useEffect(() => {
    localStorage.setItem("corex_msgLeft", String(msgLeft));
  }, [msgLeft]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    // Check message limit
    if (msgLeft <= 0) {
      setShowUpgradeBanner(true);
      return;
    }

    const userMsg = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setMsgLeft((n) => Math.max(0, n - 1));

    const engineCtx = activeEngine
      ? `\n\n[Engine: ${activeEngine}] ${ENGINE_ADDITIONS[activeEngine] || ""}`
      : "";

    const newApiHist = [
      ...apiHistory,
      {
        role: "user",
        content: text + engineCtx + (userName ? `\n\n[User: ${userName}]` : ""),
      },
    ];
    setApiHistory(newApiHist);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newApiHist }),
      });

      let reply = "";
      if (res.ok) {
        const data = await res.json();
        reply = data.reply || "";
      } else if (res.status === 429) {
        reply = `## Slow down a bit\nYou're sending messages too fast. Wait a few seconds.\n\nChips: 'Try again' | 'New topic' | 'Help'`;
      } else {
        reply = `## Connection issue\nSomething went wrong. Please try again.\n\nChips: 'Try again' | 'New chat' | 'Growth strategy'`;
      }

      const assistantMsg = { id: Date.now() + 1, role: "assistant", content: reply, isNew: true };
      setMessages((prev) => [...prev, assistantMsg]);
      setApiHistory((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "## Connection error\nCheck your internet and try again.\n\nChips: 'Try again' | 'New chat' | 'Help'" },
      ]);
    }

    setLoading(false);
  }, [loading, apiHistory, activeEngine, msgLeft, userName]);

  const handleRegenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      setMessages((prev) => prev.slice(0, -1));
      sendMessage(lastUser.content);
    }
  }, [messages, sendMessage]);

  const newChat = () => {
    setMessages([]);
    setApiHistory([]);
    sessionStorage.removeItem("corex_chat");
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden grain" style={{ background: "#080810" }}>
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAction={sendMessage}
        userType={userType}
        msgLeft={msgLeft}
        onUpgrade={onUpgrade}
        userName={userName}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 relative z-10">
        {/* Topbar */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between h-14 px-5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,16,0.85)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center gap-3">
            {activeEngine && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-medium"
                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", color: "#c4b5fd" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                {activeEngine} Engine
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEmpty && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={newChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] border border-white/[0.07] transition-all"
              >
                <Plus size={13} />
                New chat
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05] border border-white/[0.07] transition-all"
              title="Sign out"
            >
              <LogOut size={13} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRightOpen((o) => !o)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05] border border-white/[0.07] transition-all"
            >
              {rightOpen ? <PanelRightClose size={13} /> : <PanelRight size={13} />}
            </motion.button>
          </div>
        </motion.header>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Upgrade banner */}
            <AnimatePresence>
              {showUpgradeBanner && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-2.5"
                    style={{ background: "rgba(124,58,237,0.12)", borderBottom: "1px solid rgba(124,58,237,0.2)" }}>
                    <span className="text-sm text-violet-300">
                      🚀 You&apos;ve used all free messages. Upgrade to continue.
                    </span>
                    <div className="flex gap-2">
                      <button onClick={onUpgrade} className="px-3 py-1 rounded-lg text-xs font-semibold text-white btn-purple">
                        Upgrade
                      </button>
                      <button onClick={() => setShowUpgradeBanner(false)} className="text-zinc-500 hover:text-zinc-300 text-xs">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scroll-area">
              <div className="max-w-2xl mx-auto w-full px-4 py-6">
                {/* Welcome screen */}
                <AnimatePresence>
                  {isEmpty && (
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="text-center pt-10 pb-8"
                    >
                      {/* Animated icon */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.45 }}
                        className="relative inline-flex items-center justify-center mb-6"
                      >
                        <div
                          className="w-16 h-16 rounded-2xl gradient-purple-blue flex items-center justify-center"
                          style={{ boxShadow: "0 0 0 1px rgba(124,58,237,0.35), 0 8px 40px rgba(124,58,237,0.4)" }}
                        >
                          <Sparkles size={26} className="text-white" />
                        </div>
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          animate={{ boxShadow: ["0 0 0 0 rgba(124,58,237,0.3)", "0 0 0 20px rgba(124,58,237,0)", "0 0 0 0 rgba(124,58,237,0)"] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        />
                      </motion.div>

                      <motion.h1
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 }}
                        className="text-4xl font-bold text-white mb-2 tracking-tight"
                        style={{ fontFamily: "Sora, sans-serif" }}
                      >
                        {userName ? `Hey ${userName.split(" ")[0]},` : "What will you"}
                        <br />
                        <span className="gradient-text">
                          {userName ? "what will you create?" : "create today?"}
                        </span>
                      </motion.h1>

                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.24 }}
                        className="text-zinc-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed"
                      >
                        {userType === "company"
                          ? "Your AI-powered marketing intelligence system."
                          : "Your AI-powered content & growth system."}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.32 }}
                      >
                        <SuggestionChips onSelect={sendMessage} userType={userType} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message list */}
                <div className="space-y-5">
                  {messages.map((msg, i) => (
                    <ResponseCard
                      key={msg.id}
                      message={msg}
                      animate={msg.isNew && msg.role === "assistant" && i === messages.length - 1}
                      onChip={sendMessage}
                      onRegenerate={handleRegenerate}
                    />
                  ))}

                  <AnimatePresence>
                    {loading && <Loader />}
                  </AnimatePresence>

                  <div ref={bottomRef} />
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div
              className="flex-shrink-0 p-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,16,0.9)", backdropFilter: "blur(20px)" }}
            >
              <div className="max-w-2xl mx-auto w-full">
                <ChatInput
                  onSend={sendMessage}
                  loading={loading}
                  activeEngine={activeEngine}
                  onEngineChange={setActiveEngine}
                />
              </div>
            </div>
          </div>

          {/* Right panel (session info) */}
          <AnimatePresence>
            {rightOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden flex-shrink-0"
                style={{ borderLeft: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,8,16,0.9)" }}
              >
                <div className="w-64 p-4 h-full overflow-y-auto scroll-area">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Session</h3>

                  <div className="space-y-3">
                    <InfoCard label="User" value={userName || "Guest"} />
                    <InfoCard label="Plan" value="Free tier" />
                    <InfoCard label="Messages left" value={`${msgLeft}/10`} />
                    <InfoCard label="Type" value={userType === "company" ? "Company" : "Creator"} />
                  </div>

                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3">Chat history</h4>
                    {messages.filter((m) => m.role === "user").length === 0 ? (
                      <p className="text-xs text-zinc-700">No messages yet.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {messages
                          .filter((m) => m.role === "user")
                          .slice(-8)
                          .reverse()
                          .map((m) => (
                            <button
                              key={m.id}
                              onClick={() => sendMessage(m.content)}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all truncate"
                            >
                              {m.content.slice(0, 42)}{m.content.length > 42 ? "…" : ""}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-zinc-300 mt-0.5">{value}</p>
    </div>
  );
}
