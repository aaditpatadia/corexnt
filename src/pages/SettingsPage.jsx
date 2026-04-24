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
        padding: "40px 24px",
        maxWidth: 600,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: "#ffffff", marginBottom: 24 }}>
        Settings
      </h1>

      {/* Avatar / profile card */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36, padding: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #226FF7, #9CFCAF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 700, color: "#000", fontFamily: FONT,
          flexShrink: 0,
        }}>
          {(name || email || "U")[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: "#ffffff" }}>{name || "Your Name"}</div>
          <div style={{ fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{email}</div>
        </div>
      </div>

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

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "20px 20px" }}>
          <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 28, color: "#ffffff", marginBottom: 6 }}>
            {planName}
          </p>
          <p style={{ fontFamily: FONT, fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
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
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 40, marginTop: 40 }} />

      {/* Section 3 — Connect with us */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20 }}>
          Connect with COREX
        </h2>

        {/* FlipLink social links */}
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          {[
            { label: "Twitter",   href: "https://x.com/corexnt",                          color: "#1DA1F2" },
            { label: "Instagram", href: "https://www.instagram.com/corexnt/",              color: "#E1306C" },
            { label: "LinkedIn",  href: "https://www.linkedin.com/in/corexnt/",            color: "#0A66C2" },
            { label: "Reddit",    href: "https://www.reddit.com/user/corexnt/",            color: "#FF4500" },
            { label: "Gmail",     href: "mailto:corexnt@gmail.com",                        color: "#9CFCAF" },
          ].map(({ label, href, color }, i) => (
            <motion.a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              whileHover={{ x: 6 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: 'rgba(255,255,255,0.02)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
            >
              <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: '#ffffff' }}>{label}</span>
              <span style={{ fontFamily: FONT, fontSize: 12, color, fontWeight: 600 }}>Open →</span>
            </motion.a>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>
          DMs open on all platforms · corexnt@gmail.com
        </p>
      </section>

      {/* Delete account — tiny link at bottom */}
      <div style={{ marginTop: 80 }}>
        <button
          onClick={() => {
            if (window.confirm("Delete your account? All your conversations, credits, and settings will be permanently erased.")) {
              // Wipe everything — localStorage + sessionStorage
              localStorage.clear();
              sessionStorage.clear();
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
