import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

    const prompt = `You are COREX, conducting a deep competitive intelligence report.

Analyze: ${form.competitor} vs ${form.yourBrand || 'our brand'}
Industry: ${form.industry}
Question: ${form.question}

Provide a COMPREHENSIVE competitive analysis. Structure your response EXACTLY as follows:

INTELLIGENCE REPORT: ${form.competitor}

EXECUTIVE SUMMARY:
[3 sentences. The single most important insight. What does ${form.yourBrand || 'you'} need to know RIGHT NOW?]

COMPETITOR STRENGTHS (What they're crushing):
[4 specific, real strengths with evidence. No generic statements.]

COMPETITOR WEAKNESSES (Where they're exposed):
[4 specific vulnerabilities. These are YOUR opportunities.]

YOUR COMPETITIVE ADVANTAGES:
[4 ways ${form.yourBrand || 'you'} can win against ${form.competitor}]

BATTLE PLAN:
[Exactly 3 moves to win market share from ${form.competitor} this quarter. Each with specific tactics, timeline, and expected outcome.]

POSITIONING STATEMENT:
[One sentence that positions ${form.yourBrand || 'you'} against ${form.competitor}. Bold. Memorable. True.]

MINDMAP_DATA: {
  "center": "vs ${form.competitor}",
  "branches": [
    {"title": "Their Strengths", "items": ["strength1", "strength2", "strength3"]},
    {"title": "Their Weaknesses", "items": ["weakness1", "weakness2", "weakness3"]},
    {"title": "Your Wins", "items": ["win1", "win2", "win3"]},
    {"title": "Battle Plan", "items": ["move1", "move2", "move3"]}
  ]
}

Action Steps:
1. [Specific immediate action against ${form.competitor}]
2. [Specific positioning move]
3. [Specific content/campaign tactic]

Use real data. Search the web for current information about ${form.competitor}. Name real campaigns, real numbers, real market data.`;

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

      // Build human-readable user message for history
      const userMessage = [
        `Competitor analysis: ${form.competitor || ''} vs ${form.yourBrand || ''}`,
        form.industry ? `Industry: ${form.industry}` : '',
        form.question ? `Question: ${form.question}` : '',
      ].filter(Boolean).join('\n');

      // Save to corex_history
      try {
        const history = JSON.parse(localStorage.getItem('corex_history') || '[]');
        const competitor = form.competitor || 'Competitor';
        const yourBrand = form.yourBrand || localStorage.getItem('corex_brand_name') || 'Your Brand';
        const historyItem = {
          id: Date.now(),
          title: `Intel: ${competitor} vs ${yourBrand}`,
          messages: [
            { role: 'user', content: userMessage },
            { role: 'assistant', content: full }
          ],
          ts: Date.now(),
          type: 'competitor-intel',
        };
        history.unshift(historyItem);
        // Keep max 50 items
        localStorage.setItem('corex_history', JSON.stringify(history.slice(0, 50)));
      } catch (e) {
        console.log('History save failed:', e);
      }
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

        <button
          onClick={() => navigate("/app/competitors")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            padding: "0 0 28px 0",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
        >
          ← Competitors
        </button>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background:"rgba(156,252,175,0.08)", border:"1px solid rgba(156,252,175,0.2)", color:"#9CFCAF", fontFamily:"'Instrument Sans', sans-serif", letterSpacing:"1px", textTransform:"uppercase" }}>
            ◎ Competitor Intel
          </div>
          <h1 className="mb-2" style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", color:"#ffffff", fontSize:36, fontWeight:700, lineHeight:1.2 }}>Know your competition.</h1>
          <p className="text-sm" style={{ color:"rgba(255,255,255,0.45)", fontFamily:"'Instrument Sans', sans-serif" }}>
            Real intelligence. Real strategy. Real advantage.
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
              <div style={{
                background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:16,
                padding:28,
                marginBottom:12,
              }}>
                <div style={{
                  fontSize:10, fontWeight:700, letterSpacing:"2px",
                  textTransform:"uppercase", color:"#9CFCAF",
                  fontFamily:"'Instrument Sans', sans-serif",
                  marginBottom:16,
                }}>
                  Intelligence Report
                </div>
                <ResponseCard message={result} animate={false} onChip={t => {}} onRegenerate={analyse}/>
              </div>
              <motion.button
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
                onClick={downloadPDF}
                style={{
                  marginTop:4, padding:"10px 20px", borderRadius:100,
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
