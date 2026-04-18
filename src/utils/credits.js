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
export const deduct = (cost) => { const bal = getCredits(); if (bal < cost) return false; setCredits(bal - cost); return true; };
export const add = (amount) => setCredits(getCredits() + amount);

export const translate = (n) => {
  if (n <= 0) return 'No credits · Top up to continue';
  if (n < 4) return `${n} credit${n > 1 ? 's' : ''} remaining`;
  const s = Math.floor(n / 4);
  const b = Math.floor(n / 8);
  if (n < 30) return `~${s} smart sessions remaining`;
  return `~${s} smart sessions or ${b} campaign briefs`;
};

export const applyCoupon = (code) => {
  const codes = JSON.parse(localStorage.getItem('corex_coupons_used') || '[]');
  const VALID = { 'LAUNCH50': 50, 'CREATOR100': 100, 'WELCOME25': 25, 'NT500': 500, 'COREX200': 200 };
  const upper = code.toUpperCase().trim();
  if (!VALID[upper]) return { ok: false, msg: 'Invalid code' };
  if (codes.includes(upper)) return { ok: false, msg: 'Already used' };
  add(VALID[upper]);
  localStorage.setItem('corex_coupons_used', JSON.stringify([...codes, upper]));
  return { ok: true, credits: VALID[upper], msg: `+${VALID[upper]} credits added!` };
};

// Legacy aliases for backward compat
export const deductCredits = (cost) => deduct(cost);
export const addCredits = (amount) => add(amount);
export const CREDIT_COSTS = COSTS;
export const CREDIT_PACKS = PACKS;
export const translateCredits = translate;
