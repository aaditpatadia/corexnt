import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FONT = "'Instrument Sans', sans-serif";
const SERIF = "'Instrument Serif', serif";

const CARDS = [
  {
    id: "reel",
    route: "/app/creator-engine/reel",
    icon: "🎬",
    title: "Reel Script Generator",
    desc: "3 hooks. Full timed script. Caption. Done.",
    credits: 5,
    gradient: "linear-gradient(90deg, #226FF7, #9CFCAF)",
  },
  {
    id: "audit",
    route: "/app/creator-engine/audit",
    icon: "◎",
    title: "Growth Audit",
    desc: "Find what's broken. Fix it in 7 days.",
    credits: 6,
    gradient: "linear-gradient(90deg, #9CFCAF, #226FF7)",
  },
  {
    id: "pricer",
    route: "/app/creator-engine/pricer",
    icon: "⚡",
    title: "Brand Deal Pricer",
    desc: "Your exact rate card. In rupees.",
    credits: 3,
    gradient: "linear-gradient(90deg, #FFEA71, #9CFCAF)",
  },
  {
    id: "pitch",
    route: "/app/creator-engine/pitch",
    icon: "✦",
    title: "Pitch Email Writer",
    desc: "Pitches that brands actually reply to.",
    credits: 3,
    gradient: "linear-gradient(90deg, #226FF7, #FFEA71)",
  },
];

export default function CreatorEngine() {
  const navigate = useNavigate();

  return (
    <div
      className="page-enter"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "40px 32px",
        maxWidth: 760,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <span
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 100,
            padding: "4px 14px",
            fontSize: 12,
            fontFamily: FONT,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 16,
          }}
        >
          ✦ Creator Engine
        </span>
        <h1
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 38,
            color: "#ffffff",
            margin: "0 0 10px 0",
            fontWeight: 400,
          }}
        >
          Creator Engine
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 15,
            color: "rgba(255,255,255,0.45)",
            margin: 0,
          }}
        >
          Scripts, audits, rate cards, and pitches. Pick a tool and get moving.
        </p>
      </div>

      {/* 2×2 Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {CARDS.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ translateY: -4 }}
            onClick={() => navigate(card.route)}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: "24px 22px 20px",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Gradient accent top line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: card.gradient,
              }}
            />

            {/* Icon */}
            <div style={{ fontSize: 26, marginBottom: 14 }}>{card.icon}</div>

            {/* Title */}
            <h3
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 16,
                color: "#ffffff",
                margin: "0 0 8px 0",
              }}
            >
              {card.title}
            </h3>

            {/* Description */}
            <p
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                margin: "0 0 16px 0",
                lineHeight: 1.55,
              }}
            >
              {card.desc}
            </p>

            {/* Footer row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontFamily: FONT,
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                ⚡ {card.credits} credits
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontFamily: FONT,
                  color: "rgba(255,255,255,0.4)",
                  fontWeight: 500,
                }}
              >
                Open →
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
