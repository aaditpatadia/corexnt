import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ResponseCard from "../../components/ResponseCard";

const GOALS     = ["Awareness","Lead Generation","Sales","Retention","Reactivation"];
const TIMELINES = ["30 days","60 days","90 days","6 months"];
const PLATFORMS = ["Instagram","Facebook","YouTube","Google Ads","TikTok","LinkedIn","Email","Influencer","OOH / Print"];

const fieldStyle = {
  background:"#ffffff", border:"1px solid #e8e8e3",
  color:"#1a1a1a", borderRadius:12, fontFamily:"var(--font-body)",
  fontSize:14, outline:"none", width:"100%", padding:"10px 14px",
};

export default function CampaignBuilder() {
  const [form, setForm] = useState({
    product:"", audience:"", goal:"Awareness", budget:"", timeline:"30 days", platforms:[],
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [errors,  setErrors]  = useState({});

  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const togglePlatform = (p) => setForm(prev=>({
    ...prev,
    platforms: prev.platforms.includes(p) ? prev.platforms.filter(x=>x!==p) : [...prev.platforms, p],
  }));

  const validate = () => {
    const e = {};
    if (!form.product.trim())   e.product   = "Required";
    if (!form.audience.trim())  e.audience  = "Required";
    if (!form.budget.trim())    e.budget    = "Required";
    if (form.platforms.length === 0) e.platforms = "Select at least one";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const build = async () => {
    if (!validate()) return;
    setLoading(true); setResult(null);
    const prompt = `Build me a complete marketing campaign.

Product / service: ${form.product}
Target audience: ${form.audience}
Campaign goal: ${form.goal}
Total budget: $${form.budget}
Timeline: ${form.timeline}
Platforms: ${form.platforms.join(", ")}

Give me:
1. Campaign strategy and core message
2. Exact budget split across each platform I selected
3. Content plan: how many pieces per week, what formats, what themes
4. KPIs to track and what good looks like for my goal
5. Week-by-week rollout plan for the first month
6. What success looks like at the end of this campaign`;

    try {
      const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ messages:[{role:"user",content:prompt}], userType:"company", engineMode:"Narrative" }) });
      const ct = res.headers.get("Content-Type")||"";
      let full = "";
      setResult({ id:Date.now(), role:"assistant", content:full });
    } catch { setResult({ id:Date.now(), role:"assistant", content:"Something went wrong. Try again.\n\nChips: 'Try again' | 'Adjust budget' | 'Change goal'" }); }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#1a7a3c", fontFamily:"var(--font-body)" }}>
            🚀 Campaign Builder
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily:"var(--font-body)", color:"#1a1a1a" }}>Build your campaign</h1>
          <p className="text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
            Fill in the brief and get a complete campaign strategy with budget split.
          </p>
        </motion.div>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-2xl p-6 mb-6 space-y-5"
          style={{ background:"#ffffff", border:"1px solid #e8e8e3" }}>

          {[
            { key:"product",  label:"Product / Service name", ph:"e.g. Our new protein bar range" },
            { key:"audience", label:"Target audience",        ph:"e.g. Fitness-conscious millennials aged 25–35" },
          ].map(f=>(
            <div key={f.key}>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color:errors[f.key]?"#f87171":"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>{f.label}</label>
              <input type="text" placeholder={f.ph} value={form[f.key]} onChange={e=>set(f.key,e.target.value)}
                style={{ ...fieldStyle, borderColor:errors[f.key]?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)" }}
                onFocus={e=>e.target.style.borderColor="#1a7a3c"}
                onBlur={e=>e.target.style.borderColor=errors[f.key]?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}/>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color:"#1a7a3c", fontFamily:"var(--font-body)" }}>Campaign Goal</label>
              <select value={form.goal} onChange={e=>set("goal",e.target.value)} style={fieldStyle}>
                {GOALS.map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color:errors.budget?"#f87171":"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>Budget ($)</label>
              <input type="number" min={0} placeholder="e.g. 5000" value={form.budget} onChange={e=>set("budget",e.target.value)}
                style={{ ...fieldStyle, borderColor:errors.budget?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)" }}
                onFocus={e=>e.target.style.borderColor="#1a7a3c"}
                onBlur={e=>e.target.style.borderColor=errors.budget?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color:"#1a7a3c", fontFamily:"var(--font-body)" }}>Timeline</label>
            <div className="flex gap-2 flex-wrap">
              {TIMELINES.map(t=>(
                <button key={t} onClick={()=>set("timeline",t)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                  style={{ background:"#f5f5f0",
                    border:form.timeline===t?"1px solid rgba(45,214,104,0.5)":"1px solid rgba(45,214,104,0.15)",
                    color:"#666666", fontFamily:"var(--font-body)" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
              style={{ color:errors.platforms?"#f87171":"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>
              Platforms {errors.platforms && <span style={{color:"#f87171",textTransform:"none",fontSize:10,fontWeight:400}}> — {errors.platforms}</span>}
            </label>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map(p=>(
                <button key={p} onClick={()=>togglePlatform(p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={{ background:"#f5f5f0",
                    border:form.platforms.includes(p)?"1px solid rgba(45,214,104,0.5)":"1px solid rgba(45,214,104,0.15)",
                    color:"#666666", fontFamily:"var(--font-body)" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={build} disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm btn-green"
            style={{ color:"#050a06", fontFamily:"var(--font-body)", opacity:loading?0.7:1 }}>
            {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black/30 border-t-black/80 rounded-full animate-spin"/>Building campaign…</span> : "Build Campaign →"}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
              <ResponseCard message={result} animate={false} onChip={t=>{}} onRegenerate={build}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
