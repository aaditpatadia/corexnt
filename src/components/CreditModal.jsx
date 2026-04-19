import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CREDIT_PACKS, getCredits, translateCredits, applyCoupon } from "../utils/credits";

const FONT = "'Instrument Sans', sans-serif";

export default function CreditModal({ open, onClose, onSelectPack }) {
  const [credits, setCredits] = useState(getCredits);
  const [currency, setCurrency] = useState("INR");
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  useEffect(() => {
    if (open) setCredits(getCredits());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function handlePackClick(pack) {
    onClose();
    if (onSelectPack) onSelectPack(pack);
  }

  function handleApplyCoupon() {
    const result = applyCoupon(couponCode.trim().toUpperCase());
    if (result.success || result.ok) {
      setCouponMsg(`✓ ${result.message || result.msg}`);
      setCouponCode("");
      setCredits(getCredits());
    } else {
      setCouponMsg(result.message || result.msg || "Invalid code.");
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: 28,
              maxWidth: 480,
              width: "100%",
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 24, fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "#ffffff", margin: "0 0 4px" }}>
                ⚡ {credits} credits remaining
              </p>
              <p style={{ fontSize: 14, fontFamily: FONT, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                {translateCredits(credits)}
              </p>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 20 }} />

            {/* Currency toggle */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {["INR", "USD"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 100,
                    fontSize: 11,
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

            {/* Pack cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CREDIT_PACKS.map((pack) => (
                <motion.button
                  key={pack.id}
                  onClick={() => handlePackClick(pack)}
                  whileHover={{ x: 2, borderColor: "rgba(156,252,175,0.3)" }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div>
                    <p style={{ fontSize: 15, fontFamily: FONT, fontWeight: 600, color: "#ffffff", margin: "0 0 2px" }}>
                      {pack.name}
                    </p>
                    <p style={{ fontSize: 13, fontFamily: FONT, color: "rgba(255,255,255,0.45)", margin: "0 0 2px" }}>
                      {pack.credits + pack.bonus} credits{pack.bonus > 0 ? ` (${pack.credits} + ${pack.bonus} bonus)` : ""}
                    </p>
                    <p style={{ fontSize: 11, fontFamily: FONT, color: "rgba(255,255,255,0.25)", margin: 0, fontStyle: "italic" }}>
                      {pack.tag}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                    <p style={{ fontSize: 20, fontFamily: "'Instrument Serif', serif", color: "#ffffff", margin: 0 }}>
                      {currency === "INR" ? `₹${pack.inr.toLocaleString('en-IN')}` : `$${pack.usd}`}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Coupon Code section */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <label style={{ fontSize: 11, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Coupon Code
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 8, fontSize: 14,
                    fontFamily: FONT, background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff',
                    outline: 'none', caretColor: '#9CFCAF',
                  }}
                />
                <button
                  onClick={handleApplyCoupon}
                  style={{
                    padding: '10px 18px', borderRadius: 8, fontSize: 13, fontFamily: FONT,
                    fontWeight: 600, background: 'rgba(156,252,175,0.1)',
                    border: '1px solid rgba(156,252,175,0.2)', color: '#9CFCAF',
                    cursor: 'pointer',
                  }}
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p style={{ fontFamily: FONT, fontSize: 13, color: couponMsg.includes('✓') ? '#9CFCAF' : '#f87171', marginTop: 8 }}>
                  {couponMsg}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "11px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent",
                color: "rgba(255,255,255,0.35)",
                fontSize: 13,
                fontFamily: FONT,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
