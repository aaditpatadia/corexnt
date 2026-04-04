import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Sparkles, Building2 } from "lucide-react";

export default function SignupForm({ userType = "creator", onSuccess, onLoginClick, onBack }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);

    // Simulate auth
    setTimeout(() => {
      localStorage.setItem("corex_isLoggedIn", "true");
      localStorage.setItem("corex_userName", form.name);
      localStorage.setItem("corex_userEmail", form.email);
      localStorage.setItem("corex_userType", userType);
      localStorage.setItem("corex_msgLeft", "10");
      setLoading(false);
      onSuccess();
    }, 900);
  };

  const isCreator = userType === "creator";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: isCreator ? "rgba(124,58,237,0.2)" : "rgba(99,102,241,0.2)", border: `1px solid ${isCreator ? "rgba(124,58,237,0.3)" : "rgba(99,102,241,0.3)"}` }}
            >
              {isCreator ? <Sparkles size={18} className="text-violet-400" /> : <Building2 size={18} className="text-indigo-400" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
                Create account
              </h2>
              <p className="text-xs text-zinc-500 capitalize">{userType} plan · Free tier</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="Ranveer Allahbadia"
                className="input-glass w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@brand.in"
                className="input-glass w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Phone (optional)</label>
              <div className="flex gap-2">
                <div className="input-glass px-3 py-3 rounded-xl text-sm text-zinc-400 font-medium flex-shrink-0">
                  +91
                </div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="9876543210"
                  className="input-glass flex-1 px-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 6 characters"
                  className="input-glass w-full px-4 py-3 rounded-xl text-sm pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white btn-purple mt-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                "Create account →"
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-zinc-600">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Google (UI only) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-medium text-sm text-zinc-300 flex items-center justify-center gap-3 transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              {/* Google G */}
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
              </svg>
              Continue with Google
            </motion.button>
          </form>

          {/* Login link */}
          <p className="text-center text-xs text-zinc-600 mt-6">
            Already have an account?{" "}
            <button onClick={onLoginClick} className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
