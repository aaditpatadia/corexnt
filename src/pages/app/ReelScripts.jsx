import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ResponseCard from "../../components/ResponseCard";

const NICHES    = ["Fitness","Finance","Comedy","Fashion","Food","Tech","Travel","Business","Lifestyle","Other"];
const TONES     = ["Energetic","Educational","Inspirational","Funny","Controversial"];
const PLATFORMS = ["Instagram Reels","YouTube Shorts","TikTok"];

const fieldStyle = {
  background:"rgba(20,40,24,0.6)",
  border:"1px solid rgba(45,214,104,0.18)",
  color:"#f0faf2",
  borderRadius:12,
  fontFamily:"var(--font-body)",
  fontSize:14,
  outline:"none",
  width:"100%",
  padding:"10px 14px",
};

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
        style={{ color:"rgba(45,214,104,0.7)", fontFamily:"var(--font-body)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ReelScripts() {
  const [form, setForm] = useState({
    niche:"Fitness", topic:"", audience:"", tone:"Energetic", platform:"Instagram Reels",
  });
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));

  const generate = async () => {
    if (!form.topic.trim()) { setError("Tell me the topic for your reel."); return; }
    setError(""); setLoading(true); setResult(null);

    const prompt = `Write a complete reel script for me.

Niche: ${form.niche}
Topic: ${form.topic}
Target audience: ${form.audience || "general audience"}
Tone: ${form.tone}
Platform: ${form.platform}

Structure your response like this:

Hook (first 3 seconds)
[Write the opening hook — pattern interrupt, bold statement, or question]

Full Timed Script
[Write the complete script with timestamps, e.g. 0:00-0:03, 0:03-0:08, etc. Include exactly what to say on camera]

B-Roll Suggestions
[List 3-5 specific b-roll shots to cut to]

Caption + Hashtags
[Write the full caption + 5-8 hashtags]

Best Posting Time
[Recommend the best day and time to post on ${form.platform} for maximum reach]

GRAPH_DATA: {"labels":["Hook","Script","B-roll","Caption","Timing"],"values":[95,88,72,65,78],"title":"Script Quality Score"}

Chips: 'Make the hook stronger' | 'Write a second version' | 'Add trending audio suggestions'`;

    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          messages:[{ role:"user", content:prompt }],
          userType:"creator",
          engineMode:"Creator",
        }),
      });
      const d = await res.json();
      setResult({ id:Date.now(), role:"assistant", content:d.reply||"", isNew:true });
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M10 9L15 12L10 15V9Z" fill="currentColor" stroke="none"/></svg>
            Reel Script Engine
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily:"var(--font-body)", color:"#f0faf2" }}>
            Generate a reel script
          </h1>
          <p className="text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
            Fill in the details and get a complete, timed script ready to shoot.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-2xl p-6 mb-6 space-y-5"
          style={{ background:"rgba(14,28,16,0.7)", border:"1px solid rgba(45,214,104,0.15)" }}>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Your Niche">
              <select value={form.niche} onChange={e=>set("niche",e.target.value)} style={fieldStyle}>
                {NICHES.map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Platform">
              <select value={form.platform} onChange={e=>set("platform",e.target.value)} style={fieldStyle}>
                {PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Topic for this reel">
            <input type="text" placeholder="e.g. 3 mistakes beginners make in the gym" value={form.topic}
              onChange={e=>set("topic",e.target.value)} style={fieldStyle}
              onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.5)"}
              onBlur={e=>e.target.style.borderColor="rgba(45,214,104,0.18)"}/>
          </Field>

          <Field label="Target Audience">
            <input type="text" placeholder="e.g. beginners aged 18-25 who go to the gym" value={form.audience}
              onChange={e=>set("audience",e.target.value)} style={fieldStyle}
              onFocus={e=>e.target.style.borderColor="rgba(45,214,104,0.5)"}
              onBlur={e=>e.target.style.borderColor="rgba(45,214,104,0.18)"}/>
          </Field>

          <Field label="Desired Tone">
            <div className="flex flex-wrap gap-2">
              {TONES.map(t=>(
                <button key={t} onClick={()=>set("tone",t)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                  style={{
                    background: form.tone===t ? "rgba(45,214,104,0.2)" : "rgba(20,40,24,0.6)",
                    border: form.tone===t ? "1px solid rgba(45,214,104,0.5)" : "1px solid rgba(45,214,104,0.15)",
                    color: form.tone===t ? "#2dd668" : "rgba(240,250,242,0.5)",
                    fontFamily:"var(--font-body)",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </Field>

          {error && (
            <p className="text-xs" style={{ color:"#f87171", fontFamily:"var(--font-body)" }}>{error}</p>
          )}

          <motion.button
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={generate}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm btn-green transition-all"
            style={{ color:"#050a06", fontFamily:"var(--font-body)", opacity: loading ? 0.7 : 1 }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black/80 rounded-full animate-spin"/>
                Writing your script…
              </span>
            ) : "Generate Script →"}
          </motion.button>
        </motion.div>

        {/* Loading dots */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="flex items-center gap-3 mb-4 px-1">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background:"rgba(45,214,104,0.15)", border:"1px solid rgba(45,214,104,0.3)", color:"#2dd668", fontFamily:"var(--font-body)" }}>CX</div>
              <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
                style={{ background:"rgba(14,28,16,0.8)", border:"1px solid rgba(45,214,104,0.15)" }}>
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
              <ResponseCard message={result} animate={true} onChip={t=>{}} onRegenerate={generate}/>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
