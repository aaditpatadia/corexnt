import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ResponseCard from "../../components/ResponseCard";

const PLATFORMS  = ["Instagram","YouTube","TikTok","LinkedIn","X (Twitter)"];
const POST_TIMES = ["Morning (6–9am)","Mid-morning (9–11am)","Lunchtime (12–2pm)","Afternoon (3–5pm)","Evening (6–9pm)","Late night (9pm+)"];

const fieldStyle = {
  background:"#ffffff",
  border:"1px solid #e8e8e3",
  color:"#1a1a1a",
  borderRadius:12,
  fontFamily:"var(--font-body)",
  fontSize:14,
  outline:"none",
  width:"100%",
  padding:"10px 14px",
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-semibold uppercase tracking-widest"
          style={{ color:"#1a7a3c", fontFamily:"var(--font-body)" }}>{label}</span>
        {hint && <span className="text-xs" style={{ color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export default function GrowthAudit() {
  const [form, setForm] = useState({
    platform:"Instagram", followers:"", avgViews:"", engagement:"",
    postsPerWeek:"", postTime:"Evening (6–9pm)", challenge:"",
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [errors,  setErrors]  = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));

  const validate = () => {
    const e = {};
    if (!form.followers.trim())    e.followers    = "Required";
    if (!form.avgViews.trim())     e.avgViews     = "Required";
    if (!form.engagement.trim())   e.engagement   = "Required";
    if (!form.postsPerWeek.trim()) e.postsPerWeek = "Required";
    if (!form.challenge.trim())    e.challenge    = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const runAudit = async () => {
    if (!validate()) return;
    setLoading(true); setResult(null);

    const prompt = `Run a full growth audit for my ${form.platform} account.

My current stats:
- Followers: ${form.followers}
- Average views per post: ${form.avgViews}
- Engagement rate: ${form.engagement}%
- Posts per week: ${form.postsPerWeek}
- Usual posting time: ${form.postTime}
- Biggest challenge: ${form.challenge}

Give me:
1. A diagnosis of what's holding me back (be honest and specific)
2. My engagement rate benchmark vs what I should be hitting
3. The 3 biggest levers I can pull RIGHT NOW to grow
4. A 30-day action plan with specific weekly targets
5. What content format I should double down on

Use real numbers and benchmarks. Compare my stats to what's actually working in my niche.`;

    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          messages:[{ role:"user", content:prompt }],
          userType:"creator",
          engineMode:"Growth",
        }),
      });
      const d = await res.json();
      setResult({ id:Date.now(), role:"assistant", content:d.reply||"", isNew:true });
    } catch {
      setResult({ id:Date.now(), role:"assistant", content:"Something went wrong. Check your connection and try again.\n\nChips: 'Try again' | 'New audit' | 'Help'", isNew:false });
    }
    setLoading(false);
  };

  const inp = (key) => ({
    type:"number", min:0, value:form[key],
    onChange:e=>set(key,e.target.value),
    style:{ ...fieldStyle, borderColor: errors[key] ? "rgba(248,113,113,0.5)" : "rgba(45,214,104,0.18)" },
    onFocus:e=>e.target.style.borderColor="#1a7a3c",
    onBlur:e=>e.target.style.borderColor=errors[key]?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)",
  });

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#1a7a3c", fontFamily:"var(--font-body)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 18L8 11L13 14L18 7L21 10"/><path d="M21 6V10H17"/></svg>
            Growth Audit
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily:"var(--font-body)", color:"#1a1a1a" }}>
            Audit your growth
          </h1>
          <p className="text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
            Paste your current stats and get a brutally honest growth diagnosis.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-2xl p-6 mb-6 space-y-5"
          style={{ background:"#ffffff", border:"1px solid #e8e8e3" }}>

          {/* Platform selector */}
          <Field label="Platform">
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p=>(
                <button key={p} onClick={()=>set("platform",p)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                  style={{
                    background:"#f5f5f0",
                    border: form.platform===p ? "1px solid rgba(45,214,104,0.5)" : "1px solid rgba(45,214,104,0.15)",
                    color:"#666666",
                    fontFamily:"var(--font-body)",
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </Field>

          {/* Metrics row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Followers" hint={errors.followers && <span style={{color:"#f87171"}}>{errors.followers}</span>}>
              <input placeholder="e.g. 12400" {...inp("followers")}/>
            </Field>
            <Field label="Avg views / post" hint={errors.avgViews && <span style={{color:"#f87171"}}>{errors.avgViews}</span>}>
              <input placeholder="e.g. 3200" {...inp("avgViews")}/>
            </Field>
            <Field label="Engagement rate %" hint={errors.engagement && <span style={{color:"#f87171"}}>{errors.engagement}</span>}>
              <input placeholder="e.g. 4.2" {...inp("engagement")}/>
            </Field>
            <Field label="Posts per week" hint={errors.postsPerWeek && <span style={{color:"#f87171"}}>{errors.postsPerWeek}</span>}>
              <input placeholder="e.g. 4" {...inp("postsPerWeek")}/>
            </Field>
          </div>

          <Field label="Usual posting time">
            <select value={form.postTime} onChange={e=>set("postTime",e.target.value)} style={fieldStyle}>
              {POST_TIMES.map(t=><option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Biggest challenge" hint={errors.challenge && <span style={{color:"#f87171"}}>{errors.challenge}</span>}>
            <textarea
              placeholder="e.g. My reach is declining and I don't know why. I post consistently but my engagement is dropping."
              value={form.challenge}
              onChange={e=>set("challenge",e.target.value)}
              rows={3}
              style={{ ...fieldStyle, resize:"none", lineHeight:1.6,
                borderColor:errors.challenge?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)" }}
              onFocus={e=>e.target.style.borderColor="#1a7a3c"}
              onBlur={e=>e.target.style.borderColor=errors.challenge?"rgba(248,113,113,0.5)":"rgba(45,214,104,0.18)"}
            />
          </Field>

          <motion.button
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={runAudit}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm btn-green"
            style={{ color:"#050a06", fontFamily:"var(--font-body)", opacity: loading ? 0.7 : 1 }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black/80 rounded-full animate-spin"/>
                Running your audit…
              </span>
            ) : "Run My Audit →"}
          </motion.button>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background:"rgba(45,214,104,0.15)", border:"1px solid rgba(45,214,104,0.3)", color:"#1a7a3c", fontFamily:"var(--font-body)" }}>CX</div>
              <div className="px-4 py-3 rounded-2xl flex items-center gap-2"
                style={{ background:"rgba(14,28,16,0.8)", border:"1px solid #e8e8e3" }}>
                {[0,1,2].map(i=>(
                  <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background:"#2dd668" }}
                    animate={{ y:[0,-6,0], opacity:[0.4,1,0.4] }}
                    transition={{ duration:0.85, delay:i*0.17, repeat:Infinity, ease:"easeInOut" }}/>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
              <ResponseCard message={result} animate={true} onChip={t=>{}} onRegenerate={runAudit}/>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
