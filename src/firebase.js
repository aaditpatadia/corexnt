import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey:    import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(userType) {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user   = result.user;
    const isNew  = result._tokenResponse?.isNewUser;

    localStorage.setItem('isLoggedIn',    'true');
    localStorage.setItem('isVerified',    'true');
    localStorage.setItem('userName',      user.displayName || 'User');
    localStorage.setItem('userEmail',     user.email || '');
    localStorage.setItem('userType',      userType || localStorage.getItem('userType') || 'creator');
    localStorage.setItem('loginMethod',   'google');
    localStorage.setItem('sessionExpiry', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());

    if (isNew) {
      try {
        const { default: emailjs } = await import('@emailjs/browser');
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_NOTIFY_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            to_email:    'corexnt@gmail.com',
            user_name:   user.displayName || 'User',
            user_email:  user.email || '',
            user_type:   userType || 'creator',
            signup_date: new Date().toLocaleDateString(),
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        );
      } catch { /* EmailJS not configured — skip */ }
    }

    return { success: true, user };
  } catch (error) {
    console.error('Google sign in error:', error.code);
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return { success: false, error: 'Sign in cancelled' };
    }
    if (error.code === 'auth/unauthorized-domain') {
      return { success: false, error: 'This domain is not authorised. Contact support.' };
    }
    if (error.code === 'auth/network-request-failed') {
      return { success: false, error: 'Network error. Check your connection.' };
    }
    return { success: false, error: error.message };
  }
}
