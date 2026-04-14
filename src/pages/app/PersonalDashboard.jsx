import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../../utils/userProfile";
import { getCredits, translateCredits } from "../../utils/credits";

const FONT = "'Instrument Sans', sans-serif";

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
        padding: "12px 14px", borderRadius: 12, cursor: "pointer",
        background: hov ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        transition: "all 0.15s ease",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#ffffff", fontFamily: FONT, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {conv.title || "Conversation"}
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
          {timeAgo(conv.timestamp || conv.updatedAt || Date.now())}
        </p>
      </div>
      <span style={{
        flexShrink: 0, marginLeft: 12, fontSize: 12, fontWeight: 600,
        color: hov ? "#9CFCAF" : "rgba(255,255,255,0.3)", fontFamily: FONT,
        padding: "4px 12px", borderRadius: 100,
        border: `1px solid ${hov ? "rgba(156,252,175,0.3)" : "rgba(255,255,255,0.08)"}`,
        transition: "all 0.15s ease",
      }}>
        Continue →
      </span>
    </motion.div>
  );
}

/* ── Intel card ── */
function IntelCard({ navigate, brandName, userName }) {
  const profile = getUserProfile();
  const bn = brandName || profile?.company || profile?.name || "your brand";

  const statTips = [
    "Reels under 30s get 2.4× more reach than longer videos right now.",
    "Brands using UGC see 29% higher web conversion than studio ads.",
    "WhatsApp marketing delivers 45-60% open rates vs 20% for email.",
  ];

  const weeklyMoves = [
    `This week's move for ${bn}: Post one customer story (not a product post) — brand trust content gets 2× more saves than promo.`,
    `This week's move for ${bn}: Run a 48-hour flash offer — urgency drives 40% higher conversion than evergreen deals.`,
    `This week's move for ${bn}: Audit your top competitor's Instagram stories — note formats, timing, and CTAs they use.`,
  ];

  const typeKey = "corex_intel_card_type";
  const cardType = (() => {
    const s = sessionStorage.getItem(typeKey);
    if (s) return parseInt(s, 10);
    const t = Math.floor(Math.random() * 3);
    sessionStorage.setItem(typeKey, t.toString());
    return t;
  })();

  const tip = cardType === 0
    ? statTips[Math.floor(Date.now() / 86400000) % statTips.length]
    : weeklyMoves[Math.floor(Date.now() / (7 * 86400000)) % weeklyMoves.length];

  const handleAsk = () => {
    sessionStorage.setItem("corex_prefill", `Tell me more about: ${tip}`);
    navigate("/app/chat");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      style={{
        background: "linear-gradient(135deg, #0A1A0F, #050D0A)",
        border: "1px solid rgba(156,252,175,0.1)",
        borderRadius: 16, padding: 20, marginBottom: 16, position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(156,252,175,0.05)", filter: "blur(20px)", pointerEvents: "none" }}/>
      <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(156,252,175,0.6)", fontFamily: FONT, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>
        Live Intelligence
      </p>
      <p style={{ fontSize: 15, fontWeight: 500, color: "#ffffff", fontFamily: FONT, lineHeight: 1.55, wordBreak: "break-word", maxWidth: 480 }}>
        {tip}
      </p>
      <button
        onClick={handleAsk}
        style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: "#9CFCAF", fontFamily: FONT, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Ask COREX →
      </button>
    </motion.div>
  );
}

/* ── News feed panel ── */
function NewsPanel({ userType }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const profile = getUserProfile();
  const niche = profile?.niche || profile?.industry || (userType !== "company" ? "Indian creator economy" : "Indian D2C brands");

  useEffect(() => {
    let stale = false;
    const cached = sessionStorage.getItem("corex_news");
    if (cached) {
      try { setNews(JSON.parse(cached)); setLoading(false); return; } catch {}
    }
    fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ niche }) })
      .then((r) => r.json())
      .then((d) => {
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
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "1.5px" }}>
          Live Intelligence
        </h3>
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 56, borderRadius: 10, background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : news.length === 0 ? (
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>No news loaded.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {news.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#ffffff", fontFamily: FONT, lineHeight: 1.4, flex: 1 }}>
                  {item.headline}
                </p>
                {item.category && (
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", flexShrink: 0, fontFamily: FONT }}>
                    {item.category}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: FONT, lineHeight: 1.5 }}>
                {item.summary}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main ── */
export default function PersonalDashboard({ userType, userName }) {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [history, setHistory] = useState([]);

  const profile   = getUserProfile();
  const name      = localStorage.getItem("corex_user_name") || userName || profile?.name || "";
  const brandName = localStorage.getItem("corex_brand_name") || profile?.company || profile?.name || "";
  const credits   = getCredits();
  const isLow     = credits < 30;

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem("corex_history") || "[]").slice(0, 5)); } catch {}
  }, []);

  function loadConversation(conv) {
    if (typeof window.__corex_loadConversation === "function") window.__corex_loadConversation(conv);
    navigate("/app/chat");
  }

  return (
    <div className="page-enter" style={{ flex: 1, height: "100%", overflowY: "auto", background: "#000000" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "24px 16px 100px" : "32px 28px 48px" }}>

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: FONT, marginBottom: 4 }}>
            {getGreeting(name)}
          </p>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 400, color: "#ffffff", lineHeight: 1.2 }}>
            {brandName || "Your creative workspace"}
          </h1>
        </motion.div>

        {/* 2-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: 16, alignItems: "start" }}>
          {/* LEFT */}
          <div>
            <IntelCard navigate={navigate} brandName={brandName} userName={name} />

            {/* Recent conversations */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20, marginBottom: 16 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  Recent
                </h3>
                <button onClick={() => navigate("/app/chat")}
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: FONT, background: "none", border: "none", cursor: "pointer" }}>
                  New chat →
                </button>
              </div>
              {history.length === 0 ? (
                <button onClick={() => navigate("/app/chat")}
                  style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontFamily: FONT, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  Start your first conversation →
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {history.map((conv) => (
                    <ConversationRow key={conv.id} conv={conv} onClick={() => loadConversation(conv)} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Credit status bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 16 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: 13, fontFamily: FONT, color: "rgba(255,255,255,0.55)" }}>
                  ⚡ {credits} credits · {translateCredits(credits)}
                </p>
                {isLow && (
                  <button
                    onClick={() => document.dispatchEvent(new CustomEvent("corex:openCredits"))}
                    style={{ fontSize: 12, fontFamily: FONT, fontWeight: 600, color: "#FFEA71", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Running low · Top up →
                  </button>
                )}
              </div>
              <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (credits / 50) * 100)}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    height: "100%",
                    borderRadius: 99,
                    background: isLow
                      ? "linear-gradient(90deg, #FFEA71, #f97316)"
                      : "linear-gradient(90deg, #226FF7, #6BC3CE, #9CFCAF)",
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT — news */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <NewsPanel userType={userType} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
