import { useState } from "react";
import { motion } from "framer-motion";
import { getCredits, translateCredits } from "../utils/credits";

const FONT = "'Instrument Sans', sans-serif";

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 11, fontFamily: FONT, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, disabled, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: "100%",
        maxWidth: 400,
        padding: "11px 14px",
        borderRadius: 10,
        fontSize: 14,
        fontFamily: FONT,
        background: disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: disabled ? "rgba(255,255,255,0.3)" : "#ffffff",
        caretColor: "#9CFCAF",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.18s",
      }}
      onFocus={(e) => !disabled && (e.currentTarget.style.borderColor = "rgba(156,252,175,0.4)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
    />
  );
}

export default function SettingsPage() {
  const [name,  setName]  = useState(localStorage.getItem("corex_user_name") || localStorage.getItem("userName") || "");
  const [brand, setBrand] = useState(localStorage.getItem("corex_brand_name") || "");
  const email = localStorage.getItem("userEmail") || "";
  const [saved, setSaved] = useState(false);

  const credits = getCredits();
  const planKey = localStorage.getItem("corex_plan") || "free";
  const planLabels = {
    free: "Free",
    spark: "SPARK",
    studio: "STUDIO",
    nineteen_twentys: "NINETEEN TWENTYS",
    canvas_enterprise: "CANVAS ENTERPRISE",
    nt: "NINETEEN TWENTYS",
  };
  const planName = planLabels[planKey] || "Free";

  function handleSave(e) {
    e.preventDefault();
    localStorage.setItem("corex_user_name", name.trim());
    localStorage.setItem("corex_brand_name", brand.trim());
    if (name.trim()) localStorage.setItem("userName", name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div
      className="page-enter"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "40px 32px",
        maxWidth: 560,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: "#ffffff", marginBottom: 36 }}>
        Settings
      </h1>

      {/* Section 1 — Your Identity */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 20 }}>
          Your Identity
        </h2>

        <form onSubmit={handleSave}>
          <Field label="Full name">
            <TextInput value={name} onChange={setName} placeholder="Your name" />
          </Field>
          <Field label="Brand / project name">
            <TextInput value={brand} onChange={setBrand} placeholder="e.g. Lumē Skincare, @yourhandle" />
          </Field>
          <Field label="Email">
            <TextInput value={email} onChange={() => {}} disabled />
          </Field>

          <motion.button
            type="submit"
            whileHover={{ translateY: -1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "11px 28px",
              borderRadius: 100,
              fontSize: 14,
              fontFamily: FONT,
              fontWeight: 600,
              background: saved
                ? "rgba(156,252,175,0.15)"
                : "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
              color: saved ? "#9CFCAF" : "#000000",
              border: saved ? "1px solid rgba(156,252,175,0.3)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {saved ? "Saved ✓" : "Save changes"}
          </motion.button>
        </form>
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 40 }} />

      {/* Section 2 — Your Plan */}
      <section>
        <h2 style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 20 }}>
          Your Plan
        </h2>

        <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 28, color: "#ffffff", marginBottom: 6 }}>
          {planName}
        </p>
        <p style={{ fontFamily: FONT, fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 24 }}>
          ⚡ {credits} credits remaining · {translateCredits(credits)}
        </p>

        <button
          onClick={() => document.dispatchEvent(new CustomEvent("corex:openCredits"))}
          style={{
            fontSize: 14,
            fontFamily: FONT,
            fontWeight: 600,
            color: "#9CFCAF",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Top up credits →
        </button>
      </section>

      {/* Delete account — tiny link at bottom */}
      <div style={{ marginTop: 80 }}>
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
              ["isLoggedIn","isVerified","sessionToken","sessionExpiry","corex_user_name","corex_brand_name","corex_credits","corex_plan","corex_profile_done"].forEach((k) => localStorage.removeItem(k));
              window.location.href = "/";
            }
          }}
          style={{ fontSize: 12, fontFamily: FONT, color: "rgba(255,255,255,0.2)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
