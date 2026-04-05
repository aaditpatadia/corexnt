import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const TEMPLATES = [
  {
    id:1, emoji:"🎬", category:"Creator",
    title:"Viral Reel Hook Formula",
    description:"A plug-and-play hook structure that stops the scroll in the first 2 seconds.",
    prompt:"Write me 5 viral reel hook formulas for my niche. Give me the pattern, an example, and explain why each hook works psychologically.",
  },
  {
    id:2, emoji:"📈", category:"Growth",
    title:"30-Day Content Calendar",
    description:"A month of content ideas planned around trends, formats, and consistency.",
    prompt:"Build me a 30-day content calendar. Include the format (reel, carousel, story), topic, hook idea, and best posting day for each piece. Make it strategic, not random.",
  },
  {
    id:3, emoji:"💰", category:"Monetization",
    title:"Brand Deal Pitch Email",
    description:"A cold outreach email that gets brand managers to actually respond.",
    prompt:"Write me a brand deal pitch email template I can customize. It should be short, confident, lead with my value, and have a clear CTA. Include a subject line that gets opened.",
  },
  {
    id:4, emoji:"🔍", category:"Strategy",
    title:"Niche Authority Positioning",
    description:"Find your unique angle and own a corner of your niche completely.",
    prompt:"Help me find my unique positioning in my niche. Ask me the right questions to figure out my POV, what makes me different, and how to communicate that in my bio and content.",
  },
  {
    id:5, emoji:"🚀", category:"Growth",
    title:"Follower Growth Sprint",
    description:"A 2-week aggressive growth plan using collaboration and trending content.",
    prompt:"Design a 2-week follower growth sprint for me. Include daily actions, collab strategies, hashtag approach, posting frequency, and how to maximize the algorithm right now.",
  },
  {
    id:6, emoji:"🎯", category:"Creator",
    title:"Audience Research Deep Dive",
    description:"Understand exactly what your audience wants before you create.",
    prompt:"Help me do a deep audience research session. What are the top pain points, desires, objections, and content gaps for my target audience? Give me actual angles I can turn into content.",
  },
  {
    id:7, emoji:"✍️", category:"Creator",
    title:"Caption Framework Pack",
    description:"5 caption frameworks that drive engagement and get people to comment.",
    prompt:"Give me 5 caption frameworks that consistently drive comments and saves. For each one, explain the psychology, show me the structure, and give me a filled-in example.",
  },
  {
    id:8, emoji:"📊", category:"Strategy",
    title:"Content Performance Audit",
    description:"Figure out what's working, what's dead, and what to double down on.",
    prompt:"Help me audit my content performance. Walk me through how to identify my top-performing content patterns, what metrics to focus on, and how to use that data to plan my next 30 days.",
  },
  {
    id:9, emoji:"🤝", category:"Monetization",
    title:"Sponsorship Rate Card",
    description:"Calculate exactly what to charge brands based on your metrics and niche.",
    prompt:"Help me build my sponsorship rate card. Based on typical creator metrics, what should I charge for a dedicated reel, an integration, a story swipe-up, and a bundle deal? Give me a real pricing framework.",
  },
  {
    id:10, emoji:"🔥", category:"Growth",
    title:"Trend Hijacking Playbook",
    description:"Ride trending moments without looking desperate or off-brand.",
    prompt:"Teach me how to hijack trending topics and formats for my niche without losing my brand voice. Give me a framework for evaluating which trends to jump on and how to put my spin on them.",
  },
  {
    id:11, emoji:"💡", category:"Strategy",
    title:"Content Pillar Blueprint",
    description:"Build 4–5 core content pillars that give your channel a clear identity.",
    prompt:"Help me define my 4-5 content pillars. For each pillar, I need the theme, the goal, example formats, and how often to post it. My content should feel cohesive, not random.",
  },
  {
    id:12, emoji:"📱", category:"Creator",
    title:"Bio Optimization Sprint",
    description:"Rewrite your Instagram or YouTube bio to convert profile visitors into followers.",
    prompt:"Rewrite my social media bio to maximize follows. Give me 3 versions — one punchy and direct, one that leads with social proof, and one that's curiosity-driven. Explain why each works.",
  },
];

const CATEGORY_COLORS = {
  Creator:      { bg:"rgba(168,85,247,0.1)",  border:"rgba(168,85,247,0.25)",  text:"#c084fc" },
  Growth:       { bg:"rgba(45,214,104,0.08)", border:"rgba(45,214,104,0.2)",   text:"#2dd668" },
  Monetization: { bg:"rgba(251,191,36,0.08)", border:"rgba(251,191,36,0.2)",   text:"#fbbf24" },
  Strategy:     { bg:"rgba(56,189,248,0.08)", border:"rgba(56,189,248,0.2)",   text:"#38bdf8" },
};

export default function Templates() {
  const navigate = useNavigate();

  const useTemplate = (template) => {
    sessionStorage.setItem("corex_prefill", template.prompt);
    navigate("/app/chat");
  };

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background:"rgba(45,214,104,0.08)", border:"1px solid rgba(45,214,104,0.2)", color:"#2dd668", fontFamily:"var(--font-body)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>
            Templates
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily:"var(--font-body)", color:"#f0faf2" }}>
            Ready-to-use prompts
          </h1>
          <p className="text-sm" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
            Click any template to instantly start a conversation. Expertly crafted for creators.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATES.map((t, i) => {
            const cat = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.Strategy;
            return (
              <motion.button
                key={t.id}
                initial={{ opacity:0, y:16 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.04, ease:[0.16,1,0.3,1] }}
                whileHover={{ y:-3, scale:1.01 }}
                whileTap={{ scale:0.98 }}
                onClick={() => useTemplate(t)}
                className="text-left rounded-2xl p-5 transition-all duration-200 group"
                style={{
                  background:"rgba(14,28,16,0.7)",
                  border:"1px solid rgba(45,214,104,0.13)",
                  cursor:"pointer",
                }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(45,214,104,0.35)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(45,214,104,0.13)"}
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background:"rgba(45,214,104,0.07)", border:"1px solid rgba(45,214,104,0.15)" }}>
                    {t.emoji}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background:cat.bg, border:`1px solid ${cat.border}`, color:cat.text, fontFamily:"var(--font-body)" }}>
                    {t.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold mb-1.5 leading-snug" style={{ color:"#f0faf2", fontFamily:"var(--font-body)" }}>
                  {t.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-body)" }}>
                  {t.description}
                </p>

                {/* Use button */}
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold transition-all duration-200"
                  style={{ color:"rgba(45,214,104,0.5)" }}
                  ref={el => {
                    if (el) {
                      el.parentElement.addEventListener("mouseenter", () => el.style.color="#2dd668");
                      el.parentElement.addEventListener("mouseleave", () => el.style.color="rgba(45,214,104,0.5)");
                    }
                  }}>
                  Use template
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
