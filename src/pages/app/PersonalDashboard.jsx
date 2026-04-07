import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUserProfile, getProfileCompletion } from "../../utils/userProfile";

function getGreeting(name) {
  const h = new Date().getHours();
  const t = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${t}${name ? `, ${name.split(" ")[0]}` : ""}`;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "Just now";
}

function getTodayMsgs()         { return parseInt(localStorage.getItem(`corex_msgs_${new Date().toDateString()}`) || "0", 10); }
function getDaysActive()        { const j = localStorage.getItem("corex_joined"); if (!j) return 1; return Math.max(1, Math.ceil((Date.now() - new Date(j).getTime()) / 86400000)); }
function getTotalConversations(){ try { return JSON.parse(localStorage.getItem("corex_history") || "[]").length; } catch { return 0; } }

/* ── Stat card (light v6) ── */
function StatCard({ label, value, trend, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ y: -3 }}
      style={{ background: "#ffffff", border: "1px solid #e8e8e3", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
      <p style={{ fontSize: 11, color: "#888888", fontFamily: "var(--font-body)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <p style={{ fontSize: 28, fontFamily: "var(--font-display)", fontWeight: 400, color: "#1a1a1a", lineHeight: 1 }}>{value}</p>
        {trend && <span style={{ fontSize: 12, color: trend > 0 ? "#1a7a3c" : "#888888", fontFamily: "var(--font-body)", fontWeight: 600 }}>{trend > 0 ? `↑ ${trend}%` : "—"}</span>}
      </div>
    </motion.div>
  );
}

/* ── Quick action card (light v6) ── */
function QuickAction({ icon, title, subtitle, onClick, delay = 0 }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ y: -3, boxShadow: "0 8px 32px rgba(26,122,60,0.1)" }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: "#ffffff", border: "1px solid #e8e8e3", borderRadius: 20,
        padding: 20, cursor: "pointer", textAlign: "left", width: "100%",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)", transition: "all 0.2s ease",
      }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>
        {icon}
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", fontFamily: "var(--font-body)", marginBottom: 3 }}>{title}</p>
      <p style={{ fontSize: 13, color: "#888888", fontFamily: "var(--font-body)" }}>{subtitle}</p>
    </motion.button>
  );
}

/* ── News feed panel ── */
function NewsPanel({ userType }) {
  const [news,    setNews]    = useState([]);
  const [loading, setLoading] = useState(true);
  const profile   = getUserProfile();
  const niche     = profile?.niche || profile?.industry || (userType !== "company" ? "Indian creator economy" : "Indian D2C brands");

  const CATEGORY_COLORS = {
    Trends:   { bg: "#fef3c7", color: "#d97706" },
    Platform: { bg: "#e0f2fe", color: "#0284c7" },
    Brand:    { bg: "#ede9f8", color: "#7c3aed" },
    Creator:  { bg: "#e8f5ee", color: "#1a7a3c" },
    Market:   { bg: "#fff0f0", color: "#e11d48" },
  };

  useEffect(() => {
    let stale = false;
    const cached = sessionStorage.getItem("corex_news");
    if (cached) {
      try { setNews(JSON.parse(cached)); setLoading(false); return; } catch {}
    }
    fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ niche }),
    })
      .then(r => r.json())
      .then(d => {
        if (stale) return;
        const items = d.news || [];
        setNews(items);
        try { sessionStorage.setItem("corex_news", JSON.stringify(items)); } catch {}
      })
      .catch(() => {})
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, []);

  return (
    <div style={{ background: "#ffffff", border: "1px solid #e8e8e3", borderRadius: 20, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Live Intelligence
        </h3>
        <span style={{ fontSize: 11, color: "#888888", fontFamily: "var(--font-body)" }}>Auto-updated</span>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 64, borderRadius: 12, background: "#f0f0eb", animation: "pulse 1.5s ease-in-out infinite" }}/>
          ))}
        </div>
      ) : news.length === 0 ? (
        <p style={{ fontSize: 13, color: "#888888", fontFamily: "var(--font-body)" }}>No news loaded — check your API key.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {news.map((item, i) => {
            const cat = CATEGORY_COLORS[item.category] || { bg: "#f0f0eb", color: "#555555" };
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                style={{ padding: "12px 14px", borderRadius: 14, background: "#f8f8f6", border: "1px solid #e8e8e3" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", fontFamily: "var(--font-body)", lineHeight: 1.4, flex: 1 }}>
                    {item.headline}
                  </p>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: cat.bg, color: cat.color, flexShrink: 0, fontFamily: "var(--font-body)" }}>
                    {item.category}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#555555", fontFamily: "var(--font-body)", lineHeight: 1.5, marginBottom: 4 }}>
                  {item.summary}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#aaaaaa", fontFamily: "var(--font-body)" }}>{item.source}</span>
                  <span style={{ fontSize: 11, color: "#aaaaaa", fontFamily: "var(--font-body)" }}>·</span>
                  <span style={{ fontSize: 11, color: "#aaaaaa", fontFamily: "var(--font-body)" }}>{item.timeAgo}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Dark intelligence card ── */
function IntelCard({ isCreator, navigate }) {
  const tips = isCreator ? [
    "Reels under 30s get 2.4× more reach than longer videos right now.",
    "Creators posting 5-7 times/week see 40% faster follower growth.",
    "Hook in first 1.5s decides 80% of watch time on Instagram.",
  ] : [
    "Brands using UGC see 29% higher web conversion than studio ads.",
    "WhatsApp marketing delivers 45-60% open rates vs 20% for email.",
    "Festival season spends are up 38% YoY — plan campaigns 6 weeks out.",
  ];
  const tip = tips[Math.floor(Date.now() / 86400000) % tips.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      style={{ background: "#1a1a1a", borderRadius: 20, padding: 20, marginBottom: 16, position: "relative", overflow: "hidden" }}>
      {/* Subtle green glow */}
      <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(45,214,104,0.08)", filter: "blur(20px)", pointerEvents: "none" }}/>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(45,214,104,0.12)", border: "1px solid rgba(45,214,104,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2dd668" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#2dd668", fontFamily: "var(--font-body)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>
            Intelligence
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-body)", lineHeight: 1.6 }}>
            {tip}
          </p>
          <button onClick={() => navigate("/app/chat")}
            style={{ marginTop: 10, fontSize: 12, color: "#2dd668", fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Ask COREX about this →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main ── */
export default function PersonalDashboard({ userType, userName }) {
  const navigate   = useNavigate();
  const isCreator  = userType !== "company";

  const [history, setHistory] = useState([]);
  const profile      = getUserProfile();
  const completion   = getProfileCompletion(userType);
  const todayMsgs    = getTodayMsgs();
  const daysActive   = getDaysActive();
  const totalConvos  = getTotalConversations();
  const displayName  = userName || profile?.name || "";
  const niche        = profile?.niche || profile?.company || "";

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem("corex_history") || "[]").slice(0, 4)); } catch {}
  }, []);

  function loadConversation(conv) {
    if (typeof window.__corex_loadConversation === "function") window.__corex_loadConversation(conv);
    navigate("/app/chat");
  }

  const creatorActions = [
    { icon: "🎬", title: "Write a Reel Script", subtitle: "Hook, body, CTA in 60s", path: null, prefill: "Write me a viral Instagram reel script for " + (niche || "my niche") },
    { icon: "📈", title: "Audit My Growth", subtitle: "Find what's slowing you down", path: "/app/growth-audit" },
    { icon: "🔥", title: "Find Trends", subtitle: "What's blowing up right now", path: "/app/trend-engine" },
    { icon: "💼", title: "Price a Brand Deal", subtitle: "Know your worth, charge it", path: null, prefill: "How do I price a brand deal for " + (profile?.followers || "my") + " followers in the " + (niche || "content") + " niche?" },
  ];

  const brandActions = [
    { icon: "📣", title: "Build a Campaign", subtitle: "Full strategy in minutes", path: "/app/campaign-builder" },
    { icon: "💰", title: "Allocate Budget", subtitle: "Optimise every rupee", path: "/app/budget-allocator" },
    { icon: "🔍", title: "Analyse Competitor", subtitle: "Spy on what's working", path: "/app/competitor-intel" },
    { icon: "🛡️", title: "Audit Our Brand", subtitle: "Gaps, wins, opportunities", path: "/app/brand-audit" },
  ];

  const actions = isCreator ? creatorActions : brandActions;

  return (
    <div className="flex-1 overflow-y-auto scroll-area" style={{ background: "#f0f0eb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 48px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: "#888888", fontFamily: "var(--font-body)", marginBottom: 4 }}>{getGreeting(displayName)}</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 400, color: "#1a1a1a", lineHeight: 1.2 }}>
            {niche ? `${niche} ${isCreator ? "Creator" : "Brand"}` : (isCreator ? "Creator Dashboard" : "Brand Dashboard")}
          </h1>
        </motion.div>

        {/* Profile completion banner */}
        {completion < 60 && (
          <motion.button
            onClick={() => navigate("/app/profile-setup")}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            whileHover={{ y: -2 }}
            style={{
              display: "block", width: "100%", marginBottom: 20, padding: "14px 18px", borderRadius: 20,
              background: "#e8f5ee", border: "1px solid #c8e6d4", cursor: "pointer", textAlign: "left",
            }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#1a7a3c", fontFamily: "var(--font-body)", marginBottom: 2 }}>
                  Complete your profile ({completion}% done)
                </p>
                <p style={{ fontSize: 13, color: "#555555", fontFamily: "var(--font-body)" }}>
                  Personalise your Corex experience →
                </p>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a7a3c", fontFamily: "var(--font-body)", background: "#ffffff", padding: "4px 12px", borderRadius: 20, border: "1px solid #c8e6d4" }}>
                {completion}%
              </div>
            </div>
          </motion.button>
        )}

        {/* Stat cards row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          <StatCard label="Conversations" value={totalConvos || "0"} delay={0.1}/>
          <StatCard label="Messages today" value={`${todayMsgs}/15`} delay={0.15}/>
          <StatCard label="Days active" value={daysActive} delay={0.2}/>
          <StatCard label="Profile" value={`${completion}%`} delay={0.25}/>
        </div>

        {/* 2-column grid: main content (left) + news feed (right) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

          {/* LEFT COLUMN */}
          <div>

            {/* Intel card */}
            <IntelCard isCreator={isCreator} navigate={navigate}/>

            {/* Recent conversations */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ background: "#ffffff", border: "1px solid #e8e8e3", borderRadius: 20, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Recent Conversations
                </h3>
                {history.length > 0 && (
                  <button onClick={() => navigate("/app/chat")}
                    style={{ fontSize: 12, color: "#1a7a3c", fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "pointer" }}>
                    New chat →
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <button onClick={() => navigate("/app/chat")}
                  style={{ fontSize: 14, color: "#1a7a3c", fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  Start your first conversation →
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {history.map((conv) => (
                    <motion.button key={conv.id}
                      onClick={() => loadConversation(conv)}
                      whileHover={{ x: 4 }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 12px", borderRadius: 14, textAlign: "left", width: "100%",
                        background: "#f8f8f6", border: "1px solid #e8e8e3",
                        cursor: "pointer", transition: "all 0.2s ease",
                      }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500, fontFamily: "var(--font-body)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "40ch" }}>
                          {conv.title || "Conversation"}
                        </p>
                        <p style={{ fontSize: 11, color: "#888888", fontFamily: "var(--font-body)" }}>
                          {timeAgo(conv.timestamp || conv.updatedAt || Date.now())} · {conv.messages?.filter(m => m.role === "user").length || 0} messages
                        </p>
                      </div>
                      <span style={{ fontSize: 12, color: "#1a7a3c", flexShrink: 0, fontFamily: "var(--font-body)" }}>Continue →</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick actions */}
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                Quick Actions
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {actions.map((action, i) => (
                  <QuickAction
                    key={action.title}
                    icon={action.icon}
                    title={action.title}
                    subtitle={action.subtitle}
                    delay={0.4 + i * 0.05}
                    onClick={() => {
                      if (action.path) navigate(action.path);
                      else if (action.prefill) { sessionStorage.setItem("corex_prefill", action.prefill); navigate("/app/chat"); }
                    }}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN — News feed */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <NewsPanel userType={userType}/>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
