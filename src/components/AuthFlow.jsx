import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";
import { signInWithGoogle } from "../firebase";

/* ─── Password hashing (no external lib) ─── */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data    = encoder.encode(password + "corex_salt_2026");
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ─── Session helpers ─── */
function createSession() {
  const token  = crypto.randomUUID();
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  localStorage.setItem("sessionToken",  token);
  localStorage.setItem("sessionExpiry", expiry.toString());
}

/* ─── EmailJS ─── */
async function sendOtpEmail(toEmail, toName, otp) {
  try {
    const { default: emailjs } = await import("@emailjs/browser");
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      { to_email:toEmail, to_name:toName, otp_code:otp, from_name:"Corex" },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    );
    return true;
  } catch { return false; }
}

async function notifyNewUser(userName, userEmail, userType) {
  try {
    const { default: emailjs } = await import("@emailjs/browser");
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_NOTIFY_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email:   "corexnt@gmail.com",
        user_name:  userName,
        user_email: userEmail,
        user_type:  userType,
        signup_date: new Date().toLocaleDateString(),
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    );
  } catch {}
}

/* ─── Generate OTP ─── */
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ─── Theme ─── */
function useTheme(userType) {
  if (userType === "company") return {
    accent:"#a78bfa", gradient:"linear-gradient(135deg,#7c3aed,#4f46e5,#a855f7)",
    glow:"rgba(124,58,237,0.25)", border:"rgba(124,58,237,0.45)", bg:"rgba(20,14,40,0.85)",
  };
  return {
    accent:"#2dd668", gradient:"linear-gradient(135deg,#1a7a3c,#2dd668)",
    glow:"rgba(45,214,104,0.2)", border:"rgba(45,214,104,0.45)", bg:"rgba(12,26,16,0.85)",
  };
}

/* ─── Country codes ─── */
const COUNTRY_CODES = [
  { code:"+91", flag:"🇮🇳" },
  { code:"+1",  flag:"🇺🇸" },
  { code:"+44", flag:"🇬🇧" },
  { code:"+61", flag:"🇦🇺" },
  { code:"+65", flag:"🇸🇬" },
];

/* ─── Corex mark ─── */
function CorexMark() {
  return (
    <div className="flex items-center justify-center gap-2.5 mb-10">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="rgba(45,214,104,0.12)" stroke="rgba(45,214,104,0.4)" strokeWidth="1"/>
        <path d="M8 16c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#2dd668" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="16" cy="21" r="3.5" fill="#2dd668"/>
      </svg>
      <span style={{ fontFamily:"var(--font-body)", fontWeight:700, fontSize:20, color:"#f0faf2" }}>Corex</span>
    </div>
  );
}

/* ─── OTP Input ─── */
function OtpInput({ value, onChange, error }) {
  const inputs = useRef([]);
  const digits  = (value + "      ").slice(0, 6).split("");

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g,"").slice(-1);
    const next = [...digits];
    next[i] = char;
    onChange(next.join("").trim());
    if (char && i < 5) inputs.current[i+1]?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i-1]?.focus();
    if (e.key === "ArrowLeft"  && i > 0) inputs.current[i-1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputs.current[i+1]?.focus();
  };
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (pasted) { onChange(pasted); inputs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <motion.div className="flex gap-2 justify-center"
      animate={error ? { x:[0,-8,8,-8,8,0] } : {}}
      transition={{ duration:0.4 }}>
      {Array.from({length:6}).map((_,i) => (
        <input key={i} ref={el=>inputs.current[i]=el}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={e=>handleChange(i,e)}
          onKeyDown={e=>handleKey(i,e)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-xl font-bold rounded-xl outline-none transition-all"
          style={{
            background:"rgba(20,40,24,0.5)",
            border:`1px solid ${error?"rgba(248,113,113,0.5)":digits[i]?.trim()?"rgba(45,214,104,0.5)":"rgba(45,214,104,0.18)"}`,
            color:"#f0faf2", fontFamily:"var(--font-body)",
          }}
          onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.6)"}
          onBlur={e=>e.target.style.borderColor=error?"rgba(248,113,113,0.5)":digits[i]?.trim()?"rgba(45,214,104,0.4)":"rgba(45,214,104,0.18)"}/>
      ))}
    </motion.div>
  );
}

/* ─── OTP Verify Screen ─── */
function OtpVerify({ email, userName, userType, onSuccess, onBack }) {
  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [resent,  setResent]  = useState(false);
  const [cooldown,setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(c => c-1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  const verify = async () => {
    if (otp.trim().length < 6) { setError("Enter all 6 digits."); return; }
    setLoading(true); setError("");
    try {
      const stored = JSON.parse(localStorage.getItem("corex_otp_pending") || "{}");
      if (!stored.otp) { setError("No code found. Resend and try again."); setLoading(false); return; }
      if (Date.now() > stored.expiry) { setError("Code expired. Resend it."); setLoading(false); return; }
      if (otp.trim() !== stored.otp) { setError("Wrong code. Try again."); setLoading(false); return; }

      // Success
      localStorage.removeItem("corex_otp_pending");
      localStorage.setItem("isVerified", "true");
      createSession();
      await notifyNewUser(userName, email, userType);
      onSuccess();
    } catch {
      setError("Verification failed. Try again.");
    }
    setLoading(false);
  };

  const resend = async () => {
    if (cooldown > 0) return;
    const newOtp = generateOtp();
    localStorage.setItem("corex_otp_pending", JSON.stringify({ otp:newOtp, email, expiry:Date.now()+10*60*1000 }));
    await sendOtpEmail(email, userName, newOtp);
    setResent(true); setCooldown(60); setOtp(""); setError("");
  };

  const theme = useTheme(userType);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-8"
          style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}
          onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
          <ArrowLeft size={15}/> Back
        </button>
        <div className="rounded-2xl p-8" style={{ background:theme.bg, border:`1px solid ${theme.border}`, backdropFilter:"blur(24px)" }}>
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
              style={{ background:theme.bg, border:`1px solid ${theme.border}` }}>
              📬
            </div>
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily:"var(--font-body)" }}>Check your email</h2>
            <p className="text-sm" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>
              We sent a 6-digit code to<br/>
              <span className="font-medium" style={{ color:theme.accent }}>
                {email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + b.replace(/./g,"•") + c)}
              </span>
            </p>
          </div>

          <div className="mb-5">
            <OtpInput value={otp} onChange={setOtp} error={!!error}/>
            {error && (
              <p className="text-xs text-center mt-3" style={{ color:"#f87171", fontFamily:"var(--font-body)" }}>{error}</p>
            )}
          </div>

          <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
            onClick={verify} disabled={loading || otp.trim().length < 6}
            className="w-full py-3 rounded-xl font-bold text-sm mb-4 disabled:opacity-50"
            style={{ background:theme.gradient, color:"#050a06", fontFamily:"var(--font-body)", border:"none" }}>
            {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black/20 border-t-black/80 rounded-full animate-spin"/>Verifying…</span> : "Verify Email →"}
          </motion.button>

          <p className="text-center text-xs" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>
            Didn't receive it?{" "}
            <button onClick={resend} disabled={cooldown > 0}
              className="font-medium transition-opacity" style={{ color:theme.accent, opacity:cooldown>0?0.5:1 }}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </p>
          {resent && <p className="text-center text-xs mt-2" style={{ color:"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>Code resent!</p>}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Onboarding ─── */
function Onboarding({ onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative z-10" style={{ background: "#080c09" }}>
      <CorexMark/>
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} className="text-center mb-12">
        <h2 className="font-display font-bold mb-3" style={{ fontSize:"clamp(28px,4vw,40px)", color:"#ffffff" }}>
          Who are you building for?
        </h2>
        <p style={{ color:"rgba(255,255,255,0.6)", fontSize:15, fontFamily:"var(--font-body)" }}>
          Your entire experience adapts to your answer.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-5 w-full max-w-2xl">
        {[
          {
            type:"creator", icon:"🎬", title:"I'm a Creator",
            sub:"Reels, growth, brand deals, trends",
            stats:"3.5M+ creators growing faster",
            gradBorder:"rgba(232,121,249,0.7)", gradBg:"rgba(30,12,42,0.88)",
          },
          {
            type:"company", icon:"💼", title:"I'm a Brand / Startup",
            sub:"Campaigns, budgets, brand strategy",
            stats:"Funded startups & D2C brands",
            gradBorder:"rgba(124,58,237,0.7)", gradBg:"rgba(18,10,40,0.88)",
          },
        ].map((c, i) => (
          <motion.button key={c.type}
            initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.1+i*0.1, duration:0.45, ease:[0.16,1,0.3,1] }}
            whileHover={{ y:-6, scale:1.01 }} whileTap={{ scale:0.98 }}
            onClick={() => onSelect(c.type)}
            className="flex-1 text-left rounded-2xl p-8 transition-all duration-300"
            style={{ background:c.gradBg, border:`1px solid ${c.gradBorder}`, backdropFilter:"blur(20px)" }}>
            <div className="text-4xl mb-6">
              <motion.span animate={{ scale:[1,1.05,1] }} transition={{ duration:2.5, repeat:Infinity }}>{c.icon}</motion.span>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: "#ffffff", fontFamily: "var(--font-body)" }}>{c.title}</h3>
            <p className="text-sm mb-5" style={{ color:"rgba(255,255,255,0.75)", fontFamily:"var(--font-body)" }}>{c.sub}</p>
            <div className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{ background:c.gradBg, border:`1px solid ${c.gradBorder}`, color:"rgba(255,255,255,0.85)", fontFamily:"var(--font-body)" }}>
              {c.stats}
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color:c.gradBorder }}>
              Get started <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
        className="text-xs mt-10" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>
        Free to start · No credit card required
      </motion.p>
    </div>
  );
}

/* ─── Signup ─── */
function Signup({ userType, onSuccess, onLoginClick, onBack, onNeedOtp }) {
  const [form,     setForm]     = useState({ name:"", email:"", phone:"", password:"", countryCode:"+91" });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [googleErr,setGoogleErr] = useState("");
  const theme = useTheme(userType);
  const set   = k => e => setForm(f => ({ ...f, [k]:e.target.value }));

  const handleGoogle = async () => {
    setGoogleErr(""); setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    if (result.success) {
      localStorage.setItem("userType", userType || "creator");
      createSession();
      onSuccess();
    } else {
      setGoogleErr(result.error || "Google sign in failed. Try again.");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name||!form.email||!form.password) { setError("Please fill all required fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);

    const passwordHash = await hashPassword(form.password);
    const otp = generateOtp();

    // Store user data (not yet verified)
    localStorage.setItem("corex_pending_user", JSON.stringify({
      name: form.name, email: form.email, phone: form.countryCode + form.phone,
      passwordHash, userType: userType || "creator",
    }));
    localStorage.setItem("corex_otp_pending", JSON.stringify({
      otp, email:form.email, expiry:Date.now()+10*60*1000,
    }));

    const sent = await sendOtpEmail(form.email, form.name, otp);
    setLoading(false);

    if (!sent) {
      // EmailJS not configured — skip OTP in dev
      const devMode = !import.meta.env.VITE_EMAILJS_SERVICE_ID;
      if (devMode) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isVerified", "true");
        localStorage.setItem("userName",  form.name);
        localStorage.setItem("userEmail", form.email);
        localStorage.setItem("userType",  userType || "creator");
        createSession();
        onSuccess();
        return;
      }
      setError("Couldn't send verification email. Check your connection.");
      return;
    }

    onNeedOtp({ email:form.email, name:form.name });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-8"
          style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}
          onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
          <ArrowLeft size={15}/> Back
        </button>
        <div className="rounded-2xl p-8" style={{ background:theme.bg, border:`1px solid ${theme.border}`, backdropFilter:"blur(24px)" }}>
          <div className="mb-7">
            <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold mb-4 capitalize"
              style={{ background:theme.bg, border:`1px solid ${theme.border}`, color:theme.accent, fontFamily:"var(--font-body)" }}>
              {userType === "company" ? "Brand / Startup" : "Creator"} Account
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily:"var(--font-body)" }}>Create your account</h2>
            <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>Free tier · No card needed</p>
          </div>

          {/* Google */}
          <motion.button type="button" whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
            onClick={handleGoogle} disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-3 mb-2"
            style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#f0faf2", fontFamily:"var(--font-body)" }}>
            <GoogleIcon/>
            {loading ? "Signing in…" : "Continue with Google"}
          </motion.button>
          {googleErr && <p className="text-xs text-center mb-3" style={{ color:"#f87171", fontFamily:"var(--font-body)" }}>{googleErr}</p>}

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background:theme.border }}/>
            <span className="text-xs" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>or</span>
            <div className="flex-1 h-px" style={{ background:theme.border }}/>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {[
              { key:"name",  label:"Full Name *", type:"text",  ph:"Your full name" },
              { key:"email", label:"Email *",     type:"email", ph:"you@example.com" },
            ].map(({ key, label, type, ph }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>{label}</label>
                <input type={type} value={form[key]} onChange={set(key)} placeholder={ph}
                  className="input-green w-full px-4 py-3 rounded-xl text-sm" style={{ fontFamily:"var(--font-body)" }}/>
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>Phone (optional)</label>
              <div className="flex gap-2">
                <select value={form.countryCode} onChange={set("countryCode")}
                  className="flex-shrink-0 px-2 py-3 rounded-xl text-sm"
                  style={{ background:"rgba(20,40,24,0.5)", border:"1px solid rgba(45,214,104,0.15)", color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)", outline:"none" }}>
                  {COUNTRY_CODES.map(c=><option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <input type="tel" value={form.phone} onChange={set("phone")} placeholder="98765 43210"
                  className="input-green flex-1 px-4 py-3 rounded-xl text-sm" style={{ fontFamily:"var(--font-body)" }}/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>Password *</label>
              <div className="relative">
                <input type={showPass?"text":"password"} value={form.password} onChange={set("password")} placeholder="Min. 6 characters"
                  className="input-green w-full px-4 py-3 rounded-xl text-sm pr-11" style={{ fontFamily:"var(--font-body)" }}/>
                <button type="button" onClick={()=>setShowPass(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color:"rgba(255,255,255,0.4)" }}>
                  {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ color:"#f87171", background:"rgba(248,113,113,0.08)", fontFamily:"var(--font-body)" }}>{error}</p>}
            <motion.button type="submit" disabled={loading} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
              className="w-full py-3 rounded-xl font-bold text-sm mt-1 disabled:opacity-60"
              style={{ background:theme.gradient, color:"#050a06", fontFamily:"var(--font-body)", border:"none" }}>
              {loading?<span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black/20 border-t-black/80 rounded-full animate-spin"/>Sending code…</span>:"Continue →"}
            </motion.button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>
            Already have an account?{" "}
            <button onClick={onLoginClick} className="font-medium" style={{ color:theme.accent }}>Sign in</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Login ─── */
function Login({ onSuccess, onSignupClick, onForgotClick, onBack, onNeedOtp }) {
  const [form,     setForm]     = useState({ email:"", password:"" });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [googleErr,setGoogleErr] = useState("");
  const userType = localStorage.getItem("userType") || "creator";
  const theme    = useTheme(userType);
  const set      = k => e => setForm(f => ({ ...f, [k]:e.target.value }));

  const handleGoogle = async () => {
    setGoogleErr(""); setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    if (result.success) { createSession(); onSuccess(); }
    else setGoogleErr(result.error || "Google sign in failed.");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email||!form.password) { setError("Please enter your email and password."); return; }
    setError(""); setLoading(true);

    const storedHash = localStorage.getItem("userPasswordHash");
    const inputHash  = await hashPassword(form.password);
    const storedEmail = localStorage.getItem("userEmail");

    if (storedEmail === form.email && storedHash === inputHash) {
      const isVerified = localStorage.getItem("isVerified") === "true";
      if (!isVerified) {
        // Resend OTP
        const name  = localStorage.getItem("userName") || "User";
        const otp   = generateOtp();
        localStorage.setItem("corex_otp_pending", JSON.stringify({ otp, email:form.email, expiry:Date.now()+10*60*1000 }));
        await sendOtpEmail(form.email, name, otp);
        setLoading(false);
        onNeedOtp({ email:form.email, name });
        return;
      }
      localStorage.setItem("isLoggedIn", "true");
      createSession();
      setLoading(false);
      onSuccess();
    } else {
      setLoading(false);
      setError("Incorrect email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-8"
          style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}
          onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
          <ArrowLeft size={15}/> Back
        </button>
        <div className="rounded-2xl p-8" style={{ background:theme.bg, border:`1px solid ${theme.border}`, backdropFilter:"blur(24px)" }}>
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
              style={{ background:theme.bg, border:`1px solid ${theme.border}` }}>
              🌿
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily:"var(--font-body)" }}>Welcome back</h2>
            <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>Sign in to Corex</p>
          </div>

          <motion.button type="button" whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
            onClick={handleGoogle} disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-3 mb-2"
            style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#f0faf2", fontFamily:"var(--font-body)" }}>
            <GoogleIcon/>
            {loading ? "Signing in…" : "Continue with Google"}
          </motion.button>
          {googleErr && <p className="text-xs text-center mb-3" style={{ color:"#f87171", fontFamily:"var(--font-body)" }}>{googleErr}</p>}

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background:theme.border }}/>
            <span className="text-xs" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>or</span>
            <div className="flex-1 h-px" style={{ background:theme.border }}/>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>Email</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
                className="input-green w-full px-4 py-3 rounded-xl text-sm" style={{ fontFamily:"var(--font-body)" }}/>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>Password</label>
                <button type="button" onClick={onForgotClick} className="text-xs font-medium" style={{ color:theme.accent, fontFamily:"var(--font-body)" }}>Forgot?</button>
              </div>
              <div className="relative">
                <input type={showPass?"text":"password"} value={form.password} onChange={set("password")} placeholder="Your password"
                  className="input-green w-full px-4 py-3 rounded-xl text-sm pr-11" style={{ fontFamily:"var(--font-body)" }}/>
                <button type="button" onClick={()=>setShowPass(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color:"rgba(255,255,255,0.4)" }}>
                  {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ color:"#f87171", background:"rgba(248,113,113,0.08)", fontFamily:"var(--font-body)" }}>{error}</p>}
            <motion.button type="submit" disabled={loading} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
              className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60"
              style={{ background:theme.gradient, color:"#050a06", fontFamily:"var(--font-body)", border:"none" }}>
              {loading?<span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black/20 border-t-black/80 rounded-full animate-spin"/>Signing in…</span>:"Sign in →"}
            </motion.button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>
            Don't have an account?{" "}
            <button onClick={onSignupClick} className="font-medium" style={{ color:theme.accent }}>Sign up free</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Forgot Password ─── */
function ForgotPw({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const theme = useTheme(localStorage.getItem("userType")||"creator");
  const submit = e => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-8"
          style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}
          onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
          <ArrowLeft size={15}/> Back to login
        </button>
        <div className="rounded-2xl p-8" style={{ background:theme.bg, border:`1px solid ${theme.border}`, backdropFilter:"blur(24px)" }}>
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div className="text-center mb-7">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background:theme.bg, border:`1px solid ${theme.border}` }}>
                    <Mail size={22} style={{ color:theme.accent }}/>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily:"var(--font-body)" }}>Reset your password</h2>
                  <p className="text-sm" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>Enter your email and we'll send a reset link.</p>
                </div>
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>Email address</label>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
                      className="input-green w-full px-4 py-3 rounded-xl text-sm" style={{ fontFamily:"var(--font-body)" }}/>
                  </div>
                  <motion.button type="submit" disabled={loading||!email.trim()} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                    className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50"
                    style={{ background:theme.gradient, color:"#050a06", fontFamily:"var(--font-body)", border:"none" }}>
                    {loading?<span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black/20 border-t-black/80 rounded-full animate-spin"/>Sending…</span>:"Send reset link"}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="text-center py-4">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily:"var(--font-body)" }}>Reset link sent!</h3>
                <p className="text-sm mb-1" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>We've sent a reset link to</p>
                <p className="font-semibold text-sm mb-6" style={{ color:theme.accent, fontFamily:"var(--font-body)" }}>{email}</p>
                <button onClick={onBack} className="text-sm font-medium" style={{ color:theme.accent, fontFamily:"var(--font-body)" }}>← Back to login</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Google icon ─── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

/* ─── AuthFlow orchestrator ─── */
export default function AuthFlow({ onSuccess }) {
  const [screen,   setScreen]   = useState(() => {
    const ut = localStorage.getItem("userType");
    return ut ? "login" : "onboarding";
  });
  const [userType, setUserType] = useState(() => localStorage.getItem("userType")||"creator");
  const [otpData,  setOtpData]  = useState(null);

  const selectType = (type) => {
    setUserType(type);
    localStorage.setItem("userType", type);
    setScreen("signup");
  };

  const handleOtpSuccess = () => {
    // Finish creating the account after OTP verified
    const pending = JSON.parse(localStorage.getItem("corex_pending_user") || "{}");
    if (pending.name) {
      localStorage.setItem("isLoggedIn",       "true");
      localStorage.setItem("userName",          pending.name);
      localStorage.setItem("userEmail",         pending.email);
      localStorage.setItem("userPhone",         pending.phone || "");
      localStorage.setItem("userType",          pending.userType || "creator");
      localStorage.setItem("userPasswordHash",  pending.passwordHash || "");
      localStorage.removeItem("corex_pending_user");
    }
    onSuccess();
  };

  return (
    <div className="relative min-h-screen" style={{ background:"#080c09" }}>
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
      <AnimatePresence mode="wait">
        {screen === "onboarding" && (
          <motion.div key="onboarding" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
            <Onboarding onSelect={selectType}/>
          </motion.div>
        )}
        {screen === "signup" && (
          <motion.div key="signup" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
            <Signup
              userType={userType}
              onSuccess={onSuccess}
              onLoginClick={() => setScreen("login")}
              onBack={() => setScreen("onboarding")}
              onNeedOtp={(data) => { setOtpData(data); setScreen("otp"); }}
            />
          </motion.div>
        )}
        {screen === "login" && (
          <motion.div key="login" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
            <Login
              onSuccess={onSuccess}
              onSignupClick={() => setScreen("signup")}
              onForgotClick={() => setScreen("forgot")}
              onBack={() => setScreen("onboarding")}
              onNeedOtp={(data) => { setOtpData(data); setScreen("otp"); }}
            />
          </motion.div>
        )}
        {screen === "otp" && otpData && (
          <motion.div key="otp" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
            <OtpVerify
              email={otpData.email}
              userName={otpData.name}
              userType={userType}
              onSuccess={handleOtpSuccess}
              onBack={() => setScreen("signup")}
            />
          </motion.div>
        )}
        {screen === "forgot" && (
          <motion.div key="forgot" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
            <ForgotPw onBack={() => setScreen("login")}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
