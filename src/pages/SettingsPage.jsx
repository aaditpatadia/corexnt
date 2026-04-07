import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUserProfile, saveUserProfile } from "../utils/userProfile";

const SECTIONS = ["Profile", "AI Preferences", "Account"];

const NICHES    = ["Fitness", "Finance", "Comedy", "Fashion", "Food", "Tech", "Travel", "Business", "Lifestyle", "Other"];
const PLATFORMS = ["Instagram", "YouTube", "TikTok", "LinkedIn", "All"];
const FOLLOWERS = ["Under 1K", "1K–10K", "10K–50K", "50K–100K", "100K–500K", "500K+"];
const CHALLENGES = ["Getting more views", "Growing followers", "Brand deals", "Content ideas", "Going viral", "Monetising"];
const INDUSTRIES = ["D2C / E-commerce", "SaaS / Tech", "Food & Beverage", "Fashion", "Health & Wellness", "Finance", "Education", "Other"];
const BUDGETS   = ["Under ₹1L", "₹1–5L", "₹5–20L", "₹20–50L", "₹50L+", "Prefer not to say"];

function SelectPill({ options, value, onChange, accent, accentRgba }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          style={{
            padding: "7px 14px", borderRadius: 20, fontSize: 13, fontFamily: "var(--font-body)",
            background: value === opt ? `${accentRgba}0.12)` : "rgba(255,255,255,0.04)",
            border: value === opt ? `1px solid ${accentRgba}0.4)` : "1px solid rgba(255,255,255,0.08)",
            color: value === opt ? accent : "rgba(255,255,255,0.6)", cursor: "pointer", transition: "all 0.18s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#f0faf2"; }}
          onMouseLeave={e => { e.currentTarget.style.color = value === opt ? accent : "rgba(255,255,255,0.6)"; }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 10 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, disabled, accent }) {
  return (
    <input
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      disabled={disabled}
      style={{
        width: "100%", maxWidth: 400, padding: "11px 14px", borderRadius: 10, fontSize: 14,
        fontFamily: "var(--font-body)", background: disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)", color: disabled ? "rgba(255,255,255,0.35)" : "#f0faf2",
        caretColor: accent, outline: "none", boxSizing: "border-box",
      }}
      onFocus={e => !disabled && (e.currentTarget.style.borderColor = `rgba(${accent === "#2dd668" ? "45,214,104" : "167,139,250"},0.4)`)}
      onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
    />
  );
}

function ToggleRow({ label, active, onClick, accent, accentRgba }) {
  return (
    <button onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, width: "100%",
        maxWidth: 400, textAlign: "left", background: active ? `${accentRgba}0.06)` : "rgba(255,255,255,0.03)",
        border: active ? `1px solid ${accentRgba}0.25)` : "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer", transition: "all 0.18s ease", marginBottom: 8,
      }}>
      <div style={{
        width: 18, height: 18, borderRadius: 6, border: active ? "none" : "1.5px solid rgba(255,255,255,0.2)",
        background: active ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {active && <span style={{ fontSize: 11, color: "#050a06", fontWeight: 900 }}>✓</span>}
      </div>
      <span style={{ fontSize: 14, fontFamily: "var(--font-body)", color: active ? "#f0faf2" : "rgba(255,255,255,0.6)" }}>{label}</span>
    </button>
  );
}

export default function SettingsPage({ userType }) {
  const navigate   = useNavigate();
  const isCreator  = userType !== "company";
  const accent     = isCreator ? "#2dd668" : "#a78bfa";
  const accentRgba = isCreator ? "rgba(45,214,104," : "rgba(124,58,237,";
  const bgStyle    = isCreator
    ? { background: "#0a0f0b" }
    : { background: "#0a0a12" };

  const [activeSection, setActiveSection] = useState("Profile");
  const [saved,         setSaved]         = useState(false);
  const [showDelete,    setShowDelete]    = useState(false);

  const profile = getUserProfile() || {};
  const [form, setForm] = useState({
    name:        localStorage.getItem("userName") || "",
    niche:       profile.niche       || "",
    platform:    profile.platform    || "",
    followers:   profile.followers   || "",
    challenge:   profile.challenge   || "",
    company:     profile.company     || "",
    industry:    profile.industry    || "",
    competitors: profile.competitors || "",
    budget:      profile.budget      || "",
  });

  const aiPrefs = JSON.parse(localStorage.getItem("corex_ai_prefs") || '{"style":"Balanced","tone":"Friendly"}');
  const [style, setStyle] = useState(aiPrefs.style);
  const [tone,  setTone]  = useState(aiPrefs.tone);

  const f = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

  function handleSaveProfile() {
    localStorage.setItem("userName", form.name);
    saveUserProfile({ ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleSaveAI() {
    localStorage.setItem("corex_ai_prefs", JSON.stringify({ style, tone }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleSignOut() {
    ["isLoggedIn","isVerified","sessionToken","sessionExpiry"].forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
    navigate("/", { replace: true });
  }

  function handleDeleteAccount() {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/", { replace: true });
  }

  return (
    <div className="flex h-full overflow-hidden" style={bgStyle}>

      {/* Left nav */}
      <div style={{ width: 200, flexShrink: 0, padding: "32px 0 32px 24px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "var(--font-body)", marginBottom: 20, paddingLeft: 8 }}>
          Settings
        </p>
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            style={{
              display: "block", width: "calc(100% - 8px)", padding: "10px 12px", borderRadius: 10, textAlign: "left",
              fontSize: 14, fontFamily: "var(--font-body)", cursor: "pointer", transition: "all 0.18s ease", marginBottom: 4,
              background: activeSection === s ? `${accentRgba}0.08)` : "transparent",
              color: activeSection === s ? accent : "rgba(255,255,255,0.5)",
              fontWeight: activeSection === s ? 600 : 400,
              borderLeft: activeSection === s ? `2px solid ${accent}` : "2px solid transparent",
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Right content */}
      <div className="flex-1 overflow-y-auto scroll-area" style={{ padding: "32px 32px 48px" }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeSection}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}>

            {/* ── Profile ── */}
            {activeSection === "Profile" && (
              <div>
                <h2 style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 700, color: "#f0faf2", marginBottom: 28 }}>
                  Your Profile
                </h2>
                <Field label="Full name">
                  <TextInput value={form.name} onChange={f("name")} placeholder="Your name" accent={accent} />
                </Field>
                <Field label="Email">
                  <TextInput value={localStorage.getItem("userEmail") || ""} onChange={() => {}} placeholder="email@example.com" disabled accent={accent} />
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)", marginTop: 6 }}>Email cannot be changed.</p>
                </Field>

                {isCreator ? (
                  <>
                    <Field label="Content niche">
                      <SelectPill options={NICHES} value={form.niche} onChange={f("niche")} accent={accent} accentRgba={accentRgba} />
                    </Field>
                    <Field label="Main platform">
                      <SelectPill options={PLATFORMS} value={form.platform} onChange={f("platform")} accent={accent} accentRgba={accentRgba} />
                    </Field>
                    <Field label="Followers">
                      <SelectPill options={FOLLOWERS} value={form.followers} onChange={f("followers")} accent={accent} accentRgba={accentRgba} />
                    </Field>
                    <Field label="Biggest challenge">
                      <SelectPill options={CHALLENGES} value={form.challenge} onChange={f("challenge")} accent={accent} accentRgba={accentRgba} />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="Company / Brand name">
                      <TextInput value={form.company} onChange={f("company")} placeholder="Your brand name" accent={accent} />
                    </Field>
                    <Field label="Industry">
                      <SelectPill options={INDUSTRIES} value={form.industry} onChange={f("industry")} accent={accent} accentRgba={accentRgba} />
                    </Field>
                    <Field label="Main competitors">
                      <TextInput value={form.competitors} onChange={f("competitors")} placeholder="Comma separated, e.g. Blinkit, Zepto" accent={accent} />
                    </Field>
                    <Field label="Monthly marketing budget">
                      <SelectPill options={BUDGETS} value={form.budget} onChange={f("budget")} accent={accent} accentRgba={accentRgba} />
                    </Field>
                  </>
                )}

                <motion.button onClick={handleSaveProfile}
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  style={{
                    marginTop: 8, padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                    background: saved ? "rgba(45,214,104,0.15)" : `linear-gradient(135deg, ${isCreator ? "#1a7a3c,#2dd668" : "#7c3aed,#a78bfa"})`,
                    color: saved ? "#2dd668" : (isCreator ? "#050a06" : "#fff"), border: saved ? "1px solid rgba(45,214,104,0.3)" : "none",
                    cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.2s ease",
                  }}>
                  {saved ? "Saved ✓" : "Save changes"}
                </motion.button>
              </div>
            )}

            {/* ── AI Preferences ── */}
            {activeSection === "AI Preferences" && (
              <div>
                <h2 style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 700, color: "#f0faf2", marginBottom: 28 }}>
                  AI Preferences
                </h2>
                <Field label="Response style">
                  {["Concise", "Balanced", "Detailed"].map(s => (
                    <ToggleRow key={s} label={s === "Concise" ? "Concise — shorter, punchier answers" : s === "Balanced" ? "Balanced — current default" : "Detailed — longer, more thorough"}
                      active={style === s} onClick={() => setStyle(s)} accent={accent} accentRgba={accentRgba} />
                  ))}
                </Field>
                <Field label="Tone">
                  {["Direct", "Friendly"].map(t => (
                    <ToggleRow key={t} label={t === "Direct" ? "Direct — no pleasantries" : "Friendly — warm but professional"}
                      active={tone === t} onClick={() => setTone(t)} accent={accent} accentRgba={accentRgba} />
                  ))}
                </Field>
                <motion.button onClick={handleSaveAI}
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  style={{
                    marginTop: 8, padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                    background: saved ? "rgba(45,214,104,0.15)" : `linear-gradient(135deg, ${isCreator ? "#1a7a3c,#2dd668" : "#7c3aed,#a78bfa"})`,
                    color: saved ? "#2dd668" : (isCreator ? "#050a06" : "#fff"), border: saved ? "1px solid rgba(45,214,104,0.3)" : "none",
                    cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.2s ease",
                  }}>
                  {saved ? "Saved ✓" : "Save preferences"}
                </motion.button>
              </div>
            )}

            {/* ── Account ── */}
            {activeSection === "Account" && (
              <div>
                <h2 style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 700, color: "#f0faf2", marginBottom: 28 }}>
                  Account
                </h2>
                <div style={{ padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 24, maxWidth: 400 }}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", marginBottom: 4 }}>Current plan</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <p style={{ fontSize: 18, fontFamily: "var(--font-display)", fontWeight: 700, color: "#f0faf2" }}>Free</p>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px" }}>Free tier</span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", marginTop: 6 }}>15 messages per day</p>
                  <motion.button onClick={() => navigate("/app/payment")} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    style={{ marginTop: 14, padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: `linear-gradient(135deg, ${isCreator ? "#1a7a3c,#2dd668" : "#7c3aed,#a78bfa"})`, color: isCreator ? "#050a06" : "#fff", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                    Upgrade plan →
                  </motion.button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
                  <button onClick={handleSignOut}
                    style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14, fontFamily: "var(--font-body)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#f0faf2"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
                    🚪 Sign out
                  </button>
                  <button onClick={() => setShowDelete(true)}
                    style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14, fontFamily: "var(--font-body)", background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)", color: "rgba(248,113,113,0.6)", cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#f87171"} onMouseLeave={e => e.currentTarget.style.color = "rgba(248,113,113,0.6)"}>
                    🗑 Delete account
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#0d1410", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%" }}>
              <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)", color: "#f0faf2", marginBottom: 8 }}>Delete your account?</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", marginBottom: 24, lineHeight: 1.6 }}>This will permanently delete all your conversations, profile, and settings. This cannot be undone.</p>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleDeleteAccount}
                  style={{ flex: 1, padding: "11px 16px", borderRadius: 12, fontSize: 14, fontWeight: 700, background: "#ef4444", color: "#fff", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                  Yes, delete everything
                </button>
                <button onClick={() => setShowDelete(false)}
                  style={{ padding: "11px 20px", borderRadius: 12, fontSize: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
