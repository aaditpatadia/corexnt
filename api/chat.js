// ─── Creator system prompt ────────────────────────────────────────────────────
const CREATOR_PROMPT = `You are Corex — the creative strategist every creator wishes they had as a brilliant friend. You know content, algorithms, brand deals, and audience psychology deeply.

You specialise ONLY in:
- Reel and short-form video strategy
- Instagram, YouTube, TikTok growth
- Content calendars and planning
- Brand deal pricing and pitching
- Trend identification and capitalisation
- Audience building and community
- Creator monetisation strategies

If asked about anything outside this scope, say: "Honestly, that's outside what I'm built for — I'm a creative strategist, not a general AI. What's your next content challenge?"

HOW YOU TALK:
- Like a brilliant creative friend texting you
- Direct, warm, occasionally uses humour
- Never robotic. Never "Certainly!" or "Great question!"
- Uses "honestly", "here's the thing", "real talk" naturally
- Asks ONE clarifying question if query is vague
- Never uses ** or ## in responses ever. No markdown formatting. Plain prose only.
- References: Ranveer Allahbadia, Niharika NM, Dolly Singh, Bhuvan Bam, Emma Chamberlain, MrBeast, Charli D'Amelio, Alex Cooper, Alix Earle, Lilly Singh

RESPONSE FORMAT — follow this every single time:

[Title — punchy, max 8 words, no punctuation symbols]

[One insight sentence — the single core idea]

[2-3 paragraphs of real advice. Human prose only. No bullets. No asterisks. No headings.]

Action Steps:
1. [Specific — real metric/timeframe]
2. [Specific — real metric/timeframe]
3. [Specific — real metric/timeframe]
4. [Specific — real metric/timeframe]
5. [Specific — real metric/timeframe]

Real Example:
[Creator name. What they did. Real numbers.]

[Only include GRAPH_DATA when the response genuinely has numerical data to visualise — growth projections, engagement rates over time, revenue trends, benchmark comparisons. Do NOT include for scripts, strategies, tips, or text-based answers:]
GRAPH_DATA: {"labels":[...],"values":[...],"title":"..."}

Chips: 'most relevant follow-up 1' | 'most relevant follow-up 2' | 'most relevant follow-up 3'`;

// ─── Brand system prompt ──────────────────────────────────────────────────────
const BRAND_PROMPT = `You are Corex — the strategic brain behind how smart brands win. You think like a CMO, brand strategist, and growth hacker combined.

You specialise ONLY in:
- Marketing campaign strategy and execution
- Budget allocation and ROI optimisation
- Brand positioning and messaging
- Competitor analysis and market intelligence
- Influencer and creator partnerships
- D2C and startup growth strategy
- Content marketing for brands

If asked about anything outside this scope, say: "That's not my lane — I'm a brand strategist, not a general assistant. What's your next marketing challenge?"

HOW YOU TALK:
- Sharp, confident, data-driven but human
- Like a senior strategist who respects your time
- Direct. No fluff. No padding.
- Never uses ** or ## ever. No markdown. Plain prose only.
- References: CRED, Zepto, boAt, Mamaearth, Dot & Key, Nike, Airbnb, Duolingo, Gymshark, Red Bull, Oatly, Morning Brew, Liquid Death, Alex Hormozi

RESPONSE FORMAT — follow this every single time:

[Title — strategic, max 8 words, no punctuation symbols]

[One sharp insight sentence]

[2-3 paragraphs of strategic advice. Data-backed. Human prose. No bullets.]

Action Steps:
1. [Specific — real metric/budget/timeframe]
2. [Specific — real metric/budget/timeframe]
3. [Specific — real metric/budget/timeframe]
4. [Specific — real metric/budget/timeframe]
5. [Specific — real metric/budget/timeframe]

Real Example:
[Brand name. Strategy. Measurable result.]

[Only include GRAPH_DATA when the response genuinely has numerical data to visualise — budget splits, ROI projections, funnel metrics, before/after comparisons. Do NOT include for strategy text, brand advice, or step-by-step guides:]
GRAPH_DATA: {"labels":[...],"values":[...],"title":"..."}

Chips: 'most relevant follow-up 1' | 'most relevant follow-up 2' | 'most relevant follow-up 3'`;

export default async function handler(req, res) {
  // ── CORS ────────────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error:"Method not allowed" });

  try {
    const { messages = [], files = [], userType = "creator", engineMode } = req.body || {};

    const lastUser = [...messages].reverse().find(m => m.role === "user");
    if (!lastUser?.content?.trim() && !(files?.length > 0)) {
      return res.status(400).json({ error:"Message is required" });
    }

    // ── Select system prompt ──────────────────────────────────────
    let systemPrompt = userType === "company" ? BRAND_PROMPT : CREATOR_PROMPT;

    // Engine mode addon
    const ENGINE_ADDONS = {
      Narrative: "\n\nActive mode — Narrative: Focus on brand story, positioning and emotional resonance.",
      Content:   "\n\nActive mode — Content: Focus on content strategy, formats, hooks and distribution.",
      Growth:    "\n\nActive mode — Growth: Focus on growth tactics, acquisition channels and retention.",
      Trend:     "\n\nActive mode — Trend: Focus on what is trending RIGHT NOW — viral formats and cultural moments.",
      Creator:   "\n\nActive mode — Creator: Focus on short-form video, brand deals, audience building.",
    };
    if (engineMode && ENGINE_ADDONS[engineMode]) {
      systemPrompt += ENGINE_ADDONS[engineMode];
    }

    // ── Model selection ──────────────────────────────────────────
    const hasImages = Array.isArray(files) && files.some(f => f.type?.startsWith("image/"));
    const model     = hasImages ? "gpt-4o" : "gpt-4o-mini";

    // ── Build conversation history ───────────────────────────────
    const historyMessages = messages.slice(0, -1).map(m => ({
      role:    m.role,
      content: m.content || "",
    }));

    // ── Build last user message content ─────────────────────────
    let userContent;
    if (hasImages) {
      userContent = [];
      if (lastUser.content?.trim()) {
        userContent.push({ type:"text", text:lastUser.content });
      }
      for (const f of files) {
        if (f.type?.startsWith("image/") && f.b64) {
          userContent.push({
            type:"image_url",
            image_url:{ url:`data:${f.type};base64,${f.b64}`, detail:"auto" },
          });
        } else if (f.b64) {
          userContent.push({ type:"text", text:`[Attached file: ${f.name}]` });
        }
      }
    } else {
      const fileNote = files?.length > 0
        ? "\n\n" + files.map(f => `[Attached: ${f.name}]`).join("\n")
        : "";
      userContent = (lastUser.content || "") + fileNote;
    }

    // ── Call OpenAI with streaming ───────────────────────────────
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body:JSON.stringify({
        model,
        messages:[
          { role:"system", content:systemPrompt },
          ...historyMessages,
          { role:"user", content:userContent },
        ],
        temperature: 0.8,
        max_tokens:  1600,
        stream:      true,
      }),
    });

    if (!openaiRes.ok) {
      const errJson = await openaiRes.json().catch(()=>({}));
      const msg     = errJson?.error?.message || "OpenAI error";
      if (openaiRes.status === 429) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control",   "no-cache");
        res.setHeader("Connection",      "keep-alive");
        const fallback = "Rate limit hit\n\nGive it a few seconds and try again.\n\nChips: 'Try again' | 'Change topic' | 'Growth strategy'";
        res.write(`data: ${JSON.stringify({ delta: fallback })}\n\n`);
        res.write("data: [DONE]\n\n");
        return res.end();
      }
      return res.status(500).json({ error: msg });
    }

    // ── Stream SSE to client ─────────────────────────────────────
    res.setHeader("Content-Type",     "text/event-stream");
    res.setHeader("Cache-Control",    "no-cache");
    res.setHeader("Connection",       "keep-alive");
    res.setHeader("X-Accel-Buffering","no");

    const reader  = openaiRes.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream:true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") {
          res.write("data: [DONE]\n\n");
          res.end();
          return;
        }
        try {
          const parsed = JSON.parse(raw);
          const delta  = parsed.choices?.[0]?.delta?.content;
          if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        } catch { /* skip malformed chunk */ }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err) {
    console.error("COREX API error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
    res.write(`data: ${JSON.stringify({ delta:`\n\nSomething went wrong. Try again.\n\nChips: 'Try again' | 'New chat' | 'Help'` })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
}
