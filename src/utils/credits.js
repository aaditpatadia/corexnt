export const CREDIT_COSTS = {
  basic_message: 1,
  smart_message: 4,
  web_search: 1,
  file_analysis: 3,
  pdf_upload: 2,
  campaign_brief: 8,
  content_calendar: 10,
  growth_audit: 6,
  competitor_intel: 8,
  reel_script: 4,
  branching_session: 4,
};

export const CREDIT_PACKS = [
  {
    id: "spark",
    name: "SPARK",
    credits: 300,
    bonus: 0,
    price_inr: 299,
    price_usd: 3.49,
    expires_days: 90,
    tagline: "75 smart sessions or 60 campaign briefs",
  },
  {
    id: "studio",
    name: "STUDIO",
    credits: 1000,
    bonus: 200,
    price_inr: 799,
    price_usd: 9.49,
    expires_days: 180,
    tagline: "A serious month of creative work",
  },
  {
    id: "nt",
    name: "NINETEEN TWENTYS",
    credits: 3500,
    bonus: 500,
    price_inr: 1920,
    price_usd: 23,
    expires_days: null,
    tagline: "The full Creative OS. For studios and founders.",
  },
];

export function getCredits() {
  return parseInt(localStorage.getItem("corex_credits") || "0");
}

export function deductCredits(amount) {
  const current = getCredits();
  const newBalance = Math.max(0, current - amount);
  localStorage.setItem("corex_credits", newBalance.toString());
  return newBalance;
}

export function addCredits(amount) {
  const current = getCredits();
  const newBalance = current + amount;
  localStorage.setItem("corex_credits", newBalance.toString());
  return newBalance;
}

export function translateCredits(amount) {
  if (amount <= 0) return "No credits remaining";
  if (amount < 4) return `${amount} basic message${amount > 1 ? "s" : ""}`;
  const smart = Math.floor(amount / 4);
  const briefs = Math.floor(amount / 8);
  if (amount < 20) return `about ${smart} smart session${smart > 1 ? "s" : ""}`;
  if (amount < 50) return `about ${smart} smart sessions or ${briefs} campaign briefs`;
  return `${smart} smart sessions or ${briefs} campaign briefs`;
}
