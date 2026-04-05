import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ResponseCard from "../../components/ResponseCard";

const STAGES = ["Early stage (pre-revenue)", "Growth (scaling)", "Scale (profitable)"];
const GOALS  = ["Brand Awareness", "Customer Acquisition", "Retention & Loyalty", "Product Launch", "Market Expansion"];

function Slider({ value, onChange, min, max, step, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative">
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        className="w-full appearance-none h-2 rounded-full outline-none"
        style={{
          background:`linear-gradient(90deg,#2dd668 ${pct}%,rgba(45,214,104,0.15) ${pct}%)`,
          WebkitAppearance:"none",
        }}/>
      <div className="mt-2 text-right text-sm font-bold" style={{ color:"#2dd668", fontFamily:"var(--font-body)" }}>
        {format(value)}
      </div>
    </div>
  );
}

export default function BudgetAllocator() {
  const [budget,  setBudget]  = useState(5000);
  const [stage,   setStage]   = useState(STAGES[1]);
  const [goal,    setGoal]    = useState(GOALS[1]);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const allocate = async () => {
    setLoading(true); setResult(null);
    const prompt = `Allocate a monthly marketing budget of $${budget.toLocaleString()} for a ${stage} business.

Primary goal: ${goal}

Give me:
1. Exact percentage and dollar split across channels (paid social, organic content, influencer, SEO/content, email, events/other)
2. For each channel: what to spend it on specifically, not just the channel name
3. Which channel to prioritise first and why
4. What to cut if I need to reduce the budget by 30%
5. What metric to watch for each channel to know it's working
6. When to reallocate if a channel isn't performing`;

    try {
      const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ messages:[{role:"user",content:prompt}], userType:"company", engineMode:"Growth" }) });
      const ct=res.headers.get("Content-Type")||""; let full="";
      if(ct.includes("text/event-stream")){
        const reader=res.body.getReader();const dec=new TextDecoder();let buf="";
        while(true){const{done,value}=await reader.read();if(done)break;buf+=dec.decode(value,{stream:true});
          const lines=buf.split("\n");buf=lines.pop()??"";
          for(const l of lines){if(!l.startsWith("data: "))continue;const raw=l.slice(6).trim();
            if(raw==="[DONE]")break;try{const p=JSON.parse(raw);if(p.delta)full+=p.delta;}catch{}}}
      } else { const d=await res.json(); full=d.reply||""; }
      setResult({ id:Date.now(), role:"assistant", content:full });
    } catch { setResult({ id:Date.now(), role:"assistant", content:"Something went wrong. Try again.\n\nChips: 'Try again' | 'Adjust budget' | 'Change goal'" }); }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
            💼 Budget Allocator
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily:"var(--font-body)", color:"#f0faf2" }}>
            Allocate your budget
          </h1>
          <p className="text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
            Get an AI-optimised budget split across every marketing channel.
          </p>
        </motion.div>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-2xl p-6 mb-6 space-y-6"
          style={{ background:"rgba(14,28,16,0.7)", border:"1px solid rgba(45,214,104,0.15)" }}>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color:"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>
              Monthly Marketing Budget
            </label>
            <Slider value={budget} onChange={setBudget} min={500} max={100000} step={500}
              format={v => `$${v.toLocaleString()}`}/>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>Business Stage</label>
            <div className="space-y-2">
              {STAGES.map(s=>(
                <button key={s} onClick={()=>setStage(s)}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all"
                  style={{ background:stage===s?"rgba(45,214,104,0.12)":"rgba(20,40,24,0.4)",
                    border:stage===s?"1px solid rgba(45,214,104,0.4)":"1px solid rgba(45,214,104,0.1)",
                    color:stage===s?"#f0faf2":"rgba(240,250,242,0.5)", fontFamily:"var(--font-body)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>Primary Goal</label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map(g=>(
                <button key={g} onClick={()=>setGoal(g)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{ background:goal===g?"rgba(45,214,104,0.2)":"rgba(20,40,24,0.6)",
                    border:goal===g?"1px solid rgba(45,214,104,0.5)":"1px solid rgba(45,214,104,0.15)",
                    color:goal===g?"#2dd668":"rgba(240,250,242,0.5)", fontFamily:"var(--font-body)" }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={allocate} disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm btn-green"
            style={{ color:"#050a06", fontFamily:"var(--font-body)", opacity:loading?0.7:1 }}>
            {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black/30 border-t-black/80 rounded-full animate-spin"/>Allocating…</span> : "Allocate Budget →"}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
              <ResponseCard message={result} animate={false} onChip={t=>{}} onRegenerate={allocate}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
