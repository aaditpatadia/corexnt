import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CREDIT_PACKS, getCredits, translateCredits } from "../utils/credits";

const FONT = "'Instrument Sans', sans-serif";

export default function PaymentPage({ onBack }) {
  const [currency, setCurrency] = useState("INR");
  const [toast, setToast] = useState(null);
  const credits = getCredits();

  function handlePackClick(pack) {
    const email = localStorage.getItem("userEmail") || "";
    const waitlist = JSON.parse(localStorage.getItem("corex_waitlist") || "[]");
    if (!waitlist.includes(email) && email) {
      waitlist.push(email);
      localStorage.setItem("corex_waitlist", JSON.stringify(waitlist));
    }
    setToast("Razorpay integration coming soon — you're on the waitlist!");
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div
      className="page-enter"
      style={{ flex: 1, overflowY: "auto", padding: "40px 24px", background: "#000000" }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Back */}
        <button
          onClick={onBack}
          style={{ fontSize: 13, fontFamily: FONT, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", marginBottom: 32, padding: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
        >
          ← Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(24px, 4vw, 32px)", color: "#ffffff", marginBottom: 8 }}
          >
            Top up your credits
          </h1>
          <p style={{ fontSize: 14, fontFamily: FONT, color: "rgba(255,255,255,0.45)" }}>
            You have ⚡ {credits} credits remaining · {translateCredits(credits)}
          </p>
        </div>

        {/* Currency toggle */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {["INR", "USD"].map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              style={{
                padding: "5px 14px",
                borderRadius: 100,
                fontSize: 12,
                fontFamily: FONT,
                fontWeight: 600,
                border: "1px solid",
                cursor: "pointer",
                background: currency === c ? "rgba(156,252,175,0.1)" : "transparent",
                borderColor: currency === c ? "rgba(156,252,175,0.4)" : "rgba(255,255,255,0.1)",
                color: currency === c ? "#9CFCAF" : "rgba(255,255,255,0.4)",
                transition: "all 0.15s ease",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Credit packs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {CREDIT_PACKS.map((pack, i) => (
            <motion.button
              key={pack.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handlePackClick(pack)}
              whileHover={{ x: 2 }}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(156,252,175,0.3)"; e.currentTarget.style.background = "rgba(156,252,175,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            >
              <div>
                <p style={{ fontSize: 16, fontFamily: FONT, fontWeight: 700, color: "#ffffff", margin: "0 0 3px" }}>
                  {pack.name}
                </p>
                <p style={{ fontSize: 14, fontFamily: FONT, color: "rgba(255,255,255,0.5)", margin: "0 0 3px" }}>
                  {pack.credits + pack.bonus} credits
                  {pack.bonus > 0 && (
                    <span style={{ fontSize: 12, color: "#9CFCAF", marginLeft: 6 }}>+{pack.bonus} bonus</span>
                  )}
                </p>
                <p style={{ fontSize: 11, fontFamily: FONT, color: "rgba(255,255,255,0.25)", margin: 0, fontStyle: "italic" }}>
                  {pack.tagline}
                </p>
                {pack.expires_days && (
                  <p style={{ fontSize: 11, fontFamily: FONT, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
                    Expires in {pack.expires_days} days
                  </p>
                )}
                {!pack.expires_days && (
                  <p style={{ fontSize: 11, fontFamily: FONT, color: "rgba(156,252,175,0.5)", marginTop: 2 }}>
                    Never expires
                  </p>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 20 }}>
                <p style={{ fontSize: 22, fontFamily: "'Instrument Serif', serif", color: "#ffffff", margin: "0 0 2px" }}>
                  {currency === "INR" ? `₹${pack.price_inr}` : `$${pack.price_usd}`}
                </p>
                <p style={{ fontSize: 11, fontFamily: FONT, color: "rgba(255,255,255,0.3)" }}>
                  {currency === "INR"
                    ? `≈ ₹${(pack.price_inr / (pack.credits + pack.bonus)).toFixed(2)}/credit`
                    : `≈ $${(pack.price_usd / (pack.credits + pack.bonus)).toFixed(3)}/credit`}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        <p style={{ marginTop: 28, fontSize: 12, fontFamily: FONT, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
          Payments powered by Razorpay · Secure checkout · GST included
        </p>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
              background: "#111111", border: "1px solid rgba(156,252,175,0.3)",
              borderRadius: 12, padding: "12px 20px",
              fontSize: 13, fontFamily: FONT, color: "#9CFCAF", zIndex: 1100, whiteSpace: "nowrap",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
