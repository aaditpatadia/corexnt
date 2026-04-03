import { useState } from "react";
import { useAuth } from "./Auth";

export default function Signup({ onSwitch }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    const { name, email, username, password } = form;
    if (!name.trim() || !email.trim() || !username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const result = await signup(name.trim(), email.trim().toLowerCase(), username.trim().toLowerCase(), password);
    setLoading(false);
    if (!result.ok) setError(result.error);
  };

  const fields = [
    { key: "name",     label: "Full Name",  type: "text",     placeholder: "Alex Johnson",        auto: "name" },
    { key: "email",    label: "Email",       type: "email",    placeholder: "alex@example.com",    auto: "email" },
    { key: "username", label: "Username",    type: "text",     placeholder: "alex_j",              auto: "username" },
    { key: "password", label: "Password",    type: "password", placeholder: "Min 6 characters",    auto: "new-password" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logo}>C</div>
          <div>
            <div style={styles.brand}>Corex</div>
            <div style={styles.tagline}>Creative Operating System</div>
          </div>
        </div>

        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.sub}>Start building smarter — it&apos;s free</p>

        <form onSubmit={handle} style={styles.form}>
          {fields.map(({ key, label, type, placeholder, auto }) => (
            <div key={key} style={styles.fieldGroup}>
              <label style={styles.label}>{label}</label>
              <input
                type={type}
                style={styles.input}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                autoComplete={auto}
                onFocus={(e) => (e.target.style.borderColor = "#7C6FFF")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          ))}

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? <span style={styles.spinner} /> : "Create account →"}
          </button>
        </form>

        <div style={styles.switchRow}>
          Already have an account?{" "}
          <span style={styles.link} onClick={onSwitch}>
            Sign in
          </span>
        </div>

        <p style={styles.legal}>
          By signing up you agree to our Terms. Your details are stored securely in your browser.
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input { color-scheme: dark; }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0C0C0D",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: "36px 32px",
    backdropFilter: "blur(20px)",
    animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg,#7C6FFF,#A78BFA)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
    fontFamily: "'Syne', sans-serif",
    boxShadow: "0 2px 14px rgba(124,111,255,0.4)",
  },
  brand: {
    fontSize: 16,
    fontWeight: 800,
    color: "#FAFAF9",
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  tagline: {
    fontSize: 9,
    color: "#636260",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginTop: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#FAFAF9",
    letterSpacing: "-0.03em",
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: "#636260",
    marginBottom: 28,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#A09F9C",
    letterSpacing: "0.02em",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    color: "#FAFAF9",
    outline: "none",
    transition: "border-color 0.15s",
    width: "100%",
  },
  error: {
    background: "rgba(251,113,133,0.1)",
    border: "1px solid rgba(251,113,133,0.25)",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    color: "#FB7185",
  },
  btn: {
    padding: "13px",
    borderRadius: 12,
    background: "linear-gradient(135deg,#7C6FFF,#A78BFA)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    marginTop: 4,
    letterSpacing: "-0.01em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "opacity 0.15s",
    boxShadow: "0 4px 20px rgba(124,111,255,0.35)",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  switchRow: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 13,
    color: "#636260",
  },
  link: {
    color: "#7C6FFF",
    cursor: "pointer",
    fontWeight: 600,
  },
  legal: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 11,
    color: "#3E3D3A",
    lineHeight: 1.5,
  },
};
