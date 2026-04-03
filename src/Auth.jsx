import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("corex_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const login = (username, password) => {
    try {
      const users = JSON.parse(localStorage.getItem("corex_users") || "[]");
      const found = users.find(
        (u) => u.username === username && u.password === password
      );
      if (!found) return { ok: false, error: "Invalid username or password" };
      const { password: _, ...safe } = found;
      setUser(safe);
      localStorage.setItem("corex_user", JSON.stringify(safe));
      return { ok: true };
    } catch {
      return { ok: false, error: "Something went wrong" };
    }
  };

  const signup = async (name, email, username, password) => {
    try {
      const users = JSON.parse(localStorage.getItem("corex_users") || "[]");
      if (users.find((u) => u.username === username)) {
        return { ok: false, error: "Username already taken" };
      }
      if (users.find((u) => u.email === email)) {
        return { ok: false, error: "Email already registered" };
      }
      const newUser = { name, email, username, password, createdAt: Date.now() };
      users.push(newUser);
      localStorage.setItem("corex_users", JSON.stringify(users));

      const { password: _, ...safe } = newUser;
      setUser(safe);
      localStorage.setItem("corex_user", JSON.stringify(safe));

      // send notification via EmailJS (fire-and-forget)
      sendSignupEmail({ name, email, username }).catch(() => {});

      return { ok: true };
    } catch {
      return { ok: false, error: "Something went wrong" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("corex_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// EmailJS notification — uses public service, no backend needed
async function sendSignupEmail({ name, email, username }) {
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // If EmailJS not configured, skip silently
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) return;

  await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: {
        to_email: "corexnt@gmail.com",
        from_name: name,
        from_email: email,
        username,
        message: `New Corex signup!\n\nName: ${name}\nEmail: ${email}\nUsername: ${username}\nTime: ${new Date().toISOString()}`,
      },
    }),
  });
}
