import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SECTIONS = ["Profile", "AI Preferences", "Account"];

const accent     = "#9CFCAF";
const accentRgba = "rgba(156,252,175,";

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

function TextInput({ value, onChange, placeholder, disabled, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: "100%", maxWidth: 400, padding: "11px 14px", borderRadius: 10, fontSize: 14,
        fontFamily: "var(--font-body)", background: disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)", color: disabled ? "rgba(255,255,255,0.35)" : "#ffffff",
        caretColor: accent, outline: "none", boxSizing: "border-box",
        transition: "border-color 0.18s",
      }}
      onFocus={e => !disabled && (e.currentTarget.style.borderColor = "rgba(156,252,175,0.4)")}
      onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
    />
  );
}

function ToggleRow({ label, active, onClick }) {
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

async function syncProfileToCloud(email, profile) {
  try {
    await fetch(`/api/profile?email=${encodeURIComponent(email)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });
  } catch {}
}

async function loadProfileFromCloud(email) {
  try {
    const res = await fetch(`/api/profile?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile || null;
  } catch { return null; }
}

export default function SettingsPage() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("Profile");
  const [saved,         setSaved]         = useState(false);
  const [syncing,       setSyncing]       = useState(false);
  const [syncMsg,       setSyncMsg]       = useState("");
  const [showDelete,    setShowDelete]    = useState(false);

  const email = localStorage.getItem("userEmail") || "";

  const [form, setForm] = useState({
    name:  localStorage.getItem("userName") || "",
    phone: localStorage.getItem("corex_phone") || "",
  });

  const aiPrefs = JSON.parse(localStorage.getItem("corex_ai_prefs") || '{"style":"Balanced","tone":"Friendly"}');
  const [style, setStyle] = useState(aiPrefs.style);
  const [tone,  setTone]  = useState(aiPrefs.tone);

  function handleSaveProfile() {
    localStorage.setItem("userName",    form.name);
    localStorage.setItem("corex_phone", form.phone);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Sync to cloud (best-effort)
    if (email) syncProfileToCloud(email, { name: form.name, phone: form.phone });
  }

  async function handleSyncFromCloud() {
    if (!email) { setSyncMsg("No email found. Please re-login."); return; }
    setSyncing(true);
    setSyncMsg("");
    const cloud = await loadProfileFromCloud(email);
    setSyncing(false);
    if (cloud) {
      setForm({ name: cloud.name || "", phone: cloud.phone || "" });
      localStorage.setItem("userName",    cloud.name  || "");
      localStorage.setItem("corex_phone", cloud.phone || "");
      setSyncMsg("Profile synced from cloud ✓");
    } else {
      setSyncMsg("No cloud profile found. Save your profile first.");
    }
    setTimeout(() => setSyncMsg(""), 3500);
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
    <div className="flex h-full overflow-hidden" style={{ background: "#000000" }}>

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
              border: activeSection === s ? `none` : "none",
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
                <h2 style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>
                  Your Profile
                </h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", marginBottom: 28, lineHeight: 1.5 }}>
                  Basic account details. Your profile syncs across devices with the same login.
                </p>

                <Field label="Full name">
                  <TextInput value={form.name} onChange={v => setForm(p=>({...p, name:v}))} placeholder="Your name" />
                </Field>

                <Field label="Phone number">
                  <TextInput type="tel" value={form.phone} onChange={v => setForm(p=>({...p, phone:v}))} placeholder="+91 98765 43210" />
                </Field>

                <Field label="Email">
                  <TextInput value={email} onChange={() => {}} placeholder="email@example.com" disabled />
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)", marginTop: 6 }}>
                    Email is linked to your Google account and cannot be changed.
                  </p>
                </Field>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
                  <motion.button onClick={handleSaveProfile}
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    style={{
                      padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                      background: saved ? "rgba(156,252,175,0.1)" : "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
                      color: saved ? "#9CFCAF" : "#000000",
                      border: saved ? "1px solid rgba(156,252,175,0.3)" : "none",
                      cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.2s ease",
                    }}>
                    {saved ? "Saved ✓" : "Save changes"}
                  </motion.button>

                  <button onClick={handleSyncFromCloud} disabled={syncing}
                    style={{
                      padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "var(--font-body)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color="#ffffff"; e.currentTarget.style.borderColor="rgba(255,255,255,0.25)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; }}>
                    {syncing ? "Syncing…" : "↓ Sync from cloud"}
                  </button>
                </div>

                {syncMsg && (
                  <motion.p initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                    style={{ fontSize: 13, color: syncMsg.includes("✓") ? "#9CFCAF" : "#f87171", fontFamily: "var(--font-body)", marginTop: 12 }}>
                    {syncMsg}
                  </motion.p>
                )}
              </div>
            )}

            {/* ── AI Preferences ── */}
            {activeSection === "AI Preferences" && (
              <div>
                <h2 style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 700, color: "#ffffff", marginBottom: 28 }}>
                  AI Preferences
                </h2>
                <Field label="Response style">
                  {["Concise", "Balanced", "Detailed"].map(s => (
                    <ToggleRow key={s}
                      label={s === "Concise" ? "Concise — shorter, punchier answers" : s === "Balanced" ? "Balanced — current default" : "Detailed — longer, more thorough"}
                      active={style === s} onClick={() => setStyle(s)} />
                  ))}
                </Field>
                <Field label="Tone">
                  {["Direct", "Friendly"].map(t => (
                    <ToggleRow key={t}
                      label={t === "Direct" ? "Direct — no pleasantries" : "Friendly — warm but professional"}
                      active={tone === t} onClick={() => setTone(t)} />
                  ))}
                </Field>
                <motion.button onClick={handleSaveAI}
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  style={{
                    marginTop: 8, padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                    background: saved ? "rgba(156,252,175,0.1)" : "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
                    color: saved ? "#9CFCAF" : "#000000",
                    border: saved ? "1px solid rgba(156,252,175,0.3)" : "none",
                    cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.2s ease",
                  }}>
                  {saved ? "Saved ✓" : "Save preferences"}
                </motion.button>
              </div>
            )}

            {/* ── Account ── */}
            {activeSection === "Account" && (
              <div>
                <h2 style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 700, color: "#ffffff", marginBottom: 28 }}>
                  Account
                </h2>
                <div style={{ padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 24, maxWidth: 400 }}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", marginBottom: 4 }}>Current plan</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <p style={{ fontSize: 18, fontFamily: "var(--font-display)", fontWeight: 700, color: "#ffffff" }}>Free</p>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px" }}>Free tier</span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", marginTop: 6 }}>15 messages per day · 5 projects</p>
                  <motion.button onClick={() => navigate("/app/payment")} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    style={{ marginTop: 14, padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)", color: "#000000", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                    Upgrade plan →
                  </motion.button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
                  <button onClick={handleSignOut}
                    style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14, fontFamily: "var(--font-body)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#ffffff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
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
              style={{ background: "#111111", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%" }}>
              <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)", color: "#ffffff", marginBottom: 8 }}>Delete your account?</p>
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
