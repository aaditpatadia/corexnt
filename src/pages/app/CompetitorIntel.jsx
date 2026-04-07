import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ResponseCard from "../../components/ResponseCard";

const INDUSTRIES = ["D2C / E-commerce","SaaS / Tech","Consumer Goods","Food & Beverage","Fashion & Lifestyle","Health & Wellness","Finance / Fintech","Education","Real Estate","Agency / Services","Other"];

const fieldStyle = {
  background:"#ffffff", border:"1px solid #e8e8e3",
  color:"#1a1a1a", borderRadius:12, fontFamily:"var(--font-body)",
  fontSize:14, outline:"none", width:"100%", padding:"10px 14px",
};

export default function CompetitorIntel() {
  const [form, setForm] = useState({ industry:INDUSTRIES[0], comp1:"", comp2:"", yourBrand:"" });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [errors,  setErrors]  = useState({});

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const validate = () => {
    const e = {};
    if (!form.comp1.trim()) e.comp1 = "Required";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const analyse = async () => {
    if (!validate()) return;
    setLoading(true); setResult(null);
    const prompt = `Do a deep competitor analysis for a ${form.industry} brand.
${form.yourBrand ? `My brand: ${form.yourBrand}` : ""}
Competitor 1: ${form.comp1}${form.comp2 ? `\nCompetitor 2: ${form.comp2}` : ""}

Analyse the following:
1. Their positioning and core message — what story are they telling?
2. Their content strategy — what platforms, formats, and posting frequency?
3. Their audience and what the audience loves about them
4. Their biggest weaknesses and blind spots
5. Gaps in the market they're NOT serving
6. 3 specific things I can do differently to steal market share from them

Be specific. Use real details. If you know anything about these brands, use it.`;

    try {
      const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ messages:[{role:"user",content:prompt}], userType:"company", engineMode:"Narrative" }) });
      const d = await res.json();
      const full = d.reply || "Something went wrong. Try again.";
      setResult({ id:Date.now(), role:"assistant", content:full });
    } catch { setResult({ id:Date.now(), role:"assistant", content:"Something went wrong. Try again.\n\nChips: 'Try again' | 'Different competitor' | 'Help'" }); }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
            🔍 Competitor Intel
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily:"var(--font-body)", color:"#1a1a1a" }}>Spy on your competitors</h1>
          <p className="text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
            Get a deep breakdown of what your competitors are doing and how to beat them.
          </p>
        </motion.div>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-2xl p-6 mb-6 space-y-5"
          style={{ background:"rgba(14,28,16,0.7)", border:"1px solid rgba(45,214,104,0.15)" }}>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color:"#1a7a3c", fontFamily:"var(--font-body)" }}>Industry</label>
            <select value={form.industry} onChange={e=>set("industry",e.target.value)} style={fieldStyle}>
              {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color:"#1a7a3c", fontFamily:"var(--font-body)" }}>
              Your brand name <span style={{ color:"rgba(240,250,242,0.3)", fontWeight:400, textTransform:"none", fontSize:10 }}>(optional)</span>
            </label>
            <input type="text" placeholder="e.g. My Brand Co." value={form.yourBrand} onChange={e=>set("yourBrand",e.target.value)}
              style={fieldStyle}
              onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.5)"}
              onBlur={e=>e.target.style.borderColor="rgba(45,214,104,0.18)"}/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color:errors.comp1?"#f87171":"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>Competitor 1</label>
              <input type="text" placeholder="e.g. Gymshark" value={form.comp1} onChange={e=>set("comp1",e.target.value)}
                style={{ ...fieldStyle, borderColor:errors.comp1?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)" }}
                onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.5)"}
                onBlur={e=>e.target.style.borderColor=errors.comp1?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}/>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color:"#1a7a3c", fontFamily:"var(--font-body)" }}>
                Competitor 2 <span style={{ color:"rgba(240,250,242,0.3)", fontWeight:400, textTransform:"none", fontSize:10 }}>(optional)</span>
              </label>
              <input type="text" placeholder="e.g. Lululemon" value={form.comp2} onChange={e=>set("comp2",e.target.value)}
                style={fieldStyle}
                onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.5)"}
                onBlur={e=>e.target.style.borderColor="rgba(45,214,104,0.18)"}/>
            </div>
          </div>

          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={analyse} disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm btn-green"
            style={{ color:"#050a06", fontFamily:"var(--font-body)", opacity:loading?0.7:1 }}>
            {loading
              ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black/30 border-t-black/80 rounded-full animate-spin"/>Analysing…</span>
              : "Analyse Competitors →"}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
              <ResponseCard message={result} animate={false} onChip={t=>{}} onRegenerate={analyse}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
