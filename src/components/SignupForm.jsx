import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function SignupForm({ userType, onSuccess, onLoginClick, onBack }) {
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]:e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("Please fill in all required fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    setTimeout(() => {
      localStorage.setItem("corex_isLoggedIn","true");
      localStorage.setItem("corex_userName",  form.name);
      localStorage.setItem("corex_userEmail", form.email);
      localStorage.setItem("corex_userType",  userType || "creator");
      localStorage.setItem("corex_msgLeft",   "10");
      localStorage.setItem("corex_msgReset",  Date.now().toString());
      setLoading(false);
      onSuccess();
    }, 900);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div
        initial={{ opacity:0, y:24 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}
        className="w-full max-w-md"
      >
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color:"var(--text-muted)" }}
          onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"}
          onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
          <ArrowLeft size={15} /> Back
        </button>

        <div className="rounded-2xl p-8" style={{ background:"rgba(20,40,24,0.6)", border:"1px solid rgba(45,214,104,0.2)", backdropFilter:"blur(24px)" }}>
          {/* Header */}
          <div className="mb-7">
            <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold mb-4 capitalize"
              style={{ background:"rgba(45,214,104,0.1)", border:"1px solid rgba(45,214,104,0.25)", color:"#2dd668" }}>
              {userType === "company" ? "Brand / Startup" : "Creator"} Account
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily:"Sora,sans-serif" }}>Create your account</h2>
            <p className="text-sm mt-1" style={{ color:"var(--text-secondary)" }}>Free tier · No card needed</p>
          </div>

          {/* Google */}
          <motion.button type="button" whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
            className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-3 mb-4"
            style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#f0faf2" }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background:"rgba(45,214,104,0.1)" }} />
            <span className="text-xs" style={{ color:"var(--text-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background:"rgba(45,214,104,0.1)" }} />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {[
              { key:"name",     label:"Full Name *",    type:"text",     ph:"Ranveer Allahbadia" },
              { key:"email",    label:"Email *",         type:"email",    ph:"you@brand.in"       },
            ].map(({ key, label, type, ph }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1.5" style={{ color:"var(--text-secondary)" }}>{label}</label>
                <input type={type} value={form[key]} onChange={set(key)} placeholder={ph}
                  className="input-green w-full px-4 py-3 rounded-xl text-sm" />
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color:"var(--text-secondary)" }}>Phone (optional)</label>
              <div className="flex gap-2">
                <div className="px-3 py-3 rounded-xl text-sm font-medium flex-shrink-0"
                  style={{ background:"rgba(20,40,24,0.5)", border:"1px solid rgba(45,214,104,0.15)", color:"var(--text-secondary)" }}>+91</div>
                <input type="tel" value={form.phone} onChange={set("phone")} placeholder="9876543210"
                  className="input-green flex-1 px-4 py-3 rounded-xl text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color:"var(--text-secondary)" }}>Password *</label>
              <div className="relative">
                <input type={showPass?"text":"password"} value={form.password} onChange={set("password")} placeholder="Min. 6 characters"
                  className="input-green w-full px-4 py-3 rounded-xl text-sm pr-11" />
                <button type="button" onClick={() => setShowPass(s=>!s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color:"var(--text-muted)" }}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ color:"#f87171", background:"rgba(248,113,113,0.08)" }}>{error}</p>
            )}

            <motion.button type="submit" disabled={loading} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
              className="w-full py-3 rounded-xl font-bold text-sm btn-green mt-1 disabled:opacity-60"
              style={{ color:"#050a06" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black/80 rounded-full animate-spin"/>
                  Creating account…
                </span>
              ) : "Create Account →"}
            </motion.button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color:"var(--text-muted)" }}>
            Already have an account?{" "}
            <button onClick={onLoginClick} className="font-medium transition-colors" style={{ color:"#2dd668" }}>Sign in</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
