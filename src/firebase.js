// Firebase is lazily initialized only when signInWithGoogle is called.
// Nothing runs at module load time — no crash if env vars are missing.

/**
 * Sign in with Google popup.
 * Returns { success: true, user } or { success: false, error: string }
 */
export async function signInWithGoogle(userType) {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Google sign in is not configured. Use email instead." };
  }

  try {
    // Lazy import — only loads Firebase bundles when actually needed
    const { initializeApp, getApp, getApps } = await import("firebase/app");
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");

    // Reuse existing app if already initialized, else create new
    const app = getApps().length > 0 ? getApp() : initializeApp({
      apiKey,
      authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    });

    const auth     = getAuth(app);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    const user   = result.user;
    const isNew  = result._tokenResponse?.isNewUser;

    localStorage.setItem("isLoggedIn",    "true");
    localStorage.setItem("isVerified",    "true");
    localStorage.setItem("userName",      user.displayName || "User");
    localStorage.setItem("userEmail",     user.email || "");
    localStorage.setItem("userType",      userType || localStorage.getItem("userType") || "creator");
    localStorage.setItem("loginMethod",   "google");
    localStorage.setItem("sessionExpiry", (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());

    // Notify on new signup (optional — skip if EmailJS not configured)
    if (isNew) {
      try {
        const { default: emailjs } = await import("@emailjs/browser");
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_NOTIFY_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            to_email:    "corexnt@gmail.com",
            user_name:   user.displayName || "User",
            user_email:  user.email || "",
            user_type:   userType || "creator",
            signup_date: new Date().toLocaleDateString(),
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        );
      } catch { /* EmailJS not configured — skip */ }
    }

    return { success: true, user };
  } catch (error) {
    if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
      return { success: false, error: "Sign in cancelled" };
    }
    if (error.code === "auth/network-request-failed") {
      return { success: false, error: "Network error. Check your connection." };
    }
    if (error.code === "auth/invalid-api-key" || error.code === "auth/configuration-not-found") {
      return { success: false, error: "Google sign in is not configured. Use email instead." };
    }
    return { success: false, error: "Google sign in failed. Use email instead." };
  }
}
