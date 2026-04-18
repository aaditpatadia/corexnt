import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const FONT = "'Instrument Sans', sans-serif";

export default function PaymentModal({ pack, open, onClose }) {
  const [name, setName] = useState(localStorage.getItem("corex_user_name") || "");
  const email = localStorage.getItem("userEmail") || "";
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (pack) setAmount(String(pack.inr));
  }, [pack]);

  useEffect(() => {
    if (!open) { setSuccess(false); setError(""); setTxnId(""); setBankOpen(false); setCopied(false); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !pack) return null;

  const totalCredits = pack.credits + pack.bonus;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!txnId.trim()) { setError("UPI Transaction ID is required."); return; }
    setSubmitting(true);

    const payload = {
      name: name.trim(),
      email,
      amount: Number(amount),
      txnId: txnId.trim(),
      pack: pack.id,
      ts: Date.now(),
      status: "pending",
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("corex_pending_payments") || "[]");
    existing.push(payload);
    localStorage.setItem("corex_pending_payments", JSON.stringify(existing));

    // Save to Firebase
    await setDoc(doc(db, "pending_payments", txnId.trim()), payload).catch(() => {});

    setSubmitting(false);
    setSuccess(true);
  }

  function handleCopyUPI() {
    navigator.clipboard.writeText("7383620725").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            overflowY: "auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: 28,
              maxWidth: 440,
              width: "100%",
              fontFamily: FONT,
            }}
          >
            {success ? (
              /* Success screen */
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <p style={{ fontSize: 40, margin: "0 0 16px" }}>✓</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", margin: "0 0 10px" }}>
                  Received! We'll add your {totalCredits} credits within 1 hour.
                </p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>
                  Questions? WhatsApp{" "}
                  <a
                    href="https://wa.me/917383620725"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#9CFCAF", textDecoration: "none" }}
                  >
                    7383620725
                  </a>
                </p>
                <button
                  onClick={onClose}
                  style={{
                    padding: "11px 32px",
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
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <p style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", margin: "0 0 4px" }}>
                  Pay{" "}
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
                    {pack.name}
                  </span>
                  {" "}— ₹{pack.inr} for {totalCredits} credits
                </p>

                <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "20px 0" }} />

                {/* UPI ID */}
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>
                  UPI ID
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 6,
                  }}
                >
                  <code style={{ flex: 1, fontSize: 16, fontFamily: "monospace", color: "#ffffff", letterSpacing: "0.5px" }}>
                    7383620725
                  </code>
                  <button
                    onClick={handleCopyUPI}
                    style={{
                      fontSize: 12,
                      fontFamily: FONT,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: copied ? "#9CFCAF" : "rgba(255,255,255,0.45)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: "0 0 20px" }}>
                  PhonePe / GPay / any UPI app
                </p>

                {/* QR code if env var set */}
                {import.meta.env.VITE_PAYMENT_QR && (
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <img
                      src={import.meta.env.VITE_PAYMENT_QR}
                      alt="Payment QR"
                      style={{ width: 180, height: 180, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "8px 0 0" }}>Scan to pay</p>
                  </div>
                )}

                {/* Bank details — collapsible */}
                <button
                  onClick={() => setBankOpen((v) => !v)}
                  style={{
                    fontSize: 13,
                    fontFamily: FONT,
                    color: "rgba(255,255,255,0.4)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    marginBottom: bankOpen ? 12 : 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  View bank details {bankOpen ? "↑" : "↓"}
                </button>

                <AnimatePresence>
                  {bankOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: "hidden", marginBottom: 20 }}
                    >
                      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px" }}>
                        {[
                          ["Account", import.meta.env.VITE_BANK_ACCOUNT || "443003001008266"],
                          ["IFSC", import.meta.env.VITE_BANK_IFSC || "IBKL0JIVAN1"],
                          ["Name", import.meta.env.VITE_BANK_NAME || "AADIT SIDDHARTH PATADIA"],
                        ].map(([label, value]) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: FONT }}>{label}</span>
                            <span style={{ fontSize: 12, color: "#ffffff", fontFamily: "monospace", letterSpacing: "0.3px" }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 20 }} />

                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>
                  After payment, confirm here:
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Name */}
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(156,252,175,0.4)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                  />

                  {/* Email — read only */}
                  <input
                    value={email}
                    readOnly
                    style={{ ...inputStyle, color: "rgba(255,255,255,0.3)", cursor: "default" }}
                  />

                  {/* Amount */}
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount paid (₹)"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(156,252,175,0.4)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                  />

                  {/* UPI Transaction ID */}
                  <input
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    placeholder="UPI Transaction ID *"
                    required
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(156,252,175,0.4)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                  />

                  {error && (
                    <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>{error}</p>
                  )}

                  <motion.button
                    type="submit"
                    whileHover={{ translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "13px 0",
                      borderRadius: 100,
                      fontSize: 15,
                      fontFamily: FONT,
                      fontWeight: 600,
                      background: submitting
                        ? "rgba(255,255,255,0.05)"
                        : "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
                      color: submitting ? "rgba(255,255,255,0.3)" : "#000000",
                      border: "none",
                      cursor: submitting ? "not-allowed" : "pointer",
                      marginTop: 4,
                    }}
                  >
                    {submitting ? "Sending…" : "Confirm payment →"}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "'Instrument Sans', sans-serif",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#ffffff",
  caretColor: "#9CFCAF",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.18s",
};
