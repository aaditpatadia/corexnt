export const COSTS = {
  basic: 1,
  smart: 4,
  web_search: 1,
  file: 3,
  pdf: 2,
  brief: 8,
  calendar: 10,
  audit: 6,
  competitor: 8,
  reel: 4,
  branch: 4,
};

export const PACKS = [
  { id:'spark', name:'SPARK', credits:300, bonus:0, inr:299, usd:3.49, expires:90, tag:'75 smart sessions or 37 campaign briefs' },
  { id:'studio', name:'STUDIO', credits:1000, bonus:200, inr:799, usd:9.49, expires:180, tag:'A full month of serious creative work' },
  { id:'nt', name:'NINETEEN TWENTYS', credits:3500, bonus:500, inr:1920, usd:23, expires:null, tag:'The full Creative OS. Never expires.' },
];

export const getCredits = () => parseInt(localStorage.getItem('corex_credits') || '0');
export const setCredits = (n) => localStorage.setItem('corex_credits', String(Math.max(0, n)));
export const deduct = (cost) => {
  const bal = getCredits();
  if (bal < cost) return false;
  setCredits(bal - cost);
  // Async sync — fire and forget, never blocks deduction
  syncCreditsToFirestore().catch(() => {});
  return true;
};
export const add = (amount) => {
  setCredits(getCredits() + amount);
  syncCreditsToFirestore().catch(() => {});
};

export const translate = (n) => {
  if (n <= 0) return 'No credits · Top up to continue';
  if (n < 4) return `${n} credit${n > 1 ? 's' : ''} remaining`;
  const s = Math.floor(n / 4);
  const b = Math.floor(n / 8);
  if (n < 30) return `~${s} smart sessions remaining`;
  return `~${s} smart sessions or ${b} campaign briefs`;
};

const notifyAdminCoupon = async (email, coupon) => {
  try {
    const { default: emailjs } = await import('@emailjs/browser');
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_NOTIFY_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: 'corexnt@gmail.com',
        user_name: 'Coupon User',
        user_email: email,
        user_type: `Coupon: ${coupon}`,
        signup_date: new Date().toLocaleDateString(),
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    );
  } catch { /* silent */ }
};

export const applyCoupon = (code) => {
  const upper = code.toUpperCase().trim();

  // CNT1920 — uses its own localStorage key for once-per-device enforcement
  if (upper === 'CNT1920') {
    const used = JSON.parse(localStorage.getItem('corex_used_coupons') || '[]');
    if (used.includes('CNT1920')) return { ok: false, success: false, msg: 'Already used', message: 'Already used on this device.' };
    add(100);
    localStorage.setItem('corex_used_coupons', JSON.stringify([...used, 'CNT1920']));
    notifyAdminCoupon(localStorage.getItem('userEmail') || 'unknown', 'CNT1920');
    return { ok: true, success: true, credits: 100, msg: '+100 credits added!', message: 'CNT1920 applied! 100 credits added.' };
  }

  const codes = JSON.parse(localStorage.getItem('corex_coupons_used') || '[]');
  const VALID = { 'LAUNCH50': 50, 'CREATOR100': 100, 'WELCOME25': 25, 'NT500': 500, 'COREX200': 200 };
  if (!VALID[upper]) return { ok: false, success: false, msg: 'Invalid code', message: 'Invalid code.' };
  if (codes.includes(upper)) return { ok: false, success: false, msg: 'Already used', message: 'Already used on this device.' };
  add(VALID[upper]);
  localStorage.setItem('corex_coupons_used', JSON.stringify([...codes, upper]));
  return { ok: true, success: true, credits: VALID[upper], msg: `+${VALID[upper]} credits added!`, message: `${upper} applied! ${VALID[upper]} credits added.` };
};

// Legacy aliases for backward compat
export const deductCredits = (cost) => deduct(cost);
export const addCredits = (amount) => add(amount);
export const CREDIT_COSTS = COSTS;
export const CREDIT_PACKS = PACKS;
export const translateCredits = translate;

// Sync credits to/from Firestore when user is logged in
export const syncCreditsToFirestore = async () => {
  try {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    const { db } = await import('../firebase');
    const { doc, setDoc } = await import('firebase/firestore');
    const credits = getCredits();
    await setDoc(doc(db, 'users', email), { credits, updatedAt: Date.now() }, { merge: true });
  } catch { /* silent */ }
};

export const loadCreditsFromFirestore = async () => {
  try {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    const { db } = await import('../firebase');
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'users', email));
    if (snap.exists()) {
      const data = snap.data();
      if (data.credits !== undefined) {
        // Use the higher of the two (don't reduce credits on load)
        const local = getCredits();
        const remote = data.credits;
        if (remote > local) {
          setCredits(remote);
          return remote;
        }
      }
    }
    return getCredits();
  } catch { return getCredits(); }
};
