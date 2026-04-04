import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LandingPage from "./components/LandingPage";
import AppShell    from "./components/AppShell";

/* ── Floating background orbs (shown on every page) ── */
function Orbs() {
  return (
    <>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </>
  );
}

export default function App() {
  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Orbs />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/"    element={<LandingPage />} />
          <Route path="/app" element={<AppShell />}    />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
