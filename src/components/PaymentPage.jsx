import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { PACKS, getCredits, translate, applyCoupon } from "../utils/credits";
import PaymentModal from "./PaymentModal";

const FONT = "'Instrument Sans', sans-serif";

export default function PaymentPage() {
  const location = useLocation();
  const initialPackId = location.state?.selectedPack || null;
  const initialPack = initialPackId ? PACKS.find((p) => p.id === initialPackId) : null;

  const [currency, setCurrency] = useState("INR");
  const [selectedPack, setSelectedPack] = useState(initialPack || null);
  const [modalOpen, setModalOpen] = useState(!!initialPack);
  const [coupon, setCoupon] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const credits = getCredits();

  function handleApplyCoupon() {
    if (!coupon.trim()) return;
    const result = applyCoupon(coupon.trim());
    setCouponResult(result);
  }

  return (
    <div
      className="page-enter"
      style={{ flex: 1, overflowY: "auto", padding: "40px 24px", background: "#000000" }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(24px, 4vw, 32px)",
            color: "#ffffff",
            marginBottom: 8,
          }}
        >
          Top up credits
        </h1>

        {/* Section A — Current Status */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 32,
          }}
        >
          <p style={{ fontSize: 28, fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "#ffffff", margin: "0 0 4px" }}>
            ⚡ {credits} credits
          </p>
          <p style={{ fontSize: 13, fontFamily: FONT, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            {translate(credits)}
          </p>
        </div>

        {/* Currency toggle */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
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

        {/* Section B — Pack cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {PACKS.map((pack, i) => {
            const isStudio = pack.id === "studio";
            const total = pack.credits + pack.bonus;

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: "relative" }}
              >
                {/* Most popular pill */}
                {isStudio && (
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      right: 16,
                      background: "rgba(156,252,175,0.15)",
                      border: "1px solid rgba(156,252,175,0.35)",
                      borderRadius: 100,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontFamily: FONT,
                      fontWeight: 600,
                      color: "#9CFCAF",
                      zIndex: 1,
                    }}
                  >
                    Most popular
                  </div>
                )}

                <div
                  style={{
                    background: "#111111",
                    border: `1px solid ${isStudio ? "rgba(156,252,175,0.3)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 16,
                    padding: 24,
                  }}
                >
                  {/* Pack name */}
                  <p style={{ fontSize: 16, fontFamily: FONT, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>
                    {pack.name}
                  </p>

                  {/* Credits */}
                  <p style={{ fontSize: 14, fontFamily: FONT, color: "rgba(255,255,255,0.5)", margin: "0 0 4px" }}>
                    {pack.credits} credits
                    {pack.bonus > 0 && (
                      <>
                        {" "}+{" "}
                        <span style={{ background: "linear-gradient(90deg, #9CFCAF, #6BC3CE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                          {pack.bonus} bonus
                        </span>
                        {" "}={" "}
                        <span style={{ background: "linear-gradient(90deg, #FFEA71, #9CFCAF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 600 }}>
                          {total} total
                        </span>
                      </>
                    )}
                  </p>

                  {/* Price */}
                  <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: "#ffffff", margin: "8px 0 4px", fontWeight: 400 }}>
                    {currency === "INR" ? `₹${pack.inr}` : `$${pack.usd}`}
                  </p>

                  {/* Tagline */}
                  <p style={{ fontSize: 13, fontFamily: FONT, color: "rgba(255,255,255,0.5)", fontStyle: "italic", margin: "0 0 6px" }}>
                    {pack.tag}
                  </p>

                  {/* Expires */}
                  <p style={{ fontSize: 12, fontFamily: FONT, margin: "0 0 16px", color: pack.expires ? "rgba(255,255,255,0.35)" : "#9CFCAF" }}>
                    {pack.expires ? `Credits expire in ${pack.expires} days` : "Never expires"}
                  </p>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedPack(pack); setModalOpen(true); }}
                    style={{
                      width: "100%",
                      padding: "12px 0",
                      borderRadius: 100,
                      fontSize: 14,
                      fontFamily: FONT,
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
                      color: "#000000",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Pay via UPI / Bank Transfer
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Section C — Coupon */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <p style={{ fontSize: 13, fontFamily: FONT, fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
            Coupon code
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={coupon}
              onChange={(e) => { setCoupon(e.target.value); setCouponResult(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              placeholder="e.g. LAUNCH50"
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 14,
                fontFamily: FONT,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ffffff",
                caretColor: "#9CFCAF",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(156,252,175,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            <button
              onClick={handleApplyCoupon}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontFamily: FONT,
                fontWeight: 600,
                background: "rgba(156,252,175,0.1)",
                border: "1px solid rgba(156,252,175,0.25)",
                color: "#9CFCAF",
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>
          <AnimatePresence>
            {couponResult && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 13,
                  fontFamily: FONT,
                  color: couponResult.ok ? "#9CFCAF" : "#f87171",
                  margin: "10px 0 0",
                }}
              >
                {couponResult.msg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        pack={selectedPack}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedPack(null); }}
      />
    </div>
  );
}
