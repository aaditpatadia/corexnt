import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CREDIT_PACKS, getCredits, translateCredits } from "../utils/credits";

const FONT = "'Instrument Sans', sans-serif";

export default function CreditModal({ open, onClose }) {
  const [credits, setCredits] = useState(getCredits);
  const [currency, setCurrency] = useState("INR");
  const [toast, setToast] = useState(null);

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
    const email = localStorage.getItem("userEmail") || "";
    const waitlist = JSON.parse(localStorage.getItem("corex_waitlist") || "[]");
    if (!waitlist.includes(email) && email) {
      waitlist.push(email);
      localStorage.setItem("corex_waitlist", JSON.stringify(waitlist));
    }
    setToast("Razorpay integration coming soon — you're on the waitlist!");
    setTimeout(() => setToast(null), 3000);
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
                      {pack.tagline}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                    <p style={{ fontSize: 20, fontFamily: "'Instrument Serif', serif", color: "#ffffff", margin: 0 }}>
                      {currency === "INR" ? `₹${pack.price_inr}` : `$${pack.price_usd}`}
                    </p>
                  </div>
                </motion.button>
              ))}
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

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{
                  position: "fixed",
                  bottom: 32,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#111111",
                  border: "1px solid rgba(156,252,175,0.3)",
                  borderRadius: 12,
                  padding: "12px 20px",
                  fontSize: 13,
                  fontFamily: FONT,
                  color: "#9CFCAF",
                  zIndex: 1100,
                  whiteSpace: "nowrap",
                }}
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
