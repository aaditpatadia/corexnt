import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRight, PanelRightClose, Sparkles } from "lucide-react";

import Sidebar from "./components/Sidebar";
import ChatInput from "./components/ChatInput";
import ResponseCard from "./components/ResponseCard";
import SuggestionChips from "./components/SuggestionChips";
import Loader from "./components/Loader";
import RightPanel from "./components/RightPanel";

/* ─────────────────────────────────────────────────────────────── */
const ENGINE_SYSTEM_ADDITIONS = {
  Narrative: "Focus on brand positioning, messaging, tone of voice, and brand story.",
  Content:   "Focus on content strategy, hooks, posting systems, and content formats.",
  Growth:    "Focus on growth tactics, budget allocation, paid media, and acquisition channels.",
  Trend:     "Focus on viral trend creation, cultural moments, and what's working right now.",
  Creator:   "Focus on creator monetisation, personal brand, pricing, and audience building.",
};

/* ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [messages,      setMessages]      = useState([]);
  const [history,       setHistory]       = useState([]);
  const [apiHistory,    setApiHistory]    = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen]     = useState(false);
  const [activeTab,     setActiveTab]     = useState("chat");
  const [activeEngine,  setActiveEngine]  = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    // Update history sidebar
    setHistory((prev) => [text.slice(0, 55) + (text.length > 55 ? "…" : ""), ...prev.slice(0, 19)]);

    const engineContext = activeEngine
      ? `\n\n[Engine: ${activeEngine}] ${ENGINE_SYSTEM_ADDITIONS[activeEngine] || ""}`
      : "";

    const newApiHist = [...apiHistory, { role: "user", content: text + engineContext }];
    setApiHistory(newApiHist);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newApiHist }),
      });

      let responseText = "";

      if (res.ok) {
        const data = await res.json();
        responseText = data.response || "";
      } else if (res.status === 429) {
        responseText = `## Rate limit reached
Please wait a few seconds before trying again.

GRAPH_DATA: {"labels":["Wait","Retry"],"values":[10,1],"title":"Try Again"}

Chips: "Try again" | "New topic" | "Growth strategy"`;
      } else {
        responseText = `## Connection issue
Something went wrong. Please refresh and try again.

Chips: "Try again" | "New chat" | "Growth strategy"`;
      }

      const assistantMsg = { id: Date.now() + 1, role: "assistant", content: responseText };
      setMessages((prev) => [...prev, assistantMsg]);
      setApiHistory((prev) => [...prev, { role: "assistant", content: responseText }]);
    } catch {
      const errMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: `## Connection error\nCheck your internet and try again.\n\nChips: "Try again" | "New chat" | "Help"`,
      };
      setMessages((prev) => [...prev, errMsg]);
    }

    setLoading(false);
  }, [loading, apiHistory, activeEngine]);

  const handleRegenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      // Remove last assistant message and resend
      setMessages((prev) => prev.filter((m) => m !== messages.at(-1)));
      sendMessage(lastUser.content);
    }
  };

  const newChat = () => {
    setMessages([]);
    setApiHistory([]);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden grain bg-bg-base">

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAction={sendMessage}
      />

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">

        {/* Top bar */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between h-14 px-5 flex-shrink-0
            border-b border-white/[0.06] bg-bg-base/80 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            {activeEngine && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-medium
                bg-violet-600/15 border border-violet-500/20 text-violet-300">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                {activeEngine} Engine
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* New chat */}
            {!isEmpty && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={newChat}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium
                  text-zinc-400 hover:text-zinc-200 border border-white/[0.07]
                  hover:border-white/[0.12] hover:bg-white/[0.04]
                  transition-all duration-200"
              >
                New chat
              </motion.button>
            )}

            {/* Right panel toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRightPanelOpen((o) => !o)}
              className="w-8 h-8 rounded-xl flex items-center justify-center
                text-zinc-500 hover:text-zinc-200 border border-white/[0.07]
                hover:bg-white/[0.05] transition-all duration-200"
            >
              {rightPanelOpen
                ? <PanelRightClose size={14} />
                : <PanelRight size={14} />}
            </motion.button>
          </div>
        </motion.header>

        {/* Content + Input */}
        <div className="flex flex-1 overflow-hidden">

          {/* Chat area */}
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto w-full px-4 py-6">

                {/* Empty state */}
                <AnimatePresence>
                  {isEmpty && (
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="text-center pt-12 pb-8"
                    >
                      {/* Hero */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative inline-flex items-center justify-center mb-6"
                      >
                        <div className="w-16 h-16 rounded-2xl gradient-purple-blue flex items-center justify-center"
                          style={{ boxShadow: "0 0 0 1px rgba(139,92,246,0.3), 0 8px 32px rgba(139,92,246,0.35)" }}>
                          <Sparkles size={26} className="text-white" />
                        </div>
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          animate={{ boxShadow: ["0 0 0 0 rgba(139,92,246,0.3)", "0 0 0 16px rgba(139,92,246,0)", "0 0 0 0 rgba(139,92,246,0)"] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        />
                      </motion.div>

                      <motion.h1
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 }}
                        className="text-3xl font-bold text-white mb-2 tracking-tight"
                        style={{ fontFamily: "Syne, sans-serif" }}
                      >
                        Welcome to{" "}
                        <span className="gradient-text">Corex</span>
                      </motion.h1>

                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.24 }}
                        className="text-zinc-500 text-sm mb-8 max-w-md mx-auto leading-relaxed"
                      >
                        Your AI Operating System for growth, content, and brand strategy.
                        This is not a chatbot — it&apos;s a system.
                      </motion.p>

                      {/* Suggestion chips */}
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <SuggestionChips onSelect={sendMessage} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages */}
                <div className="space-y-6">
                  {messages.map((msg) => (
                    <ResponseCard
                      key={msg.id}
                      message={msg}
                      onChip={sendMessage}
                      onRegenerate={handleRegenerate}
                    />
                  ))}

                  {/* Loader */}
                  <AnimatePresence>
                    {loading && <Loader />}
                  </AnimatePresence>

                  <div ref={bottomRef} />
                </div>
              </div>
            </div>

            {/* Input bar — sticky bottom */}
            <div className="flex-shrink-0 border-t border-white/[0.06] bg-bg-base/90 backdrop-blur-2xl p-4">
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

          {/* Right panel */}
          <RightPanel
            visible={rightPanelOpen}
            history={history}
            onHistoryClick={sendMessage}
            onQuickAction={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}
