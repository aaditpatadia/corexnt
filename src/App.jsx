import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Onboarding    from "./components/Onboarding";
import SignupForm    from "./components/SignupForm";
import LoginForm     from "./components/LoginForm";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard     from "./components/Dashboard";
import PaymentPage   from "./components/PaymentPage";

/* ── Page transition wrapper ── */
const PageWrap = ({ children }) => (
  <motion.div
    key="page"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    style={{ position: "absolute", inset: 0 }}
  >
    {children}
  </motion.div>
);

/* ── Determine initial screen from localStorage ── */
function getInitialScreen() {
  const isLoggedIn = localStorage.getItem("corex_isLoggedIn") === "true";
  if (isLoggedIn) return "dashboard";
  const userType = localStorage.getItem("corex_userType");
  if (userType) return "login";
  return "onboarding";
}

export default function App() {
  const [screen,   setScreen]   = useState(getInitialScreen);
  const [prevUserType, setPrevUserType] = useState(
    () => localStorage.getItem("corex_userType") || "creator"
  );

  const userType = localStorage.getItem("corex_userType") || prevUserType;

  const goTo = (s) => setScreen(s);

  const handleOnboardingSelect = (type) => {
    setPrevUserType(type);
    goTo("signup");
  };

  const handleAuthSuccess = () => {
    goTo("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("corex_isLoggedIn");
    sessionStorage.removeItem("corex_chat");
    goTo("login");
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden grain"
      style={{ background: "#080810" }}
    >
      {/* Fixed background orbs (shown on auth screens) */}
      {screen !== "dashboard" && (
        <>
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </>
      )}

      {/* Auth screens scrollable container */}
      {screen !== "dashboard" && (
        <div className="absolute inset-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            {screen === "onboarding" && (
              <PageWrap key="onboarding">
                <Onboarding onSelect={handleOnboardingSelect} />
              </PageWrap>
            )}

            {screen === "signup" && (
              <PageWrap key="signup">
                <SignupForm
                  userType={userType}
                  onSuccess={handleAuthSuccess}
                  onLoginClick={() => goTo("login")}
                  onBack={() => goTo("onboarding")}
                />
              </PageWrap>
            )}

            {screen === "login" && (
              <PageWrap key="login">
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onSignupClick={() => goTo("signup")}
                  onForgotClick={() => goTo("forgot")}
                  onBack={() => goTo("onboarding")}
                />
              </PageWrap>
            )}

            {screen === "forgot" && (
              <PageWrap key="forgot">
                <ForgotPassword onBack={() => goTo("login")} />
              </PageWrap>
            )}

            {screen === "payment" && (
              <PageWrap key="payment">
                <PaymentPage
                  userType={userType}
                  onBack={() => goTo("dashboard")}
                />
              </PageWrap>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Dashboard (full screen, no scroll wrapper) */}
      {screen === "dashboard" && (
        <Dashboard
          onUpgrade={() => goTo("payment")}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
