import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ResponseCard from "../../components/ResponseCard";

const INDUSTRIES = ["D2C / E-commerce","SaaS / Tech","Consumer Goods","Food & Beverage","Fashion & Lifestyle","Health & Wellness","Finance / Fintech","Education","Real Estate","Agency / Services","Other"];

const fieldStyle = {
  background:"#ffffff", border:"1px solid #e8e8e3",
  color:"#1a1a1a", borderRadius:12, fontFamily:"var(--font-body)",
  fontSize:14, outline:"none", width:"100%", padding:"10px 14px",
};

export default function BrandAudit() {
  const [form,    setForm]    = useState({ brand:"", industry:INDUSTRIES[0], audience:"", competitor:"", challenge:"" });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [errors,  setErrors]  = useState({});

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const validate = () => {
    const e={};
    if (!form.brand.trim())     e.brand     = "Required";
    if (!form.audience.trim())  e.audience  = "Required";
    if (!form.challenge.trim()) e.challenge = "Required";
    setErrors(e); return Object.keys(e).length===0;
  };

  const runAudit = async () => {
    if (!validate()) return;
    setLoading(true); setResult(null);
    const prompt = `Run a full brand audit for ${form.brand}.

Industry: ${form.industry}
Target audience: ${form.audience}
Main competitor: ${form.competitor || "Not specified"}
Biggest marketing challenge: ${form.challenge}

Audit these areas:
1. Brand positioning — is it clear and differentiated?
2. Messaging clarity — does their communication land with their target audience?
3. Visual and tonal identity consistency
4. Competitive differentiation — what makes them unique vs competitors?
5. Where they're losing potential customers in their marketing funnel
6. Top 3 immediate improvements they can make right now

Be brutally honest. Give specific, actionable recommendations with examples.`;

    try {
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"user",content:prompt}],userType:"company",engineMode:"Narrative"})});
      const d = await res.json();
      const full = d.reply || "Something went wrong. Try again.";
      setResult({id:Date.now(),role:"assistant",content:full});
    } catch { setResult({id:Date.now(),role:"assistant",content:"Something went wrong. Try again.\n\nChips: 'Try again' | 'Different brand' | 'Help'"}); }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{background:"rgba(45,214,104,0.08)",border:"1px solid rgba(45,214,104,0.2)",color:"#2dd668",fontFamily:"var(--font-body)"}}>
            🛡️ Brand Audit
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{fontFamily:"var(--font-body)",color:"#1a1a1a"}}>Audit your brand</h1>
          <p className="text-sm" style={{color:"var(--text-secondary)",fontFamily:"var(--font-body)"}}>
            Get a full, honest breakdown of your brand positioning and messaging.
          </p>
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
          className="rounded-2xl p-6 mb-6 space-y-5"
          style={{background:"rgba(14,28,16,0.7)",border:"1px solid rgba(45,214,104,0.15)"}}>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{color:errors.brand?"#f87171":"rgba(45,214,104,0.7)",fontFamily:"var(--font-body)"}}>Brand / Company name</label>
              <input type="text" placeholder="e.g. Gymshark" value={form.brand} onChange={e=>set("brand",e.target.value)}
                style={{...fieldStyle,borderColor:errors.brand?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}}
                onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.5)"}
                onBlur={e=>e.target.style.borderColor=errors.brand?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}/>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{color:"#1a7a3c",fontFamily:"var(--font-body)"}}>Industry</label>
              <select value={form.industry} onChange={e=>set("industry",e.target.value)} style={fieldStyle}>
                {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
              style={{color:errors.audience?"#f87171":"rgba(45,214,104,0.7)",fontFamily:"var(--font-body)"}}>Target audience</label>
            <input type="text" placeholder="e.g. Gym-goers aged 18–30 interested in performance and style"
              value={form.audience} onChange={e=>set("audience",e.target.value)}
              style={{...fieldStyle,borderColor:errors.audience?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}}
              onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.5)"}
              onBlur={e=>e.target.style.borderColor=errors.audience?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}/>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{color:"#1a7a3c",fontFamily:"var(--font-body)"}}>Main competitor (optional)</label>
            <input type="text" placeholder="e.g. Nike, Lululemon" value={form.competitor} onChange={e=>set("competitor",e.target.value)}
              style={fieldStyle}
              onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.5)"}
              onBlur={e=>e.target.style.borderColor="rgba(45,214,104,0.18)"}/>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
              style={{color:errors.challenge?"#f87171":"rgba(45,214,104,0.7)",fontFamily:"var(--font-body)"}}>Biggest marketing challenge</label>
            <textarea rows={3} placeholder="e.g. We're getting traffic but not converting. Our messaging feels generic compared to competitors."
              value={form.challenge} onChange={e=>set("challenge",e.target.value)}
              style={{...fieldStyle,resize:"none",lineHeight:1.6,borderColor:errors.challenge?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}}
              onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.5)"}
              onBlur={e=>e.target.style.borderColor=errors.challenge?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}/>
          </div>

          <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={runAudit} disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm btn-green"
            style={{color:"#050a06",fontFamily:"var(--font-body)",opacity:loading?0.7:1}}>
            {loading?<span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black/30 border-t-black/80 rounded-full animate-spin"/>Running audit…</span>:"Run Audit →"}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {result&&<motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
            <ResponseCard message={result} animate={false} onChip={t=>{}} onRegenerate={runAudit}/>
          </motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
