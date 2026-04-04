import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";

function Toast({ onClose }) {
  const email = localStorage.getItem("corex_userEmail") || "your email";
  return (
    <motion.div
      initial={{ opacity:0, y:30, x:"-50%" }}
      animate={{ opacity:1, y:0,  x:"-50%" }}
      exit={  { opacity:0, y:20,  x:"-50%" }}
      className="fixed bottom-8 left-1/2 z-50 px-6 py-4 rounded-2xl text-sm font-medium max-w-sm text-center"
      style={{
        background:"rgba(10,20,12,0.97)",
        border:"1px solid rgba(45,214,104,0.35)",
        color:"#f0faf2",
        boxShadow:"0 8px 40px rgba(0,0,0,0.6)",
        whiteSpace:"pre-line",
      }}
    >
      <div className="text-2xl mb-2">🚀</div>
      <div className="font-bold mb-1">Razorpay integration coming soon!</div>
      <div style={{ color:"var(--text-secondary)", fontSize:12 }}>
        We'll notify you at{" "}
        <span style={{ color:"#2dd668" }}>{email}</span>
      </div>
      <button onClick={onClose} className="mt-3 text-xs" style={{ color:"var(--text-muted)" }}>Dismiss</button>
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
          background: plan.popular ? "rgba(45,214,104,0.06)" : "rgba(20,40,24,0.5)",
          border:     plan.popular ? "1px solid rgba(45,214,104,0.4)" : "1px solid rgba(45,214,104,0.1)",
          boxShadow:  plan.popular ? "0 0 40px rgba(45,214,104,0.1), 0 8px 32px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease",
        }}
      >
        {plan.popular && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
            style={{ background:"#2dd668", color:"#050a06" }}>
            Most Popular
          </div>
        )}

        <div className="mb-5">
          <h3 className="text-xl font-bold mb-1" style={{ fontFamily:"Sora,sans-serif" }}>{plan.name}</h3>
          <p className="text-xs mb-3" style={{ color:"var(--text-muted)" }}>{plan.description}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold"
              style={{ fontFamily:"Sora,sans-serif", color: plan.popular?"#2dd668":"#f0faf2" }}>
              {plan.price}
            </span>
            {plan.period && <span className="text-sm" style={{ color:"var(--text-muted)" }}>/{plan.period}</span>}
          </div>
        </div>

        <div className="h-px mb-5" style={{ background:"rgba(45,214,104,0.1)" }}/>

        <ul className="space-y-2.5 flex-1 mb-6">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color:"var(--text-secondary)" }}>
              <Check size={13} style={{ color:"#2dd668", flexShrink:0, marginTop:2 }}/>{f}
            </li>
          ))}
        </ul>

        <motion.button
          whileHover={{ scale:1.02 }}
          whileTap={{ scale:0.97 }}
          onClick={() => setShowToast(true)}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200"
          style={plan.popular
            ? { background:"#2dd668", color:"#050a06" }
            : { background:"rgba(45,214,104,0.07)", border:"1px solid rgba(45,214,104,0.18)", color:"#f0faf2" }
          }
        >
          {plan.cta}
        </motion.button>
      </motion.div>

      <AnimatePresence>{showToast && <Toast onClose={()=>setShowToast(false)}/>}</AnimatePresence>
    </>
  );
}

const CREATOR_PLANS = [
  {
    name:"Trial", price:"₹192", period:"15 days", popular:false,
    description:"Perfect for trying Corex",
    features:["50 AI messages","Reel Script generator","Growth Audit","Templates library","Email support"],
    cta:"Start trial",
  },
  {
    name:"Pro", price:"₹499", period:"month", popular:true,
    description:"For serious creators",
    features:["Unlimited messages","All 5 engines","Trend Intelligence","Brand Deal Kit","Priority support","Content calendar"],
    cta:"Get Pro",
  },
  {
    name:"Elite", price:"₹999", period:"month", popular:false,
    description:"For top creators & agencies",
    features:["Everything in Pro","Custom AI persona","Analytics dashboard","1-on-1 onboarding","5 team seats","White-label exports"],
    cta:"Go Elite",
  },
];

const COMPANY_PLANS = [
  {
    name:"Starter", price:"₹2,999", period:"month", popular:false,
    description:"For early-stage startups",
    features:["3 team members","Campaign Builder","Budget Allocator","100 sessions/month","Email support"],
    cta:"Get Starter",
  },
  {
    name:"Growth", price:"₹7,999", period:"month", popular:true,
    description:"For scaling brands",
    features:["10 team members","Full suite access","Competitor Intel","Unlimited sessions","Influencer briefs","Priority CSM"],
    cta:"Get Growth",
  },
  {
    name:"Enterprise", price:"Custom", period:"", popular:false,
    description:"For large organisations",
    features:["Unlimited seats","White label","API access","SLA guarantee","Dedicated account team","Custom integrations"],
    cta:"Contact us",
  },
];

export default function PaymentPage({ onBack, userType="creator" }) {
  const [tab, setTab] = useState(userType);
  const plans = tab === "company" ? COMPANY_PLANS : CREATOR_PLANS;

  return (
    <div className="min-h-screen overflow-y-auto relative z-10 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm mb-10 transition-colors"
          style={{ color:"var(--text-muted)" }}
          onMouseEnter={e=>e.currentTarget.style.color="#f0faf2"}
          onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
          <ArrowLeft size={15}/> Back to dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-3" style={{ fontFamily:"Sora,sans-serif" }}>
            Choose your{" "}
            <span className="gradient-text-green">plan</span>
          </h1>
          <p style={{ color:"var(--text-secondary)" }}>Cancel anytime. No hidden fees. All prices in INR.</p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <div className="flex p-1 rounded-xl"
            style={{ background:"rgba(20,40,24,0.6)", border:"1px solid rgba(45,214,104,0.15)" }}>
            {["creator","company"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-7 py-2 rounded-lg text-sm font-bold transition-all duration-200 capitalize"
                style={tab===t ? { background:"#2dd668", color:"#050a06" } : { color:"var(--text-secondary)" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} delay={i*0.09}/>
          ))}
        </div>

        <p className="text-center text-xs mt-12" style={{ color:"var(--text-muted)" }}>
          GST extra · Razorpay integration coming soon · Secure payments
        </p>
      </div>
    </div>
  );
}
