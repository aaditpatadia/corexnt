import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Currency detection ─── */
function detectIndia() {
  const locale = navigator.language || "en-IN";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  return (
    locale.toLowerCase().includes("in") ||
    tz.includes("Calcutta") ||
    tz.includes("Kolkata")
  );
}

/* ─── Check icon ─── */
function Check() {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      width:18, height:18, borderRadius:"50%",
      background:"#e8f5ee", flexShrink:0, marginTop:1,
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="#1a7a3c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </span>
  );
}

/* ─── Cross icon ─── */
function Cross() {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      width:18, height:18, borderRadius:"50%",
      background:"#f5f5f0", flexShrink:0, marginTop:1,
    }}>
      <svg width="8" height="2" viewBox="0 0 10 2">
        <rect x="0" y="0" width="10" height="2" rx="1" fill="#bbbbbb"/>
      </svg>
    </span>
  );
}

/* ─── Pill toggle ─── */
function PillToggle({ options, value, onChange, small }) {
  return (
    <div style={{
      display:"inline-flex", background:"#ffffff",
      border:"1px solid #e8e8e3", borderRadius:100,
      padding:4, gap:4,
    }}>
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          style={{
            padding: small ? "8px 20px" : "10px 28px",
            borderRadius:100, border:"none", cursor:"pointer",
            fontFamily:"Montserrat, sans-serif",
            fontSize: small ? 13 : 14,
            fontWeight:600,
            background: value === opt.value ? "#1a7a3c" : "transparent",
            color: value === opt.value ? "#ffffff" : "#888888",
            transition:"all 0.2s ease",
            whiteSpace:"nowrap",
          }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Feature row ─── */
function Feature({ text }) {
  return (
    <li style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10 }}>
      <Check/>
      <span style={{ fontFamily:"Montserrat, sans-serif", fontSize:14, fontWeight:500, color:"#444444", lineHeight:1.5 }}>
        {text}
      </span>
    </li>
  );
}

/* ─── Price display ─── */
function Price({ monthly, threeMonth, billing, isIndia }) {
  const cur = isIndia ? "₹" : "$";
  const mo = isIndia ? monthly.inr : monthly.usd;
  const disc = isIndia ? threeMonth.inr : threeMonth.usd;
  const billed = isIndia ? threeMonth.billedInr : threeMonth.billedUsd;

  if (mo === "Custom") {
    return (
      <div>
        <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:44, fontWeight:800, color:"#1a1a1a", lineHeight:1 }}>
          Custom
        </div>
        <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:12, color:"#888888", marginTop:4 }}>
          {isIndia ? "Starting ₹15,000/month" : "Starting $199/month"}
        </div>
      </div>
    );
  }

  return (
    <div>
      {billing === "3month" ? (
        <>
          <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
            <span style={{ fontFamily:"Montserrat, sans-serif", fontSize:44, fontWeight:800, color:"#1a7a3c", lineHeight:1 }}>
              {cur}{disc}
            </span>
            <span style={{ fontFamily:"Montserrat, sans-serif", fontSize:15, color:"#888888" }}>/mo</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
            <span style={{ fontFamily:"Montserrat, sans-serif", fontSize:13, color:"#bbbbbb", textDecoration:"line-through" }}>
              {cur}{mo}/mo
            </span>
          </div>
          <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:12, color:"#888888", marginTop:2 }}>
            Billed {isIndia ? `₹${billed}` : `$${billed}`} every 3 months
          </div>
        </>
      ) : (
        <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
          <span style={{ fontFamily:"Montserrat, sans-serif", fontSize:44, fontWeight:800, color:"#1a1a1a", lineHeight:1 }}>
            {cur}{mo}
          </span>
          <span style={{ fontFamily:"Montserrat, sans-serif", fontSize:15, color:"#888888" }}>/month</span>
        </div>
      )}
      <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:11, color:"#aaaaaa", marginTop:6 }}>
        {isIndia ? "Prices in Indian Rupees (₹)" : "Prices in USD ($)"}
      </div>
    </div>
  );
}

/* ─── Plan card ─── */
function PlanCard({ plan, billing, isIndia, delay }) {
  const [hovered, setHovered] = useState(false);

  const isPopular = plan.badge === "Most Popular";
  const isBest = plan.badge === "Best Value";

  const cardStyle = {
    position:"relative",
    background:"#ffffff",
    borderRadius:20,
    padding:28,
    display:"flex",
    flexDirection:"column",
    border: isPopular ? "2px solid #1a7a3c" : "1px solid #e8e8e3",
    boxShadow: isPopular
      ? "0 8px 32px rgba(26,122,60,0.12)"
      : "0 2px 12px rgba(0,0,0,0.06)",
    transition:"all 0.25s cubic-bezier(0.16,1,0.3,1)",
    transform: hovered ? "translateY(-3px)" : "translateY(0)",
    animation: isPopular ? "subtlePulse 3s ease-in-out infinite" : "none",
  };

  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay, duration:0.45, ease:[0.16,1,0.3,1] }}
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badge */}
      {plan.badge && (
        <div style={{
          position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)",
          padding:"5px 16px", borderRadius:100,
          fontFamily:"Montserrat, sans-serif", fontSize:11, fontWeight:600,
          whiteSpace:"nowrap",
          ...(isPopular
            ? { background:"#1a7a3c", color:"#ffffff" }
            : { background:"#f0faf4", color:"#1a7a3c", border:"1px solid #c8e6d4" }
          ),
        }}>
          {plan.badge}
        </div>
      )}

      {/* Plan name */}
      <div style={{
        fontFamily:"Montserrat, sans-serif", fontSize:13, fontWeight:600,
        color:"#888888", letterSpacing:1, textTransform:"uppercase", marginBottom:8,
        marginTop: plan.badge ? 8 : 0,
      }}>
        {plan.name}
      </div>

      {/* Price */}
      <div style={{ marginBottom:20 }}>
        <Price
          monthly={plan.monthly}
          threeMonth={plan.threeMonth}
          billing={billing}
          isIndia={isIndia}
        />
      </div>

      {/* Divider */}
      <div style={{ height:1, background:"#f0f0eb", marginBottom:20 }}/>

      {/* Features */}
      <ul style={{ listStyle:"none", padding:0, margin:"0 0 24px 0", flex:1 }}>
        {plan.features.map((f) => <Feature key={f} text={f}/>)}
      </ul>

      {/* CTA */}
      <PlanButton plan={plan} hovered={hovered}/>
    </motion.div>
  );
}

function PlanButton({ plan }) {
  const [btnHov, setBtnHov] = useState(false);

  const isPopular = plan.badge === "Most Popular";

  if (plan.enterprise) {
    return (
      <a href="mailto:corexnt@gmail.com"
        onMouseEnter={() => setBtnHov(true)}
        onMouseLeave={() => setBtnHov(false)}
        style={{
          display:"block", textAlign:"center", textDecoration:"none",
          padding:"14px 0", borderRadius:100,
          fontFamily:"Montserrat, sans-serif", fontSize:15, fontWeight:600,
          border:"1.5px solid #1a7a3c",
          background: btnHov ? "#1a7a3c" : "#ffffff",
          color: btnHov ? "#ffffff" : "#1a7a3c",
          transition:"all 0.2s ease",
        }}>
        {plan.cta}
      </a>
    );
  }

  if (isPopular) {
    return (
      <button
        onMouseEnter={() => setBtnHov(true)}
        onMouseLeave={() => setBtnHov(false)}
        onClick={() => alert("Payments launching soon — you'll be notified!")}
        style={{
          width:"100%", padding:"14px 0", borderRadius:100, border:"none",
          fontFamily:"Montserrat, sans-serif", fontSize:15, fontWeight:600,
          background: btnHov ? "#155f30" : "#1a7a3c",
          color:"#ffffff", cursor:"pointer",
          boxShadow: btnHov ? "0 6px 20px rgba(26,122,60,0.4)" : "0 4px 14px rgba(26,122,60,0.3)",
          transition:"all 0.2s ease",
        }}>
        {plan.cta}
      </button>
    );
  }

  return (
    <button
      onMouseEnter={() => setBtnHov(true)}
      onMouseLeave={() => setBtnHov(false)}
      onClick={() => alert("Payments launching soon — you'll be notified!")}
      style={{
        width:"100%", padding:"14px 0", borderRadius:100,
        fontFamily:"Montserrat, sans-serif", fontSize:15, fontWeight:600,
        border:"1.5px solid #1a7a3c",
        background: btnHov ? "#1a7a3c" : "#ffffff",
        color: btnHov ? "#ffffff" : "#1a7a3c",
        cursor:"pointer",
        transition:"all 0.2s ease",
      }}>
      {plan.cta}
    </button>
  );
}

/* ─── Plan data ─── */
const CREATOR_PLANS = [
  {
    name:"Starter",
    monthly:{ inr:"349", usd:"4.99" },
    threeMonth:{ inr:"279", usd:"3.99", billedInr:"838", billedUsd:"11.97" },
    features:[
      "Claude AI (Sonnet)",
      "30 messages per day",
      "3 file uploads per day",
      "Reel Script Engine",
      "3 Growth Audits per month",
      "Download responses as PDF",
      "30-day conversation history",
    ],
    cta:"Get Started",
  },
  {
    name:"Pro",
    badge:"Most Popular",
    monthly:{ inr:"499", usd:"9.99" },
    threeMonth:{ inr:"399", usd:"7.99", billedInr:"1,198", billedUsd:"23.97" },
    features:[
      "Claude AI (Sonnet) — full access",
      "Unlimited messages",
      "Unlimited file uploads",
      "All Creator tools",
      "Trend Engine with live data",
      "Brand Deal Calculator",
      "Content Calendar generator",
      "Priority support",
      "1 year conversation history",
    ],
    cta:"Get Pro",
  },
  {
    name:"Elite",
    badge:"Best Value",
    monthly:{ inr:"999", usd:"19.99" },
    threeMonth:{ inr:"799", usd:"15.99", billedInr:"2,398", billedUsd:"47.97" },
    features:[
      "Claude AI (Opus) — most powerful",
      "Everything in Pro",
      "Custom AI persona",
      "Track 5 competitors",
      "Weekly strategy digest",
      "Early access to new features",
      "Dedicated support",
    ],
    cta:"Get Elite",
  },
];

const BRAND_PLANS = [
  {
    name:"Starter",
    monthly:{ inr:"1,999", usd:"29" },
    threeMonth:{ inr:"1,599", usd:"23", billedInr:"4,797", billedUsd:"69" },
    features:[
      "Claude AI (Sonnet)",
      "3 team seats",
      "Campaign Builder (5/month)",
      "Budget Allocator",
      "Track 3 competitors",
      "Brand Audit (1/month)",
      "Downloadable briefs and reports",
      "30-day history",
    ],
    cta:"Get Started",
  },
  {
    name:"Growth",
    badge:"Most Popular",
    monthly:{ inr:"4,999", usd:"79" },
    threeMonth:{ inr:"3,999", usd:"63", billedInr:"11,997", billedUsd:"189" },
    features:[
      "Claude Sonnet + Opus",
      "10 team seats",
      "Unlimited campaigns",
      "Full competitor intelligence",
      "Influencer matching",
      "Weekly market intelligence report",
      "Priority support (4hr response)",
      "Custom brand memory",
      "1 year history",
    ],
    cta:"Get Growth",
  },
  {
    name:"Enterprise",
    monthly:{ inr:"Custom", usd:"Custom" },
    threeMonth:{ inr:"Custom", usd:"Custom", billedInr:"", billedUsd:"" },
    enterprise:true,
    features:[
      "Custom Claude deployment",
      "Unlimited everything",
      "API access",
      "White label option",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta:"Contact Us",
  },
];

/* ─── Comparison table ─── */
const CREATOR_TABLE = {
  headers:["Feature","Starter","Pro","Elite"],
  rows:[
    ["Messages/day","30","Unlimited","Unlimited"],
    ["File uploads","3/day","Unlimited","Unlimited"],
    ["Claude model","Sonnet","Sonnet","Opus"],
    ["Reel Scripts",true,true,true],
    ["Growth Audit","3/month","Unlimited","Unlimited"],
    ["Trend Engine",false,true,true],
    ["Brand Deals",false,true,true],
    ["Content Calendar",false,true,true],
    ["Competitor tracking",false,false,"5 brands"],
    ["Custom AI persona",false,false,true],
    ["PDF downloads",true,true,true],
    ["History","30 days","1 year","1 year"],
    ["Support","Standard","Priority","Dedicated"],
  ],
};

const BRAND_TABLE = {
  headers:["Feature","Starter","Growth","Enterprise"],
  rows:[
    ["Team seats","3","10","Unlimited"],
    ["Campaign Builder","5/month","Unlimited","Unlimited"],
    ["Competitor tracking","3","Unlimited","Unlimited"],
    ["Brand Audit","1/month","Unlimited","Unlimited"],
    ["Claude model","Sonnet","Sonnet+Opus","Custom"],
    ["Influencer matching",false,true,true],
    ["Market intel report",false,"Weekly","Custom"],
    ["API access",false,false,true],
    ["White label",false,false,true],
    ["History","30 days","1 year","Unlimited"],
    ["Support","Standard","Priority (4hr)","Dedicated SLA"],
  ],
};

function TableCell({ value }) {
  if (value === true) {
    return (
      <td style={{ padding:"12px 16px", textAlign:"center" }}>
        <span style={{
          display:"inline-flex", alignItems:"center", justifyContent:"center",
          width:22, height:22, borderRadius:"50%", background:"#e8f5ee",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="#1a7a3c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
      </td>
    );
  }
  if (value === false) {
    return (
      <td style={{ padding:"12px 16px", textAlign:"center" }}>
        <span style={{
          display:"inline-block", width:16, height:2, background:"#cccccc",
          borderRadius:2, verticalAlign:"middle",
        }}/>
      </td>
    );
  }
  return (
    <td style={{
      padding:"12px 16px", textAlign:"center",
      fontFamily:"Montserrat, sans-serif", fontSize:13, color:"#444444",
    }}>
      {value}
    </td>
  );
}

function ComparisonTable({ userType }) {
  const table = userType === "brand" ? BRAND_TABLE : CREATOR_TABLE;
  return (
    <div style={{ marginTop:60 }}>
      <h2 style={{
        fontFamily:"Montserrat, sans-serif", fontSize:20, fontWeight:700,
        color:"#1a1a1a", marginBottom:20,
      }}>
        Compare all features
      </h2>
      <div style={{
        background:"#ffffff", borderRadius:20, border:"1px solid #e8e8e3",
        overflow:"auto",
      }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:520 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #e8e8e3" }}>
              {table.headers.map((h, i) => (
                <th key={h} style={{
                  padding:"14px 16px",
                  textAlign: i === 0 ? "left" : "center",
                  fontFamily:"Montserrat, sans-serif", fontSize:13, fontWeight:600,
                  color:"#1a1a1a",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? "#ffffff" : "#f9f9f7" }}>
                <td style={{
                  padding:"12px 16px",
                  fontFamily:"Montserrat, sans-serif", fontSize:13, fontWeight:500,
                  color:"#1a1a1a",
                }}>
                  {row[0]}
                </td>
                {row.slice(1).map((val, ci) => <TableCell key={ci} value={val}/>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── FAQ accordion ─── */
const FAQS = [
  {
    q:"Can I cancel anytime?",
    a:"Yes, completely. Cancel from your settings with one click. No questions, no fees. Your access continues until the end of your billing period.",
  },
  {
    q:"What's the difference between GPT and Claude?",
    a:"Free plan users get GPT-4o-mini — fast and capable. Paid users get Claude by Anthropic — significantly better at strategy, nuance, and long-form thinking. Most users notice the difference immediately in response quality.",
  },
  {
    q:"Can I switch between Creator and Brand plans?",
    a:"Yes. Contact us at corexnt@gmail.com and we'll switch your plan. We're working on self-serve plan switching — coming soon.",
  },
  {
    q:"Do you offer refunds?",
    a:"We offer a full refund within 48 hours of your first payment if you're not satisfied. After that, we don't offer refunds but you can cancel anytime.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ marginTop:64 }}>
      <h2 style={{
        fontFamily:"Montserrat, sans-serif", fontSize:24, fontWeight:700,
        color:"#1a1a1a", textAlign:"center", marginBottom:28,
      }}>
        Questions? We have answers.
      </h2>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {FAQS.map((faq, i) => (
          <div key={i} style={{
            background:"#ffffff", borderRadius:20, border:"1px solid #e8e8e3",
            overflow:"hidden",
          }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"18px 20px", border:"none", background:"transparent", cursor:"pointer",
                textAlign:"left",
              }}>
              <span style={{
                fontFamily:"Montserrat, sans-serif", fontSize:15, fontWeight:600, color:"#1a1a1a",
              }}>
                {faq.q}
              </span>
              <span style={{
                flexShrink:0, marginLeft:16,
                fontFamily:"Montserrat, sans-serif", fontSize:20, fontWeight:600, color:"#1a7a3c",
                lineHeight:1,
              }}>
                {open === i ? "−" : "+"}
              </span>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height:0, opacity:0 }}
                  animate={{ height:"auto", opacity:1 }}
                  exit={{ height:0, opacity:0 }}
                  transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
                  style={{ overflow:"hidden" }}>
                  <div style={{
                    padding:"0 20px 18px",
                    borderTop:"1px solid #f0f0eb",
                    fontFamily:"Montserrat, sans-serif", fontSize:14, color:"#555555",
                    lineHeight:1.65, paddingTop:14,
                  }}>
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Waitlist banner ─── */
function WaitlistBanner() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const savedEmail = (() => {
    try { return JSON.parse(localStorage.getItem("corex_waitlist") || "[]"); } catch { return []; }
  })();

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes("@")) return;
    const list = savedEmail;
    if (!list.includes(email)) list.push(email);
    localStorage.setItem("corex_waitlist", JSON.stringify(list));
    setDone(true);
  }

  return (
    <div style={{
      background:"#fffbeb", border:"1px solid #fde68a", borderRadius:12,
      padding:"16px 20px", marginBottom:28, textAlign:"center",
    }}>
      {done ? (
        <p style={{ fontFamily:"Montserrat, sans-serif", fontSize:14, fontWeight:500, color:"#1a7a3c", margin:0 }}>
          You&apos;re on the list! We&apos;ll email you at <strong>{email}</strong> when we go live.
        </p>
      ) : (
        <>
          <p style={{ fontFamily:"Montserrat, sans-serif", fontSize:14, fontWeight:500, color:"#92400e", margin:"0 0 12px 0" }}>
            ⚡ Payments launching soon — Join the waitlist and get 30 days free when we go live.
          </p>
          <form onSubmit={handleSubmit}
            style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                padding:"10px 20px", borderRadius:100,
                border:"1px solid #fde68a", background:"#ffffff",
                fontFamily:"Montserrat, sans-serif", fontSize:14, color:"#1a1a1a",
                outline:"none", minWidth:220,
              }}
            />
            <button type="submit" style={{
              padding:"10px 20px", borderRadius:100, border:"none",
              background:"#f59e0b", color:"#ffffff",
              fontFamily:"Montserrat, sans-serif", fontSize:14, fontWeight:600,
              cursor:"pointer",
            }}>
              Join Waitlist
            </button>
          </form>
        </>
      )}
    </div>
  );
}

/* ─── Main page ─── */
export default function PaymentPage({ onBack, userType: initType = "creator" }) {
  const [tab, setTab] = useState(initType === "company" ? "brand" : "creator");
  const [billing, setBilling] = useState("monthly");
  const [isIndia, setIsIndia] = useState(true);

  useEffect(() => { setIsIndia(detectIndia()); }, []);

  const plans = tab === "brand" ? BRAND_PLANS : CREATOR_PLANS;

  return (
    <>
      <style>{`
        @keyframes subtlePulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(26,122,60,0.12); }
          50% { box-shadow: 0 8px 40px rgba(26,122,60,0.22); }
        }
        @media (max-width: 768px) {
          .payment-grid { grid-template-columns: 1fr !important; }
          .payment-toggles { flex-direction: column; align-items: center; gap: 10px !important; }
        }
      `}</style>

      <div style={{ background:"#f5f5f0", minHeight:"100%", overflowY:"auto", padding:"32px 24px 80px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>

          {/* Back */}
          <button onClick={onBack}
            style={{
              display:"inline-flex", alignItems:"center", gap:8,
              fontFamily:"Montserrat, sans-serif", fontSize:14, color:"#888888",
              background:"none", border:"none", cursor:"pointer",
              marginBottom:36, padding:0, transition:"color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color="#1a1a1a"}
            onMouseLeave={e => e.currentTarget.style.color="#888888"}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to dashboard
          </button>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <h1 style={{
              fontFamily:"Montserrat, sans-serif", fontSize:32, fontWeight:700,
              color:"#1a1a1a", margin:"0 0 8px 0",
            }}>
              Choose your plan
            </h1>
            <p style={{
              fontFamily:"Montserrat, sans-serif", fontSize:16, fontWeight:400,
              color:"#888888", margin:0,
            }}>
              Start free. Upgrade when ready. Cancel anytime.
            </p>
          </div>

          {/* Toggles */}
          <div className="payment-toggles" style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:16, marginBottom:40 }}>
            <PillToggle
              options={[
                { label:"For Creators", value:"creator" },
                { label:"For Brands",   value:"brand" },
              ]}
              value={tab}
              onChange={setTab}
            />
            <PillToggle
              options={[
                { label:"Monthly",              value:"monthly" },
                { label:"3 Months (Save 20%)",  value:"3month" },
              ]}
              value={billing}
              onChange={setBilling}
              small
            />
          </div>

          {/* Waitlist banner */}
          <WaitlistBanner/>

          {/* Plan cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              exit={{ opacity:0 }}
              transition={{ duration:0.15 }}
            >
              <div className="payment-grid" style={{
                display:"grid",
                gridTemplateColumns:"repeat(3, 1fr)",
                gap:16,
              }}>
                {plans.map((plan, i) => (
                  <PlanCard
                    key={plan.name}
                    plan={plan}
                    billing={billing}
                    isIndia={isIndia}
                    delay={i * 0.1}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Comparison table */}
          <ComparisonTable userType={tab}/>

          {/* FAQ */}
          <FAQ/>

          <p style={{
            textAlign:"center", marginTop:48,
            fontFamily:"Montserrat, sans-serif", fontSize:12, color:"#aaaaaa",
          }}>
            Stripe-secured payments · Cancel anytime · No contracts
          </p>

        </div>
      </div>
    </>
  );
}
