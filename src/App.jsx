import { Routes, Route, Navigate } from "react-router-dom";
import { Component, createContext, useContext, useEffect, useState } from "react";
import { ToastProvider, setGlobalToast, useToast } from "./components/Toast";
import MainLanding    from "./pages/MainLanding";
import CreatorLanding from "./pages/CreatorLanding";
import BrandLanding   from "./pages/BrandLanding";
import AppShell       from "./components/AppShell";
import SharedChat     from "./pages/app/SharedChat";
import AdminPage      from "./pages/AdminPage";
import ShootPlanner   from "./pages/app/ShootPlanner";
import CreatorEngine  from "./pages/app/CreatorEngine";
import { getPlanTheme, getCurrentPlan, applyTheme, PLAN_THEMES } from "./utils/planTheme";

/* ── Theme context ── */
export const ThemeContext = createContext(PLAN_THEMES.free);

export function useTheme() {
  return useContext(ThemeContext);
}

/* ── Global error boundary ── */
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
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
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
  const [currentTheme, setCurrentTheme] = useState(() => getPlanTheme(getCurrentPlan()));

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Expose theme setter globally so AppShell admin bar can trigger it
  useEffect(() => {
    window.__corex_setTheme = (planKey) => {
      const theme = getPlanTheme(planKey);
      setCurrentTheme(theme);
      applyTheme(theme);
    };
    return () => { delete window.__corex_setTheme; };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={currentTheme}>
        <ToastProvider>
          <ToastBridge />
          <Routes>
            <Route path="/"         element={<MainLanding />} />
            <Route path="/creators" element={<Navigate to="/" replace />} />
            <Route path="/brands"   element={<Navigate to="/" replace />} />
            <Route path="/app/*"    element={<AppShell />} />
            <Route path="/share/:shareId"   element={<SharedChat />} />
            <Route path="/shared/:shareId" element={<SharedChat />} />
            <Route path="/admin"    element={<AdminPage />} />
            <Route path="*"         element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}
