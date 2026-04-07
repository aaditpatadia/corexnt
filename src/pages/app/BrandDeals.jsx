import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ResponseCard from "../../components/ResponseCard";

const PLATFORMS = ["Instagram","YouTube","TikTok","LinkedIn"];
const NICHES    = ["Fitness","Finance","Comedy","Fashion","Food","Tech","Travel","Business","Lifestyle","Beauty","Gaming","Education"];

const TEMPLATES = [
  {
    emoji:"📧", title:"Brand Pitch Email",
    desc:"Cold outreach email that gets brand managers to actually respond.",
    prompt:"Write me a brand deal cold pitch email template I can personalise. Short, confident, leads with my value, clear CTA. Include a subject line that gets opened. Make it feel human, not templated.",
  },
  {
    emoji:"📋", title:"Media Kit Checklist",
    desc:"Everything you need in your media kit to land paid partnerships.",
    prompt:"Give me a complete media kit checklist for a content creator. What sections to include, what data to highlight, how to present it, and what makes brands say yes instantly.",
  },
  {
    emoji:"💰", title:"Rate Card Template",
    desc:"A professional rate card structure with explanations for each package.",
    prompt:"Help me build a rate card template. I need sections for: single reel, story swipe-up, integration in video, 30-day ambassador deal, and UGC-only (no posting). Include notes on what to customise per brand.",
  },
];

const fieldStyle = {
  background:"#ffffff", border:"1px solid #e8e8e3",
  color:"#1a1a1a", borderRadius:12, fontFamily:"var(--font-body)",
  fontSize:14, outline:"none", width:"100%", padding:"10px 14px",
};

export default function BrandDeals() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ platform:"Instagram", niche:"Lifestyle", followers:"", engagement:"", avgViews:"" });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [errors,  setErrors]  = useState({});

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const validate = () => {
    const e = {};
    if (!form.followers.trim())  e.followers  = "Required";
    if (!form.engagement.trim()) e.engagement = "Required";
    if (!form.avgViews.trim())   e.avgViews   = "Required";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const calculate = async () => {
    if (!validate()) return;
    setLoading(true); setResult(null);
    const prompt = `Calculate my exact brand deal rates as a ${form.niche} creator on ${form.platform}.

My stats:
- Followers: ${form.followers}
- Average views per post: ${form.avgViews}
- Engagement rate: ${form.engagement}%

Give me:
1. My rate for a dedicated reel/video (main promotion)
2. My rate for an integration (mention inside existing content)
3. My rate for a story swipe-up or link-in-bio placement
4. My rate for a 30-day ambassador deal
5. Comparison to industry benchmarks for my follower range

Also tell me: am I undercharging or overcharging based on my engagement vs follower count?`;

    try {
      const res  = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ messages:[{role:"user",content:prompt}], userType:"creator", engineMode:"Creator" }) });
      const contentType = res.headers.get("Content-Type")||"";
      let full = "";
      setResult({ id:Date.now(), role:"assistant", content:full });
    } catch { setResult({ id:Date.now(), role:"assistant", content:"Something went wrong. Try again.\n\nChips: 'Try again' | 'Help' | 'New calculation'" }); }
    setLoading(false);
  };

  const useTemplate = (t) => { sessionStorage.setItem("corex_prefill", t.prompt); navigate("/app/chat"); };

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
            🤝 Brand Deals
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily:"var(--font-body)", color:"#1a1a1a" }}>
            Calculate your rates
          </h1>
          <p className="text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
            Know exactly what to charge brands based on your real stats.
          </p>
        </motion.div>

        {/* Rate Calculator */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-2xl p-6 mb-6 space-y-4"
          style={{ background:"rgba(14,28,16,0.7)", border:"1px solid rgba(45,214,104,0.15)" }}>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color:"#1a7a3c", fontFamily:"var(--font-body)" }}>Platform</label>
              <select value={form.platform} onChange={e=>set("platform",e.target.value)} style={fieldStyle}>
                {PLATFORMS.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color:"#1a7a3c", fontFamily:"var(--font-body)" }}>Niche</label>
              <select value={form.niche} onChange={e=>set("niche",e.target.value)} style={fieldStyle}>
                {NICHES.map(n=><option key={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { key:"followers",  label:"Followers",         hint:errors.followers,  ph:"e.g. 48000" },
              { key:"avgViews",   label:"Avg views / post",  hint:errors.avgViews,   ph:"e.g. 12000" },
              { key:"engagement", label:"Engagement rate %", hint:errors.engagement, ph:"e.g. 4.2" },
            ].map(f=>(
              <div key={f.key}>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: f.hint ? "#f87171" : "rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>{f.label}</label>
                <input type="number" min={0} placeholder={f.ph} value={form[f.key]} onChange={e=>set(f.key,e.target.value)}
                  style={{ ...fieldStyle, borderColor: f.hint ? "rgba(248,113,113,0.5)" : "rgba(45,214,104,0.18)" }}
                  onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.5)"}
                  onBlur={e=>e.target.style.borderColor=f.hint?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}/>
              </div>
            ))}
          </div>

          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={calculate} disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm btn-green"
            style={{ color:"#050a06", fontFamily:"var(--font-body)", opacity:loading?0.7:1 }}>
            {loading
              ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black/30 border-t-black/80 rounded-full animate-spin"/>Calculating…</span>
              : "Calculate My Rates →"}
          </motion.button>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="mb-8">
              <ResponseCard message={result} animate={false} onChip={t=>{}} onRegenerate={calculate}/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Templates */}
        <h2 className="text-base font-bold mb-4" style={{ color:"#1a1a1a", fontFamily:"var(--font-body)" }}>Templates</h2>
        <div className="space-y-3">
          {TEMPLATES.map(t=>(
            <motion.div key={t.title} whileHover={{ x:4 }}
              className="flex items-center justify-between rounded-2xl px-5 py-4 transition-all"
              style={{ background:"rgba(14,28,16,0.6)", border:"1px solid rgba(45,214,104,0.12)" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(45,214,104,0.3)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(45,214,104,0.12)"}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{t.emoji}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color:"#1a1a1a", fontFamily:"var(--font-body)" }}>{t.title}</p>
                  <p className="text-xs" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>{t.desc}</p>
                </div>
              </div>
              <button onClick={()=>useTemplate(t)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
                Generate →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
