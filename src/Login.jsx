import { useState } from "react";

export default function Login({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const result = login(form.username.trim(), form.password);
    setLoading(false);
    if (!result.ok) setError(result.error);
  };

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

        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Sign in to continue building</p>

        <form onSubmit={handle} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              placeholder="your_username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="username"
              onFocus={(e) => (e.target.style.borderColor = "#7C6FFF")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
              onFocus={(e) => (e.target.style.borderColor = "#7C6FFF")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? <span style={styles.spinner} /> : "Sign in"}
          </button>
        </form>

        <div style={styles.switchRow}>
          Don&apos;t have an account?{" "}
          <span style={styles.link} onClick={onSwitch}>
            Create one
          </span>
        </div>
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
    gap: 16,
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
    transition: "opacity 0.15s, transform 0.15s",
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
};
