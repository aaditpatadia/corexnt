import { Routes, Route, Navigate } from "react-router-dom";
import CustomCursor   from "./components/CustomCursor";
import { ToastProvider, setGlobalToast, useToast } from "./components/Toast";
import MainLanding    from "./pages/MainLanding";
import CreatorLanding from "./pages/CreatorLanding";
import BrandLanding   from "./pages/BrandLanding";
import AppShell       from "./components/AppShell";
import { useEffect }  from "react";

function ToastBridge() {
  const show = useToast();
  useEffect(() => { setGlobalToast(show); }, [show]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <ToastBridge />
      <CustomCursor />
      <Routes>
        <Route path="/"         element={<MainLanding />} />
        <Route path="/creators" element={<CreatorLanding />} />
        <Route path="/brands"   element={<BrandLanding />} />
        <Route path="/app/*"    element={<AppShell />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
