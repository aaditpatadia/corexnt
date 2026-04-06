import { Routes, Route, Navigate } from "react-router-dom";
import { Component }  from "react";
import { ToastProvider, setGlobalToast, useToast } from "./components/Toast";
import MainLanding    from "./pages/MainLanding";
import CreatorLanding from "./pages/CreatorLanding";
import BrandLanding   from "./pages/BrandLanding";
import AppShell       from "./components/AppShell";
import { useEffect }  from "react";

/* ── Global error boundary — prevents blank screen on runtime crash ── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[Corex] Runtime error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#050a06", color: "#f0faf2", fontFamily: "system-ui, sans-serif",
          padding: 32, textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ color: "rgba(240,250,242,0.5)", fontSize: 14, marginBottom: 24, maxWidth: 360 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = "/"; }}
            style={{
              background: "linear-gradient(135deg,#1a7a3c,#2dd668)",
              color: "#050a06", fontWeight: 700, fontSize: 14,
              padding: "10px 24px", borderRadius: 12, border: "none", cursor: "pointer",
            }}>
            Back to home
          </button>
          <p style={{ color: "rgba(240,250,242,0.2)", fontSize: 11, marginTop: 32 }}>
            Corex v5.3 — {this.state.error?.stack?.split("\n")[0] || ""}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function ToastBridge() {
  const show = useToast();
  useEffect(() => { setGlobalToast(show); }, [show]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ToastBridge />
        <Routes>
          <Route path="/"         element={<MainLanding />} />
          <Route path="/creators" element={<CreatorLanding />} />
          <Route path="/brands"   element={<BrandLanding />} />
          <Route path="/app/*"    element={<AppShell />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </ErrorBoundary>
  );
}
