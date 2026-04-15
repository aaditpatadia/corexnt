import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithGoogle } from "../firebase";

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data    = encoder.encode(password + "corex_salt_2026");
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function createSession() {
  localStorage.setItem("sessionToken",  crypto.randomUUID());
  localStorage.setItem("sessionExpiry", (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
}

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

async function notifyNewUser(userName, userEmail) {
  try {
    const { default: emailjs } = await import("@emailjs/browser");
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_NOTIFY_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      { to_email:"corexnt@gmail.com", user_name:userName, user_email:userEmail, user_type:"creator", signup_date:new Date().toLocaleDateString() },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    );
  } catch {}
}

function generateOtp() { return Math.floor(100000 + Math.random() * 900000).toString(); }

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

/* ─── OTP Input ─── */
function OtpInput({ value, onChange, error }) {
  const inputs = useRef([]);
  const digits  = (value + "      ").slice(0, 6).split("");

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g,"").slice(-1);
    const next = [...digits]; next[i] = char;
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
    <motion.div style={{ display:"flex", gap:8, justifyContent:"center" }}
      animate={error ? { x:[0,-8,8,-8,8,0] } : {}} transition={{ duration:0.4 }}>
      {Array.from({length:6}).map((_,i) => (
        <input key={i} ref={el=>inputs.current[i]=el}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={e=>handleChange(i,e)}
          onKeyDown={e=>handleKey(i,e)}
          onPaste={handlePaste}
          style={{
            width:44, height:52, textAlign:"center", fontSize:20, fontWeight:700,
            borderRadius:12, outline:"none", transition:"all 0.2s",
            background:"rgba(255,255,255,0.06)",
            border:`1.5px solid ${error?"rgba(248,113,113,0.5)":digits[i]?.trim()?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.12)"}`,
            color:"#ffffff", fontFamily:"var(--font-body)",
          }}
          onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.5)"}
          onBlur={e=>e.target.style.borderColor=error?"rgba(248,113,113,0.5)":digits[i]?.trim()?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.12)"}/>
      ))}
    </motion.div>
  );
}

const INPUT_STYLE = {
  width:"100%", padding:"14px 16px", borderRadius:14, border:"1.5px solid rgba(255,255,255,0.1)",
  background:"rgba(255,255,255,0.06)", color:"#ffffff", fontSize:15,
  fontFamily:"var(--font-body)", outline:"none", transition:"border-color 0.2s",
};

/* ─── OTP Verify ─── */
function OtpVerify({ email, userName, onSuccess, onBack }) {
  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [resent,  setResent]  = useState(false);
  const [cooldown,setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) { const t = setTimeout(() => setCooldown(c => c-1), 1000); return () => clearTimeout(t); }
  }, [cooldown]);

  const verify = async () => {
    if (otp.trim().length < 6) { setError("Enter all 6 digits."); return; }
    setLoading(true); setError("");
    try {
      const stored = JSON.parse(localStorage.getItem("corex_otp_pending") || "{}");
      if (!stored.otp) { setError("No code found. Resend and try again."); setLoading(false); return; }
      if (Date.now() > stored.expiry) { setError("Code expired. Resend it."); setLoading(false); return; }
      if (otp.trim() !== stored.otp) { setError("Wrong code. Try again."); setLoading(false); return; }
      localStorage.removeItem("corex_otp_pending");
      localStorage.setItem("isVerified", "true");
      createSession();
      await notifyNewUser(userName, email);
      onSuccess();
    } catch { setError("Verification failed. Try again."); }
    setLoading(false);
  };

  const resend = async () => {
    if (cooldown > 0) return;
    const newOtp = generateOtp();
    localStorage.setItem("corex_otp_pending", JSON.stringify({ otp:newOtp, email, expiry:Date.now()+10*60*1000 }));
    await sendOtpEmail(email, userName, newOtp);
    setResent(true); setCooldown(60); setOtp(""); setError("");
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", background:"#000000" }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} style={{ width:"100%", maxWidth:420 }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, color:"rgba(255,255,255,0.4)", background:"none", border:"none", cursor:"pointer", marginBottom:32, fontFamily:"var(--font-body)", transition:"color 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.color="#ffffff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.4)"}>
          ← Back
        </button>
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:24, padding:32, backdropFilter:"blur(24px)" }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ width:56, height:56, borderRadius:18, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:24 }}>
              📬
            </div>
            <h2 style={{ fontSize:22, fontWeight:700, color:"#ffffff", fontFamily:"var(--font-body)", marginBottom:8 }}>Check your email</h2>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)", lineHeight:1.5 }}>
              We sent a 6-digit code to<br/>
              <span style={{ color:"#9CFCAF", fontWeight:600 }}>
                {email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + b.replace(/./g,"•") + c)}
              </span>
            </p>
          </div>

          <div style={{ marginBottom:20 }}>
            <OtpInput value={otp} onChange={setOtp} error={!!error}/>
            {error && <p style={{ fontSize:12, textAlign:"center", marginTop:12, color:"#f87171", fontFamily:"var(--font-body)" }}>{error}</p>}
          </div>

          <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
            onClick={verify} disabled={loading || otp.trim().length < 6}
            style={{ width:"100%", padding:"14px 0", borderRadius:100, border:"none", cursor:"pointer", fontFamily:"var(--font-body)", fontSize:15, fontWeight:600, marginBottom:16,
              background: otp.trim().length === 6 ? "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)" : "rgba(255,255,255,0.08)",
              color: otp.trim().length === 6 ? "#000000" : "rgba(255,255,255,0.3)",
              opacity: loading ? 0.7 : 1, transition:"all 0.2s",
            }}>
            {loading ? "Verifying…" : "Verify Email →"}
          </motion.button>

          <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>
            Didn't receive it?{" "}
            <button onClick={resend} disabled={cooldown > 0}
              style={{ color:"rgba(255,255,255,0.7)", background:"none", border:"none", cursor:"pointer", fontWeight:600, opacity:cooldown>0?0.4:1, fontFamily:"var(--font-body)" }}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </p>
          {resent && <p style={{ textAlign:"center", fontSize:12, marginTop:8, color:"#9CFCAF", fontFamily:"var(--font-body)" }}>Code resent!</p>}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Signup ─── */
function Signup({ onSuccess, onLoginClick, onNeedOtp }) {
  const [form,     setForm]     = useState({ name:"", email:"", password:"" });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [googleErr,setGoogleErr] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }));

  const handleGoogle = async () => {
    setGoogleErr(""); setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    if (result.success) {
      localStorage.setItem("userType", "creator");
      createSession();
      // Grant 50 free credits on first signup
      if (!localStorage.getItem("corex_credits")) {
        localStorage.setItem("corex_credits", "50");
      }
      onSuccess();
    } else setGoogleErr(result.error || "Google sign in failed. Try again.");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name||!form.email||!form.password) { setError("Please fill all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    const passwordHash = await hashPassword(form.password);
    const otp = generateOtp();
    localStorage.setItem("corex_pending_user", JSON.stringify({ name:form.name, email:form.email, passwordHash, userType:"creator" }));
    localStorage.setItem("corex_otp_pending", JSON.stringify({ otp, email:form.email, expiry:Date.now()+10*60*1000 }));
    const sent = await sendOtpEmail(form.email, form.name, otp);
    setLoading(false);
    if (!sent) {
      const devMode = !import.meta.env.VITE_EMAILJS_SERVICE_ID;
      if (devMode) {
        localStorage.setItem("isLoggedIn", "true"); localStorage.setItem("isVerified", "true");
        localStorage.setItem("userName", form.name); localStorage.setItem("userEmail", form.email);
        localStorage.setItem("userType", "creator"); localStorage.setItem("userPasswordHash", passwordHash);
        createSession(); onSuccess(); return;
      }
      setError("Couldn't send verification email. Check your connection."); return;
    }
    onNeedOtp({ email:form.email, name:form.name });
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", background:"#000000" }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} style={{ width:"100%", maxWidth:420 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(156,252,175,0.1)", border:"1px solid rgba(156,252,175,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CFCAF" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 16c0-4 8-4 8 0"/><circle cx="12" cy="9" r="1" fill="#9CFCAF"/></svg>
          </div>
          <span style={{ fontFamily:"var(--font-body)", fontWeight:700, fontSize:20, color:"#ffffff" }}>Corex</span>
        </div>

        <h2 style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:30, fontWeight:400, color:"#ffffff", marginBottom:6 }}>Create your account</h2>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)", marginBottom:28 }}>Free to start · No credit card needed</p>

        {/* Google */}
        <motion.button type="button" whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
          onClick={handleGoogle} disabled={loading}
          style={{ width:"100%", padding:"14px 0", borderRadius:100, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.04)", color:"#ffffff", fontFamily:"var(--font-body)", fontSize:15, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:8, transition:"all 0.2s" }}>
          <GoogleIcon/>
          {loading ? "Signing in…" : "Continue with Google"}
        </motion.button>
        {googleErr && <p style={{ fontSize:12, textAlign:"center", marginBottom:8, color:"#f87171", fontFamily:"var(--font-body)" }}>{googleErr}</p>}

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontFamily:"var(--font-body)" }}>or</span>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
        </div>

        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)", marginBottom:8 }}>Your name</label>
            <input type="text" value={form.name} onChange={set("name")} placeholder="Aadit Patadia"
              style={INPUT_STYLE}
              onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.4)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)", marginBottom:8 }}>Email</label>
            <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
              style={INPUT_STYLE}
              onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.4)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)", marginBottom:8 }}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPass?"text":"password"} value={form.password} onChange={set("password")} placeholder="Min. 6 characters"
                style={{ ...INPUT_STYLE, paddingRight:48 }}
                onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.4)"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              <button type="button" onClick={()=>setShowPass(s=>!s)}
                style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.3)", fontSize:14 }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          {error && <p style={{ fontSize:13, color:"#f87171", background:"rgba(248,113,113,0.06)", padding:"10px 14px", borderRadius:10, fontFamily:"var(--font-body)" }}>{error}</p>}
          <motion.button type="submit" disabled={loading} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
            style={{ width:"100%", padding:"15px 0", borderRadius:100, border:"none", cursor:"pointer", fontFamily:"var(--font-body)", fontSize:15, fontWeight:700,
              background:"linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)", color:"#000000",
              opacity:loading?0.8:1, transition:"opacity 0.2s",
            }}>
            {loading ? "Sending code…" : "Continue →"}
          </motion.button>
        </form>

        <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)", marginTop:24 }}>
          Already have an account?{" "}
          <button onClick={onLoginClick} style={{ color:"rgba(255,255,255,0.8)", background:"none", border:"none", cursor:"pointer", fontWeight:600, fontFamily:"var(--font-body)" }}>Sign in</button>
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Login ─── */
function Login({ onSuccess, onSignupClick, onNeedOtp }) {
  const [form,     setForm]     = useState({ email:"", password:"" });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [googleErr,setGoogleErr] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }));

  const handleGoogle = async () => {
    setGoogleErr(""); setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    if (result.success) {
      createSession();
      // Grant 50 free credits if not already set
      if (!localStorage.getItem("corex_credits")) {
        localStorage.setItem("corex_credits", "50");
      }
      onSuccess();
    } else setGoogleErr(result.error || "Google sign in failed.");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email||!form.password) { setError("Please enter your email and password."); return; }
    setError(""); setLoading(true);
    const storedHash  = localStorage.getItem("userPasswordHash");
    const inputHash   = await hashPassword(form.password);
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail === form.email && storedHash === inputHash) {
      const isVerified = localStorage.getItem("isVerified") === "true";
      if (!isVerified) {
        const name = localStorage.getItem("userName") || "User";
        const otp  = generateOtp();
        localStorage.setItem("corex_otp_pending", JSON.stringify({ otp, email:form.email, expiry:Date.now()+10*60*1000 }));
        await sendOtpEmail(form.email, name, otp);
        setLoading(false); onNeedOtp({ email:form.email, name }); return;
      }
      localStorage.setItem("isLoggedIn", "true");
      createSession();
      // Grant 50 free credits if not already set
      if (!localStorage.getItem("corex_credits")) {
        localStorage.setItem("corex_credits", "50");
      }
      setLoading(false); onSuccess();
    } else { setLoading(false); setError("Incorrect email or password."); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", background:"#000000" }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} style={{ width:"100%", maxWidth:420 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(156,252,175,0.1)", border:"1px solid rgba(156,252,175,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CFCAF" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 16c0-4 8-4 8 0"/><circle cx="12" cy="9" r="1" fill="#9CFCAF"/></svg>
          </div>
          <span style={{ fontFamily:"var(--font-body)", fontWeight:700, fontSize:20, color:"#ffffff" }}>Corex</span>
        </div>

        <h2 style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:30, fontWeight:400, color:"#ffffff", marginBottom:6 }}>Welcome back</h2>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)", marginBottom:28 }}>Sign in to your Corex account</p>

        <motion.button type="button" whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
          onClick={handleGoogle} disabled={loading}
          style={{ width:"100%", padding:"14px 0", borderRadius:100, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.04)", color:"#ffffff", fontFamily:"var(--font-body)", fontSize:15, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:8, transition:"all 0.2s" }}>
          <GoogleIcon/>
          {loading ? "Signing in…" : "Continue with Google"}
        </motion.button>
        {googleErr && <p style={{ fontSize:12, textAlign:"center", marginBottom:8, color:"#f87171", fontFamily:"var(--font-body)" }}>{googleErr}</p>}

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontFamily:"var(--font-body)" }}>or</span>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
        </div>

        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)", marginBottom:8 }}>Email</label>
            <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
              style={INPUT_STYLE}
              onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.4)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)", marginBottom:8 }}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPass?"text":"password"} value={form.password} onChange={set("password")} placeholder="Your password"
                style={{ ...INPUT_STYLE, paddingRight:48 }}
                onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.4)"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              <button type="button" onClick={()=>setShowPass(s=>!s)}
                style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.3)", fontSize:14 }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          {error && <p style={{ fontSize:13, color:"#f87171", background:"rgba(248,113,113,0.06)", padding:"10px 14px", borderRadius:10, fontFamily:"var(--font-body)" }}>{error}</p>}
          <motion.button type="submit" disabled={loading} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
            style={{ width:"100%", padding:"15px 0", borderRadius:100, border:"none", cursor:"pointer", fontFamily:"var(--font-body)", fontSize:15, fontWeight:700,
              background:"linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)", color:"#000000",
              opacity:loading?0.8:1, transition:"opacity 0.2s",
            }}>
            {loading ? "Signing in…" : "Sign in →"}
          </motion.button>
        </form>

        <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)", marginTop:24 }}>
          Don't have an account?{" "}
          <button onClick={onSignupClick} style={{ color:"rgba(255,255,255,0.8)", background:"none", border:"none", cursor:"pointer", fontWeight:600, fontFamily:"var(--font-body)" }}>Create one</button>
        </p>
      </motion.div>
    </div>
  );
}

/* ─── AuthFlow main ─── */
export default function AuthFlow({ onSuccess }) {
  const [screen, setScreen] = useState("signup"); // "signup" | "login" | "otp"
  const [otpData, setOtpData] = useState(null);

  const handleOtpSuccess = () => {
    const pending = JSON.parse(localStorage.getItem("corex_pending_user") || "{}");
    if (pending.name) {
      localStorage.setItem("isLoggedIn",       "true");
      localStorage.setItem("userName",          pending.name);
      localStorage.setItem("userEmail",         pending.email);
      localStorage.setItem("userType",          pending.userType || "creator");
      localStorage.setItem("userPasswordHash",  pending.passwordHash || "");
      localStorage.removeItem("corex_pending_user");
    }
    // Grant 50 free credits on first signup
    if (!localStorage.getItem("corex_credits")) {
      localStorage.setItem("corex_credits", "50");
    }
    onSuccess();
  };

  return (
    <div style={{ background:"#000000", minHeight:"100vh" }}>
      <AnimatePresence mode="wait">
        {screen === "signup" && (
          <motion.div key="signup" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}>
            <Signup
              onSuccess={onSuccess}
              onLoginClick={() => setScreen("login")}
              onNeedOtp={(data) => { setOtpData(data); setScreen("otp"); }}
            />
          </motion.div>
        )}
        {screen === "login" && (
          <motion.div key="login" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}>
            <Login
              onSuccess={onSuccess}
              onSignupClick={() => setScreen("signup")}
              onNeedOtp={(data) => { setOtpData(data); setScreen("otp"); }}
            />
          </motion.div>
        )}
        {screen === "otp" && otpData && (
          <motion.div key="otp" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}>
            <OtpVerify
              email={otpData.email}
              userName={otpData.name}
              onSuccess={handleOtpSuccess}
              onBack={() => setScreen("signup")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
