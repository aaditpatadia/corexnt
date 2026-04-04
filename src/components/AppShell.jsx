import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Onboarding     from "./Onboarding";
import SignupForm     from "./SignupForm";
import LoginForm      from "./LoginForm";
import ForgotPassword from "./ForgotPassword";
import CreatorDashboard from "./CreatorDashboard";
import CompanyDashboard from "./CompanyDashboard";
import PaymentPage    from "./PaymentPage";

function getInitialScreen() {
  const isLoggedIn = localStorage.getItem("corex_isLoggedIn") === "true";
  if (isLoggedIn) return "dashboard";
  const userType = localStorage.getItem("corex_userType");
  return userType ? "login" : "onboarding";
}

const PageWrap = ({ children, key: k }) => (
  <motion.div
    key={k}
    initial={{ opacity:0, y:10 }}
    animate={{ opacity:1, y:0 }}
    exit={{ opacity:0, y:-10 }}
    transition={{ duration:0.3, ease:[0.16,1,0.3,1] }}
    style={{ position:"absolute", inset:0, overflowY:"auto" }}
  >
    {children}
  </motion.div>
);

export default function AppShell() {
  const [screen, setScreen] = useState(getInitialScreen);
  const [userType, setUserType] = useState(
    () => localStorage.getItem("corex_userType") || "creator"
  );

  const go = (s) => setScreen(s);

  const handleOnboardingSelect = (type) => {
    setUserType(type);
    localStorage.setItem("corex_userType", type);
    go("signup");
  };

  const handleAuthSuccess = () => go("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("corex_isLoggedIn");
    sessionStorage.removeItem("corex_chat");
    setScreen("login");
  };

  if (screen === "dashboard") {
    const type = localStorage.getItem("corex_userType") || userType;
    return type === "company"
      ? <CompanyDashboard onUpgrade={() => go("payment")} onLogout={handleLogout} />
      : <CreatorDashboard onUpgrade={() => go("payment")} onLogout={handleLogout} />;
  }

  if (screen === "payment") {
    return <PaymentPage onBack={() => go("dashboard")} userType={localStorage.getItem("corex_userType") || userType} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background:"var(--bg-base)" }}>
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
              onLoginClick={() => go("login")}
              onBack={() => go("onboarding")}
            />
          </PageWrap>
        )}
        {screen === "login" && (
          <PageWrap key="login">
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSignupClick={() => go("signup")}
              onForgotClick={() => go("forgot")}
              onBack={() => go("onboarding")}
            />
          </PageWrap>
        )}
        {screen === "forgot" && (
          <PageWrap key="forgot">
            <ForgotPassword onBack={() => go("login")} />
          </PageWrap>
        )}
      </AnimatePresence>
    </div>
  );
}
