import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUserProfile, getProfileCompletion } from "../../utils/userProfile";

function useMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
}

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
function getDaysActive()        { const j = localStorage.getItem("corex_joined"); if (!j) return 1; const d = Math.ceil((Date.now() - new Date(j).getTime()) / 86400000); return isNaN(d) || d < 1 ? 1 : d; }
function getTotalConversations(){ try { return JSON.parse(localStorage.getItem("corex_history") || "[]").length; } catch { return 0; } }

/* ── Stat card ── */
function StatCard({ icon, label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ y: -3 }}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "20px 24px",
      }}>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", marginBottom: 10, letterSpacing: "0.5px", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
        <span>{icon}</span>{label}
      </p>
      <p style={{ fontSize: 32, fontFamily: "var(--font-body)", fontWeight: 700, color: "#ffffff", lineHeight: 1 }}>{value}</p>
    </motion.div>
  );
}

/* ── Conversation row ── */
function ConversationRow({ conv, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ x: 2 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 14px", borderRadius: 14, cursor: "pointer",
        background: hov ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        transition: "all 0.15s ease",
      }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: "#ffffff", fontFamily: "var(--font-body)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {conv.title || "Conversation"}
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>
          {timeAgo(conv.timestamp || conv.updatedAt || Date.now())} · {conv.messages?.filter(m => m.role === "user").length || 0} messages
        </p>
      </div>
      <span style={{
        flexShrink: 0, marginLeft: 12,
        fontSize: 12, fontWeight: 600,
        color: "rgba(255,255,255,0.5)",
        fontFamily: "var(--font-body)",
        padding: "4px 12px", borderRadius: 100,
        border: "1px solid rgba(255,255,255,0.15)",
        transition: "all 0.15s ease",
      }}>
        Continue →
      </span>
    </motion.div>
  );
}

/* ── Quick action card ── */
function QuickAction({ icon, title, subtitle, onClick, delay = 0 }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 20, cursor: "pointer", textAlign: "left", width: "100%",
        transition: "all 0.2s ease",
      }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>
        {icon}
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", fontFamily: "var(--font-body)", marginBottom: 3 }}>{title}</p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>{subtitle}</p>
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
    Trends:   { bg: "rgba(251,191,36,0.1)",  color: "#fbbf24" },
    Platform: { bg: "rgba(56,189,248,0.1)",  color: "#38bdf8" },
    Brand:    { bg: "rgba(167,139,250,0.1)", color: "#a78bfa" },
    Creator:  { bg: "rgba(156,252,175,0.1)", color: "#9CFCAF" },
    Market:   { bg: "rgba(248,113,113,0.1)", color: "#f87171" },
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
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Live Intelligence
        </h3>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)" }}>Auto-updated</span>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 64, borderRadius: 12, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }}/>
          ))}
        </div>
      ) : news.length === 0 ? (
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)" }}>No news loaded.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {news.map((item, i) => {
            const cat = CATEGORY_COLORS[item.category] || { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" };
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                style={{ padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", fontFamily: "var(--font-body)", lineHeight: 1.4, flex: 1 }}>
                    {item.headline}
                  </p>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: cat.bg, color: cat.color, flexShrink: 0, fontFamily: "var(--font-body)" }}>
                    {item.category}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", lineHeight: 1.5, marginBottom: 4 }}>
                  {item.summary}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}>{item.source}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}>·</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}>{item.timeAgo}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Intel ask button ── */
function IntelAskButton({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "#9CFCAF", fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "opacity 0.15s", opacity: hov ? 0.75 : 1 }}>
      Ask COREX about this
      <span style={{ display: "inline-block", transition: "transform 0.2s ease", transform: hov ? "translateX(4px)" : "translateX(0)" }}>→</span>
    </button>
  );
}

/* ── Intel card ── */
function IntelCard({ isCreator, navigate }) {
  const profile = getUserProfile();
  const brandName = isCreator
    ? (profile?.name || "your channel")
    : (profile?.company || profile?.name || "your brand");
  const niche     = profile?.niche || profile?.industry || "";

  const statTips = isCreator ? [
    "Reels under 30s get 2.4× more reach than longer videos right now.",
    "Creators posting 5-7 times/week see 40% faster follower growth.",
    "Hook in first 1.5s decides 80% of watch time on Instagram.",
  ] : [
    "Brands using UGC see 29% higher web conversion than studio ads.",
    "WhatsApp marketing delivers 45-60% open rates vs 20% for email.",
    "Festival season spends are up 38% YoY — plan campaigns 6 weeks out.",
  ];

  const recentTopics = (() => {
    try {
      const hist = JSON.parse(localStorage.getItem("corex_history") || "[]");
      return hist.slice(0, 2).map(h => h.title).filter(Boolean);
    } catch { return []; }
  })();

  const weekKey = `corex_weekly_challenge_${Math.floor(Date.now() / (7 * 86400000))}`;
  const weeklyChallenges = isCreator ? [
    `Post a "day in my life" reel${niche ? " as a " + niche + " creator" : ""} — authentic content converts 3× better than scripted.`,
    `Collaborate with one micro-creator in your niche this week — cross-follower exposure is free paid media.`,
    `Reply to your last 20 comments within the first hour of your next post — the algorithm rewards response velocity.`,
  ] : [
    `Run a limited 48-hour flash offer${niche ? " for " + niche : ""} — urgency drives 40% higher conversion than evergreen deals.`,
    `Audit your top competitor's Instagram stories this week — note formats, posting times, and CTAs they use.`,
    `Post one customer story (not a product post) — brand trust content gets 2× more saves than promo content.`,
  ];

  const getWeeklyChallenge = () => {
    const cached = localStorage.getItem(weekKey);
    if (cached) return cached;
    const challenge = weeklyChallenges[Math.floor(Date.now() / (7 * 86400000)) % weeklyChallenges.length];
    try { localStorage.setItem(weekKey, challenge); } catch {}
    return challenge;
  };

  const typeKey = "corex_intel_card_type";
  const cardType = (() => {
    const s = sessionStorage.getItem(typeKey);
    if (s) return parseInt(s, 10);
    const t = Math.floor(Math.random() * 3);
    sessionStorage.setItem(typeKey, t.toString());
    return t;
  })();

  let tip = "";
  let label = "Intelligence";
  let prefillQuestion = "";

  if (cardType === 0) {
    tip = statTips[Math.floor(Date.now() / 86400000) % statTips.length];
    label = "Based on today's intel";
    prefillQuestion = tip;
  } else if (cardType === 1 && recentTopics.length > 0) {
    const lastTopic = recentTopics[0];
    tip = `You asked about "${lastTopic}" recently. What's changed since then?`;
    label = "Continuing from yesterday";
    prefillQuestion = `What has changed recently around: ${lastTopic}`;
  } else {
    tip = `This week's growth move for ${brandName}: ${getWeeklyChallenge()}`;
    label = "Your weekly move";
    prefillQuestion = isCreator
      ? `Help me execute this growth move: ${getWeeklyChallenge()}`
      : `Help me run this campaign move: ${getWeeklyChallenge()}`;
  }

  const handleAsk = () => {
    sessionStorage.setItem("corex_prefill", prefillQuestion);
    navigate("/app/chat");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 20, marginBottom: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(156,252,175,0.06)", filter: "blur(20px)", pointerEvents: "none" }}/>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(156,252,175,0.1)", border: "1px solid rgba(156,252,175,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CFCAF" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#9CFCAF", fontFamily: "var(--font-body)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>
            {label}
          </p>
          <p style={{ fontSize: 17, fontWeight: 500, color: "#ffffff", fontFamily: "var(--font-body)", lineHeight: 1.5, wordBreak: "break-word", maxWidth: 480 }}>
            {tip}
          </p>
          <IntelAskButton onClick={handleAsk}/>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main ── */
export default function PersonalDashboard({ userType, userName }) {
  const navigate   = useNavigate();
  const isCreator  = userType !== "company";
  const isMobile   = useMobile();

  const [history, setHistory] = useState([]);
  const profile      = getUserProfile();
  const completion   = getProfileCompletion(userType);
  const todayMsgs    = getTodayMsgs();
  const daysActive   = getDaysActive();
  const totalConvos  = getTotalConversations();

  const displayName  = profile?.name || userName || "";
  const entityName   = isCreator ? (profile?.niche || "") : (profile?.company || "");
  const niche        = profile?.niche || profile?.industry || "";

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
    <div style={{ flex: 1, overflowY: "auto", background: "#000000" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "20px 16px 140px" : "28px 24px 48px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", marginBottom: 4 }}>{getGreeting(displayName)}</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 400, color: "#ffffff", lineHeight: 1.2 }}>
            {entityName || (isCreator ? "Creator Dashboard" : "Brand Dashboard")}
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
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textAlign: "left",
            }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", fontFamily: "var(--font-body)", marginBottom: 2 }}>
                  Complete your profile ({completion}% done)
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
                  Personalise your Corex experience →
                </p>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", background: "rgba(255,255,255,0.08)", padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>
                {completion}%
              </div>
            </div>
          </motion.button>
        )}

        {/* Stat cards row */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
          <StatCard icon="💬" label="Conversations" value={totalConvos || "0"} delay={0.1}/>
          <StatCard icon="⚡" label="Messages today" value={`${todayMsgs}/15`} delay={0.15}/>
          <StatCard icon="📅" label="Days active" value={daysActive} delay={0.2}/>
          <StatCard icon="✓" label="Profile complete" value={`${completion}%`} delay={0.25}/>
        </div>

        {/* 2-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", gap: 16, alignItems: "start" }}>

          {/* LEFT COLUMN */}
          <div>
            <IntelCard isCreator={isCreator} navigate={navigate}/>

            {/* Recent conversations */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Recent Conversations
                </h3>
                {history.length > 0 && (
                  <button onClick={() => navigate("/app/chat")}
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "pointer" }}>
                    New chat →
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <button onClick={() => navigate("/app/chat")}
                  style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  Start your first conversation →
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {history.map((conv) => (
                    <ConversationRow key={conv.id} conv={conv} onClick={() => loadConversation(conv)}/>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick actions */}
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                Quick Actions
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
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
