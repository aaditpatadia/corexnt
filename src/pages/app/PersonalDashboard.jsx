import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUserProfile, getProfileCompletion, hasProfile } from "../../utils/userProfile";

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

function getTodayMsgs() {
  const today = new Date().toDateString();
  return parseInt(localStorage.getItem(`corex_msgs_${today}`) || "0", 10);
}

function getDaysActive() {
  const joined = localStorage.getItem("corex_joined");
  if (!joined) return 1;
  const diff = Date.now() - new Date(joined).getTime();
  return Math.max(1, Math.ceil(diff / 86400000));
}

function getTotalConversations() {
  try {
    const h = JSON.parse(localStorage.getItem("corex_history") || "[]");
    return h.length;
  } catch { return 0; }
}

/* ── Stat card ── */
function StatCard({ label, value, delay }) {
  return (
    <motion.div
      className="fade-up"
      style={{ animationDelay: `${delay}s` }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
    >
      <div style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: 20,
      }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: 28, fontFamily: "var(--font-display)", fontWeight: 700, color: "#f0faf2" }}>{value}</p>
      </div>
    </motion.div>
  );
}

/* ── Quick action card ── */
function QuickAction({ icon, title, subtitle, onClick, delay, accent, accentRgba }) {
  return (
    <motion.button
      onClick={onClick}
      className="fade-up text-left w-full"
      style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: 20, cursor: "none", animationDelay: `${delay}s`,
        transition: "all 0.25s ease",
      }}
      whileHover={{ y: -3, boxShadow: `0 12px 40px rgba(0,0,0,0.3), 0 0 20px ${accentRgba}0.08)` }}
      whileTap={{ scale: 0.98 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${accentRgba}0.1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>
        {icon}
      </div>
      <p style={{ fontSize: 15, fontWeight: 500, color: "#f0faf2", fontFamily: "var(--font-body)", marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>{subtitle}</p>
    </motion.button>
  );
}

export default function PersonalDashboard({ userType, userName }) {
  const navigate   = useNavigate();
  const isCreator  = userType !== "company";
  const accent     = isCreator ? "#2dd668" : "#a78bfa";
  const accentRgba = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";
  const bgStyle    = isCreator
    ? { background: "radial-gradient(ellipse at 20% 10%, rgba(45,214,104,0.04) 0%, transparent 50%), #0a0f0b" }
    : { background: "radial-gradient(ellipse at 20% 10%, rgba(124,58,237,0.04) 0%, transparent 50%), #0a0a12" };

  const [history, setHistory] = useState([]);
  const profile      = getUserProfile();
  const completion   = getProfileCompletion(userType);
  const todayMsgs    = getTodayMsgs();
  const daysActive   = getDaysActive();
  const totalConvos  = getTotalConversations();
  const displayName  = userName || profile?.name || "";
  const niche        = profile?.niche || profile?.company || "";

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("corex_history") || "[]");
      setHistory(h.slice(0, 5));
    } catch {}
  }, []);

  function loadConversation(conv) {
    if (typeof window.__corex_loadConversation === "function") {
      window.__corex_loadConversation(conv);
    }
    navigate("/app/chat");
  }

  const creatorActions = [
    { icon: "🎬", title: "Write a Reel Script", subtitle: "Hook, body, CTA in 60 seconds", path: null, prefill: "Write me a viral Instagram reel script for " + (niche || "my niche") },
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
    <div className="flex-1 overflow-y-auto scroll-area" style={bgStyle}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 48px" }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-body)", marginBottom: 4 }}>
            {getGreeting(displayName)}
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, color: "#f0faf2", lineHeight: 1.2 }}>
            {niche ? `${niche} ${isCreator ? "Creator" : "Brand"}` : (isCreator ? "Creator Dashboard" : "Brand Dashboard")}
          </h1>
        </div>

        {/* Incomplete profile prompt */}
        {completion < 60 && (
          <motion.button
            onClick={() => navigate("/app/profile-setup")}
            className="fade-up w-full text-left"
            style={{
              marginBottom: 24, padding: "14px 18px", borderRadius: 14,
              background: `${accentRgba}0.06)`, border: `1px solid ${accentRgba}0.2)`,
              animationDelay: "0.05s", cursor: "none",
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: accent, fontFamily: "var(--font-body)", marginBottom: 2 }}>
                  Complete your profile ({completion}% done)
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
                  Personalise your Corex experience →
                </p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${accentRgba}0.2)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: accent, fontFamily: "var(--font-body)" }}>{completion}%</div>
              </div>
            </div>
          </motion.button>
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          <StatCard label="Conversations" value={totalConvos || "0"} delay={0.1} />
          <StatCard label="Messages today" value={`${todayMsgs}/15`} delay={0.15} />
          <StatCard label="Days active" value={daysActive} delay={0.2} />
          <StatCard label="Profile" value={`${completion}%`} delay={0.25} />
        </div>

        {/* Profile card */}
        {profile && (
          <motion.div
            className="fade-up"
            style={{ marginBottom: 24, padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#f0faf2", fontFamily: "var(--font-body)" }}>
                {isCreator ? "Your Creator Profile" : "Your Brand Profile"}
              </h3>
              <button onClick={() => navigate("/app/settings")}
                style={{ fontSize: 12, color: accent, fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "none" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Edit profile →
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {isCreator ? (
                <>
                  {profile.niche     && <Tag label="Niche" value={profile.niche} accent={accent} accentRgba={accentRgba} />}
                  {profile.platform  && <Tag label="Platform" value={profile.platform} accent={accent} accentRgba={accentRgba} />}
                  {profile.followers && <Tag label="Followers" value={profile.followers} accent={accent} accentRgba={accentRgba} />}
                  {profile.challenge && <Tag label="Focus" value={profile.challenge} accent={accent} accentRgba={accentRgba} />}
                </>
              ) : (
                <>
                  {profile.company     && <Tag label="Brand" value={profile.company} accent={accent} accentRgba={accentRgba} />}
                  {profile.industry    && <Tag label="Industry" value={profile.industry} accent={accent} accentRgba={accentRgba} />}
                  {profile.competitors && <Tag label="Competitors" value={profile.competitors} accent={accent} accentRgba={accentRgba} />}
                  {profile.budget      && <Tag label="Budget" value={profile.budget} accent={accent} accentRgba={accentRgba} />}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Recent conversations */}
        <motion.div
          className="fade-up"
          style={{ marginBottom: 24, animationDelay: "0.3s" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#f0faf2", fontFamily: "var(--font-body)", marginBottom: 12 }}>
            Recent conversations
          </h3>
          {history.length === 0 ? (
            <button onClick={() => navigate("/app/chat")}
              style={{ fontSize: 14, color: accent, fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "none" }}>
              Start your first conversation →
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {history.map((conv) => (
                <motion.button
                  key={conv.id}
                  onClick={() => loadConversation(conv)}
                  whileHover={{ paddingLeft: 20, borderLeftColor: accent }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px 12px 16px", borderRadius: 12, textAlign: "left", width: "100%",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                    borderLeft: "3px solid rgba(255,255,255,0.05)", cursor: "none",
                    transition: "all 0.2s ease", fontFamily: "var(--font-body)",
                  }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 500, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "45ch" }}>
                      {conv.title || "Conversation"}
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                      {timeAgo(conv.timestamp || conv.updatedAt || Date.now())} · {conv.messages?.filter(m => m.role === "user").length || 0} messages
                    </p>
                  </div>
                  <span style={{ fontSize: 13, color: accent, flexShrink: 0 }}>Continue →</span>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <div className="fade-up" style={{ animationDelay: "0.4s" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#f0faf2", fontFamily: "var(--font-body)", marginBottom: 12 }}>
            Quick actions
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {actions.map((action, i) => (
              <QuickAction
                key={action.title}
                icon={action.icon}
                title={action.title}
                subtitle={action.subtitle}
                accent={accent}
                accentRgba={accentRgba}
                delay={0.4 + i * 0.05}
                onClick={() => {
                  if (action.path) {
                    navigate(action.path);
                  } else if (action.prefill) {
                    sessionStorage.setItem("corex_prefill", action.prefill);
                    navigate("/app/chat");
                  }
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function Tag({ label, value, accent, accentRgba }) {
  return (
    <div style={{
      padding: "6px 12px", borderRadius: 20,
      background: `${accentRgba}0.06)`, border: `1px solid ${accentRgba}0.15)`,
    }}>
      <span style={{ fontSize: 11, color: `${accentRgba}0.7)`, fontFamily: "var(--font-body)", marginRight: 4 }}>{label}</span>
      <span style={{ fontSize: 12, color: "#f0faf2", fontFamily: "var(--font-body)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
