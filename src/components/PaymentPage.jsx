import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a7a3c" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function ToastNotice({ onClose }) {
  const email = localStorage.getItem("userEmail") || "your email";
  return (
    <motion.div
      initial={{ opacity:0, y:30, x:"-50%" }}
      animate={{ opacity:1, y:0,  x:"-50%" }}
      exit={  { opacity:0, y:20,  x:"-50%" }}
      className="fixed bottom-8 left-1/2 z-50 px-6 py-4 rounded-2xl text-sm font-medium max-w-sm text-center"
      style={{
        background:"rgba(10,20,12,0.97)", border:"1px solid rgba(45,214,104,0.35)",
        color:"#f0faf2", boxShadow:"0 8px 40px rgba(0,0,0,0.6)", whiteSpace:"pre-line", fontFamily:"var(--font-body)",
      }}>
      <div className="text-2xl mb-2">🚀</div>
      <div className="font-bold mb-1">Payments launching soon!</div>
      <div style={{ color:"var(--text-secondary)", fontSize:12 }}>
        We'll notify you at <span style={{ color:"#2dd668" }}>{email}</span>
      </div>
      <button onClick={onClose} className="mt-3 text-xs" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>Dismiss</button>
    </motion.div>
  );
}

function PlanCard({ plan, delay }) {
  const [showToast, setShowToast] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ delay, duration:0.45, ease:[0.16,1,0.3,1] }}
        whileHover={{ y:-5 }}
        className="relative flex flex-col rounded-2xl p-6"
        style={{
          background: plan.popular ? "#e8f5ee" : "#ffffff",
          border:     plan.popular ? "2px solid #1a7a3c" : "1px solid #e8e8e3",
          boxShadow:  plan.popular
            ? "0 0 0 4px rgba(26,122,60,0.06), 0 8px 32px rgba(0,0,0,0.08)"
            : "0 2px 12px rgba(0,0,0,0.06)",
          transition:"all 0.3s ease",
        }}>
        {plan.popular && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
            style={{ background:"#1a7a3c", color:"#ffffff", fontFamily:"var(--font-body)" }}>
            Most Popular
          </div>
        )}

        <div className="mb-5">
          <h3 className="text-xl font-bold mb-1" style={{ fontFamily:"var(--font-body)", color:"#1a1a1a" }}>
            {plan.name}
          </h3>
          <p className="text-xs mb-3" style={{ color:"#888888", fontFamily:"var(--font-body)" }}>
            {plan.description}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold"
              style={{ fontFamily:"var(--font-body)", color: plan.popular ? "#1a7a3c" : "#1a1a1a" }}>
              {plan.price}
            </span>
            {plan.period && (
              <span className="text-sm" style={{ color:"#888888", fontFamily:"var(--font-body)" }}>
                /{plan.period}
              </span>
            )}
          </div>
        </div>

        <div className="h-px mb-5" style={{ background:"#e8e8e3" }}/>

        <ul className="space-y-2.5 flex-1 mb-6">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm"
              style={{ color:"#444444", fontFamily:"var(--font-body)" }}>
              <span className="mt-0.5 flex-shrink-0"><CheckIcon/></span>{f}
            </li>
          ))}
        </ul>

        <motion.button
          whileHover={{ scale:1.02 }}
          whileTap={{ scale:0.97 }}
          onClick={() => setShowToast(true)}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200"
          style={plan.popular
            ? { background:"#1a7a3c", color:"#ffffff", fontFamily:"var(--font-body)" }
            : { background:"#f5f5f0", border:"1px solid #e8e8e3", color:"#1a1a1a", fontFamily:"var(--font-body)" }
          }>
          {plan.cta}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showToast && <ToastNotice onClose={() => setShowToast(false)}/>}
      </AnimatePresence>
    </>
  );
}

const CREATOR_PLANS = [
  {
    name:"Trial", price:"$9", period:"15 days", popular:false,
    description:"Try COREX risk-free",
    features:["50 AI messages","Reel Script generator","Growth Audit","Templates library","Email support"],
    cta:"Start trial",
  },
  {
    name:"Pro", price:"$29", period:"month", popular:true,
    description:"For serious creators",
    features:["Unlimited messages","All 5 AI engines","Trend Intelligence","Brand Deal Kit","Priority support","Content calendar"],
    cta:"Get Pro",
  },
  {
    name:"Elite", price:"$79", period:"month", popular:false,
    description:"For top creators and agencies",
    features:["Everything in Pro","Custom AI persona","Analytics dashboard","1-on-1 onboarding","5 team seats","White-label exports"],
    cta:"Go Elite",
  },
];

const COMPANY_PLANS = [
  {
    name:"Starter", price:"$49", period:"month", popular:false,
    description:"For early-stage startups",
    features:["3 team members","Campaign Builder","Budget Allocator","100 sessions/month","Email support"],
    cta:"Get Starter",
  },
  {
    name:"Growth", price:"$149", period:"month", popular:true,
    description:"For scaling brands",
    features:["10 team members","Full suite access","Competitor Intel","Unlimited sessions","Influencer briefs","Priority CSM"],
    cta:"Get Growth",
  },
  {
    name:"Enterprise", price:"Custom", period:"", popular:false,
    description:"For large organisations",
    features:["Unlimited seats","White-label","API access","SLA guarantee","Dedicated account team","Custom integrations"],
    cta:"Contact us",
  },
];

export default function PaymentPage({ onBack, userType="creator" }) {
  const [tab, setTab] = useState(userType);
  const plans = tab === "company" ? COMPANY_PLANS : CREATOR_PLANS;

  return (
    <div className="h-full overflow-y-auto scroll-area relative z-10 px-4 py-10"
      style={{ background:"#f5f5f0" }}>
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm mb-10 transition-colors"
          style={{ color:"#888888", fontFamily:"var(--font-body)" }}
          onMouseEnter={e=>e.currentTarget.style.color="#1a1a1a"}
          onMouseLeave={e=>e.currentTarget.style.color="#888888"}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-3" style={{ fontFamily:"var(--font-body)", color:"#1a1a1a" }}>
            Choose your{" "}
            <span style={{ color:"#1a7a3c" }}>plan</span>
          </h1>
          <p className="text-sm" style={{ color:"#666666", fontFamily:"var(--font-body)" }}>
            Cancel anytime. No hidden fees. Secure payment via Stripe.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <div className="flex p-1 rounded-xl"
            style={{ background:"#ffffff", border:"1px solid #e8e8e3" }}>
            {["creator","company"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-7 py-2 rounded-lg text-sm font-bold transition-all duration-200 capitalize"
                style={tab===t
                  ? { background:"#1a7a3c", color:"#ffffff", fontFamily:"var(--font-body)" }
                  : { color:"#888888", fontFamily:"var(--font-body)" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} delay={i * 0.09}/>
          ))}
        </div>

        <p className="text-center text-xs mt-12" style={{ color:"#aaaaaa", fontFamily:"var(--font-body)" }}>
          Stripe-secured payments · Cancel anytime · No contracts
        </p>
      </div>
    </div>
  );
}
