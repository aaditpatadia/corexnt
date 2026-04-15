import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ResponseCard from "../../components/ResponseCard";
import { generateResponsePDF } from "../../utils/generatePDF";
import { parseResponse, stripMarkdown } from "../../utils/parseResponse";

const INDUSTRIES = ["D2C / E-commerce","SaaS / Tech","Consumer Goods","Food & Beverage","Fashion & Lifestyle","Health & Wellness","Finance / Fintech","Education","Real Estate","Agency / Services","Other"];

const fieldStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#ffffff",
  borderRadius: 12,
  fontFamily: "'Instrument Sans', sans-serif",
  fontSize: 14,
  outline: "none",
  width: "100%",
  padding: "11px 14px",
};

export default function CompetitorIntel() {
  const [form, setForm] = useState({
    industry: INDUSTRIES[0],
    yourBrand: "",
    competitor: "",
    question: "",
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [errors,  setErrors]  = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.competitor.trim())  e.competitor  = "Required";
    if (!form.yourBrand.trim())   e.yourBrand   = "Required";
    if (!form.question.trim())    e.question    = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const analyse = async () => {
    if (!validate()) return;
    setLoading(true);
    setResult(null);

    const prompt = `Competitor intelligence report: ${form.yourBrand} vs ${form.competitor} in ${form.industry}.

Specific question: ${form.question}

Search for "${form.competitor} marketing strategy India 2025 2026" and "${form.competitor} Instagram ads campaign recent" before answering — use real, current intel, not training data.

Structure your response as follows:

Give a sharp intelligence headline, then answer the specific question with real data from web search.

Include an HTML comparison table in your response with these exact dimensions:
<table class="comp-table"><thead><tr><th>Dimension</th><th>${form.yourBrand}</th><th>${form.competitor}</th><th>Edge</th></tr></thead><tbody>
<tr><td>Content volume</td><td>[your brand estimate]</td><td>[competitor intel from search]</td><td>[who wins]</td></tr>
<tr><td>Engagement approach</td><td>[describe]</td><td>[describe]</td><td>[edge]</td></tr>
<tr><td>Pricing signals</td><td>[describe]</td><td>[describe]</td><td>[edge]</td></tr>
<tr><td>Audience overlap</td><td>[describe]</td><td>[describe]</td><td>[edge]</td></tr>
<tr><td>Weak point to exploit</td><td>[describe]</td><td>[describe from intel]</td><td>[edge]</td></tr>
</tbody></table>

Then give real Action Steps and a Real Example.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          userType: "company",
          engineMode: "Narrative",
          plan: localStorage.getItem("corex_plan") || "free",
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error ${res.status}`);
      }
      const d = await res.json();
      const full = d.reply || "No response generated. Please try again.";
      setResult({ id: Date.now(), role: "assistant", content: full, searchUsed: !!d.usedWebSearch });
    } catch (err) {
      const errMsg = err?.message?.includes("Rate limit")
        ? "Rate limit hit — wait a moment and try again."
        : "Could not fetch intel. Check your connection and try again.";
      setResult({ id: Date.now(), role: "assistant", content: `${errMsg}\n\nFOLLOWUPS: ["Try again", "Different competitor", "Help"]` });
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    if (!result) return;
    const { title, cleanBody, steps, example } = parseResponse(result.content);
    generateResponsePDF({
      title: title || `${form.yourBrand} vs ${form.competitor} — Competitor Intel`,
      body: stripMarkdown(cleanBody || ""),
      actionSteps: steps,
      realExample: example,
    });
  };

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background:"rgba(156,252,175,0.08)", border:"1px solid rgba(156,252,175,0.2)", color:"#9CFCAF", fontFamily:"'Instrument Sans', sans-serif" }}>
            🔍 Competitor Intel
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", color:"#ffffff" }}>Spy on your competitors</h1>
          <p className="text-sm" style={{ color:"rgba(255,255,255,0.45)", fontFamily:"'Instrument Sans', sans-serif" }}>
            Live intel pulled from the web — not just training data. Ask a specific question.
          </p>
        </motion.div>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-2xl p-6 mb-6 space-y-5"
          style={{ background:"#111111", border:"1px solid rgba(255,255,255,0.08)" }}>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color:"rgba(255,255,255,0.4)", fontFamily:"'Instrument Sans', sans-serif", letterSpacing:"2px" }}>Industry</label>
            <select value={form.industry} onChange={e => set("industry", e.target.value)}
              style={{ ...fieldStyle, appearance:"none" }}
              onFocus={e => e.target.style.borderColor="rgba(156,252,175,0.4)"}
              onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"}>
              {INDUSTRIES.map(i => <option key={i} style={{ background:"#111111", color:"#ffffff" }}>{i}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: errors.yourBrand ? "#f87171" : "rgba(255,255,255,0.4)", fontFamily:"'Instrument Sans', sans-serif", letterSpacing:"2px" }}>
                Your Brand *
              </label>
              <input type="text" placeholder="e.g. Minimalist" value={form.yourBrand}
                onChange={e => set("yourBrand", e.target.value)}
                style={{ ...fieldStyle, borderColor: errors.yourBrand ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)" }}
                onFocus={e => e.target.style.borderColor=errors.yourBrand?"rgba(248,113,113,0.7)":"rgba(156,252,175,0.4)"}
                onBlur={e => e.target.style.borderColor=errors.yourBrand?"rgba(248,113,113,0.5)":"rgba(255,255,255,0.1)"}/>
              {errors.yourBrand && <p style={{ fontSize:11, color:"#f87171", marginTop:4, fontFamily:"'Instrument Sans', sans-serif" }}>{errors.yourBrand}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: errors.competitor ? "#f87171" : "rgba(255,255,255,0.4)", fontFamily:"'Instrument Sans', sans-serif", letterSpacing:"2px" }}>
                Competitor *
              </label>
              <input type="text" placeholder="e.g. Plum" value={form.competitor}
                onChange={e => set("competitor", e.target.value)}
                style={{ ...fieldStyle, borderColor: errors.competitor ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)" }}
                onFocus={e => e.target.style.borderColor=errors.competitor?"rgba(248,113,113,0.7)":"rgba(156,252,175,0.4)"}
                onBlur={e => e.target.style.borderColor=errors.competitor?"rgba(248,113,113,0.5)":"rgba(255,255,255,0.1)"}/>
              {errors.competitor && <p style={{ fontSize:11, color:"#f87171", marginTop:4, fontFamily:"'Instrument Sans', sans-serif" }}>{errors.competitor}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
              style={{ color: errors.question ? "#f87171" : "rgba(255,255,255,0.4)", fontFamily:"'Instrument Sans', sans-serif", letterSpacing:"2px" }}>
              Specific Question *
            </label>
            <input type="text"
              placeholder="e.g. What is their content strategy? / How do they price? / What are their weak points?"
              value={form.question}
              onChange={e => set("question", e.target.value)}
              style={{ ...fieldStyle, borderColor: errors.question ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)" }}
              onFocus={e => e.target.style.borderColor=errors.question?"rgba(248,113,113,0.7)":"rgba(156,252,175,0.4)"}
              onBlur={e => e.target.style.borderColor=errors.question?"rgba(248,113,113,0.5)":"rgba(255,255,255,0.1)"}/>
            {errors.question && <p style={{ fontSize:11, color:"#f87171", marginTop:4, fontFamily:"'Instrument Sans', sans-serif" }}>{errors.question}</p>}
          </div>

          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={analyse} disabled={loading}
            style={{
              width:"100%", padding:"14px 0", borderRadius:100, border:"none", cursor:"pointer",
              fontFamily:"'Instrument Sans', sans-serif", fontSize:14, fontWeight:700,
              background: loading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
              color: loading ? "rgba(255,255,255,0.4)" : "#000000",
              opacity: loading ? 0.8 : 1, transition:"all 0.2s",
            }}>
            {loading
              ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"rgba(255,255,255,0.7)", animation:"spin 0.8s linear infinite" }}/>
                  Pulling live intel…
                </span>
              : "Run Competitor Analysis →"}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
              <ResponseCard message={result} animate={false} onChip={t => {}} onRegenerate={analyse}/>
              <motion.button
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
                onClick={downloadPDF}
                style={{
                  marginTop:12, padding:"10px 20px", borderRadius:100,
                  border:"1.5px solid rgba(156,252,175,0.3)", background:"rgba(156,252,175,0.05)",
                  color:"#9CFCAF", fontFamily:"'Instrument Sans', sans-serif",
                  fontSize:14, fontWeight:600, cursor:"pointer",
                  transition:"all 0.2s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(156,252,175,0.12)"; e.currentTarget.style.borderColor="rgba(156,252,175,0.6)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(156,252,175,0.05)"; e.currentTarget.style.borderColor="rgba(156,252,175,0.3)"; }}>
                Download as PDF
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
