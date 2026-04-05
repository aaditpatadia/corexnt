import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, duration = 3000) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[99999] flex flex-col gap-2 pointer-events-none"
        style={{ transform: "translateX(-50%)" }}>
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="px-5 py-3 rounded-2xl text-sm font-medium whitespace-nowrap pointer-events-auto"
              style={{
                background: "rgba(10,20,12,0.97)",
                border: "1px solid rgba(45,214,104,0.3)",
                color: "#f0faf2",
                boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              }}
            >
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}

// Simple imperative toast for components that can't use hooks easily
let _showToast = null;
export function setGlobalToast(fn) { _showToast = fn; }
export function toast(msg, duration) { _showToast?.(msg, duration); }
