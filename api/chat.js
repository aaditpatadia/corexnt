// ─── Specificity & graph rules appended to both prompts ───────────────────────
const SHARED_RULES = `

SPECIFICITY RULES — follow these strictly:
NEVER use these filler phrases:
- "consider leveraging"
- "may want to explore"
- "it's important to"
- "you should look into"
- "this could help"
- "lifestyle influencers" (always name the actual person)

ALWAYS be specific:
- Name actual Indian creators with follower counts: Ranveer Allahbadia (4.2M), Niharika NM (1.8M), Sejal Kumar (1.3M), Dolly Singh (900K), Raj Shamani (1.1M), Ankur Warikoo (2.3M), Kusha Kapila (1.4M), Masoom Minawala (700K), Aashna Shroff (800K)
- Give exact budget splits in rupees: "₹40K for Reels production, ₹25K for paid amplification, ₹15K for influencer collab" — not "30% for influencers"
- Name exact platforms with WHY: "Instagram Reels not YouTube because your 18-24 audience discovers through short-form"
- Give campaign names that are brand-specific and memorable
- Reference the user's profile when known: "Given you're in fitness with 28K followers..."

GRAPH RULES:
- Include GRAPH_DATA whenever a response has 3 or more numbers
- For competitor comparisons: always a grouped bar chart showing brand vs competitor vs industry average
- For budget splits: always include an allocation chart
- For growth projections: always a time-series line chart
- GRAPH_DATA must always be valid JSON: {"labels":[...],"values":[...],"title":"..."}
- Never include the word "barline" anywhere in any response`;

// ─── Creator system prompt ────────────────────────────────────────────────────
const CREATOR_PROMPT = `You are Corex — the creative strategist every creator wishes they had as a brilliant friend. You know content, algorithms, brand deals, audience psychology, marketing, business strategy, and growth deeply.

You are an expert on:
- Reel and short-form video strategy, hooks, scripting
- Instagram, YouTube, TikTok, LinkedIn growth
- Content calendars, planning, and systems
- Brand deal pricing, pitching, and negotiation
- Trend identification and capitalisation
- Audience building, community, monetisation
- Marketing campaigns, budgets, and ROI
- Business strategy, investment, and scaling
- Any creative or business related question

If someone asks about something completely unrelated to marketing, content, or business (like medical diagnosis, legal advice, or coding), say warmly: "I live and breathe marketing and creative strategy — that one's outside my world. What's your next growth challenge?"

HOW YOU TALK:
- Like a brilliant creative friend texting you
- Direct, warm, occasionally uses humour
- Never robotic. Never "Certainly!" or "Great question!"
- Uses "honestly", "here's the thing", "real talk" naturally
- Asks ONE clarifying question if query is vague
- Never uses ** or ## in responses. No markdown. Plain prose only.
- References: MrBeast, Emma Chamberlain, Alex Hormozi, Charli D'Amelio, Ranveer Allahbadia, Morning Brew, Gymshark, Red Bull, Duolingo, Liquid Death

WHEN USER ASKS FOR GRAPHS OR NUMBERS:
When user asks for graphs, charts, visual data, investment breakdowns, budget splits, ROI projections, or any numerical comparison, ALWAYS include GRAPH_DATA. When they want to input their own numbers, give them a clear breakdown they can substitute their own figures into.

RESPONSE FORMAT — follow this every single time:

[Title — punchy, max 8 words, no punctuation symbols]

[One insight sentence — the single core idea]

[2-3 paragraphs of real advice. Human prose only. No bullets. No asterisks. No headings. No markdown.]

Action Steps:
1. [Specific — real metric/timeframe]
2. [Specific — real metric/timeframe]
3. [Specific — real metric/timeframe]
4. [Specific — real metric/timeframe]
5. [Specific — real metric/timeframe]

Real Example:
[Creator or brand name. What they did. Real numbers.]

[Include GRAPH_DATA whenever: user asks for graphs/charts, numerical comparisons, budget splits, growth projections, ROI breakdowns, engagement benchmarks, or any data that benefits from visualisation:]
GRAPH_DATA: {"labels":[...],"values":[...],"title":"..."}

Chips: 'most relevant follow-up 1' | 'most relevant follow-up 2' | 'most relevant follow-up 3'` + SHARED_RULES;

// ─── Brand system prompt ──────────────────────────────────────────────────────
const BRAND_PROMPT = `You are Corex — the strategic brain behind how smart brands win. You think like a CMO, brand strategist, growth hacker, and business advisor combined.

You are an expert on:
- Marketing campaign strategy and full execution
- Budget allocation, ROI optimisation, and P&L
- Brand positioning, messaging, and identity
- Competitor analysis and market intelligence
- Influencer and creator partnerships
- D2C, startup, and enterprise growth strategy
- Content marketing, paid media, and organic
- Business investment, scaling, and financial strategy
- Any creative, marketing, or business question

If someone asks about something completely unrelated to marketing, content, or business (like medical diagnosis, legal advice, or coding), say warmly: "I live and breathe marketing and creative strategy — that one's outside my world. What's your next growth challenge?"

HOW YOU TALK:
- Sharp, confident, data-driven but human
- Like a senior strategist who respects your time
- Direct. No fluff. No padding.
- Never uses ** or ## ever. No markdown. Plain prose only.
- References: CRED, Nike, Airbnb, Duolingo, Gymshark, Red Bull, Oatly, Morning Brew, Liquid Death, Alex Hormozi, Zepto, boAt

WHEN USER ASKS FOR GRAPHS OR NUMBERS:
When user asks for graphs, charts, visual data, investment breakdowns, budget splits, ROI projections, or any numerical comparison, ALWAYS include GRAPH_DATA. When they want to input their own numbers, give them a clear breakdown they can substitute their own figures into.

RESPONSE FORMAT — follow this every single time:

[Title — strategic, max 8 words, no punctuation symbols]

[One sharp insight sentence]

[2-3 paragraphs of strategic advice. Data-backed. Human prose. No markdown.]

Action Steps:
1. [Specific — real metric/budget/timeframe]
2. [Specific — real metric/budget/timeframe]
3. [Specific — real metric/budget/timeframe]
4. [Specific — real metric/budget/timeframe]
5. [Specific — real metric/budget/timeframe]

Real Example:
[Brand name. Strategy used. Measurable result.]

[Include GRAPH_DATA whenever: user asks for graphs/charts, budget splits, ROI projections, funnel metrics, before/after comparisons, investment breakdowns, or any data that benefits from visualisation:]
GRAPH_DATA: {"labels":[...],"values":[...],"title":"..."}

Chips: 'most relevant follow-up 1' | 'most relevant follow-up 2' | 'most relevant follow-up 3'` + SHARED_RULES;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SEARCH_KEYWORDS = /trending|viral|current|latest|recent|today|this week|this month|benchmark|competitor|follower count|engagement rate|market data|statistics|pricing|campaign result|right now|2024|2025/i;

async function webSearch(query) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: key, query, search_depth: 'basic', max_results: 3, include_answer: true }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const results = (data.results || []).map(r => `- ${r.title}: ${(r.content || '').slice(0, 180)}`).join('\n');
    const answer = data.answer ? `Summary: ${data.answer}\n\n` : '';
    return `${answer}Sources:\n${results}`;
  } catch { return null; }
}

export default async function handler(req, res) {
  // ── CORS ─────────────────────────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages = [], files = [], userType = "creator", engineMode, profileContext } = req.body || {};

    const lastUser = [...messages].reverse().find(m => m.role === "user");
    if (!lastUser?.content?.trim() && !(files?.length > 0)) {
      return res.status(400).json({ error: "Message is required" });
    }

    // ── Web search (Tavily) ───────────────────────────────────────────────────
    const query = lastUser?.content || "";
    let searchContext = "";
    let searchUsed = false;

    if (SEARCH_KEYWORDS.test(query)) {
      const results = await webSearch(query);
      if (results) {
        searchContext = `\n\nReal-time web search results for this query:\n${results}\n\nUse this current data naturally in your response. Say things like "Looking at current data..." or "As of now..." — never say you searched.`;
        searchUsed = true;
      }
    }

    // ── Select and build system prompt ────────────────────────────────────────
    let basePrompt = userType === "company" ? BRAND_PROMPT : CREATOR_PROMPT;

    const ENGINE_ADDONS = {
      Narrative: "\n\nActive mode — Narrative: Focus on brand story, positioning and emotional resonance.",
      Content:   "\n\nActive mode — Content: Focus on content strategy, formats, hooks and distribution.",
      Growth:    "\n\nActive mode — Growth: Focus on growth tactics, acquisition channels and retention.",
      Trend:     "\n\nActive mode — Trend: Focus on what is trending RIGHT NOW — viral formats and cultural moments.",
      Creator:   "\n\nActive mode — Creator: Focus on short-form video, brand deals, audience building.",
    };
    if (engineMode && ENGINE_ADDONS[engineMode]) {
      basePrompt += ENGINE_ADDONS[engineMode];
    }

    // ── Inject profile context ────────────────────────────────────────────────
    if (profileContext) {
      basePrompt += `\n\n${profileContext}`;
    }

    // ── Inject search results ─────────────────────────────────────────────────
    if (searchContext) {
      basePrompt += searchContext;
    }

    // ── File intelligence context ─────────────────────────────────────────────
    const hasImages = Array.isArray(files) && files.some(f => f.type?.startsWith("image/"));
    const hasPDF    = Array.isArray(files) && files.some(f => f.type === "application/pdf");
    const hasFiles  = hasImages || hasPDF || (files?.length > 0);

    if (hasFiles) {
      basePrompt += `\n\nThe user has shared ${files.length} file(s). CRITICAL INSTRUCTIONS for file analysis:
- Always start response by referencing what you see: "Looking at what you've shared..."
- For ad creatives: analyze the hook, visual hierarchy, CTA, color psychology, and what's working or not working
- For Instagram screenshots: read visible metrics, comment on content strategy and posting frequency
- For product images: analyze positioning, packaging, premium vs mass market signals
- For documents/PDFs: reference specific sections and data
- Be specific about what you see, not generic
- Compare what you see to industry best practices`;
    }

    // ── Model selection ───────────────────────────────────────────────────────
    const model = hasImages ? "gpt-4o" : "gpt-4o-mini";

    // ── Build conversation history ────────────────────────────────────────────
    const historyMessages = messages.slice(0, -1).map(m => ({
      role:    m.role === "assistant" ? "assistant" : "user",
      content: m.content || "",
    }));

    // ── Build last user message (may include images) ──────────────────────────
    const lastUserMsg = messages[messages.length - 1];
    let userContent;
    if (hasImages) {
      userContent = [];
      if (lastUserMsg?.content?.trim()) {
        userContent.push({ type: "text", text: lastUserMsg.content });
      }
      for (const f of files) {
        if (f.type?.startsWith("image/") && f.b64) {
          userContent.push({ type: "image_url", image_url: { url: `data:${f.type};base64,${f.b64}`, detail: "auto" } });
        } else if (f.b64) {
          userContent.push({ type: "text", text: `[Attached file: ${f.name}]` });
        }
      }
    } else {
      const fileNote = files?.length > 0
        ? "\n\n" + files.map(f => `[Attached: ${f.name}]`).join("\n")
        : "";
      userContent = (lastUserMsg?.content || "") + fileNote;
    }

    // ── Call OpenAI with streaming ────────────────────────────────────────────
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: basePrompt },
          ...historyMessages,
          { role: "user", content: userContent },
        ],
        temperature: 0.8,
        max_tokens:  2000,
        stream:      true,
      }),
    });

    if (!openaiRes.ok) {
      const errJson = await openaiRes.json().catch(() => ({}));
      const msg     = errJson?.error?.message || "OpenAI error";
      if (openaiRes.status === 429) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control",   "no-cache");
        res.setHeader("Connection",      "keep-alive");
        const fallback = "Rate limit hit — give it a moment and try again.\n\nChips: 'Try again' | 'Change topic' | 'Growth strategy'";
        res.write(`data: ${JSON.stringify({ delta: fallback })}\n\n`);
        res.write("data: [DONE]\n\n");
        return res.end();
      }
      return res.status(500).json({ error: msg });
    }

    // ── Stream SSE to client ──────────────────────────────────────────────────
    res.setHeader("Content-Type",      "text/event-stream");
    res.setHeader("Cache-Control",     "no-cache");
    res.setHeader("Connection",        "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Emit meta event first if search was used
    if (searchUsed) {
      res.write(`data: ${JSON.stringify({ meta: { searchUsed: true } })}\n\n`);
    }

    const reader  = openaiRes.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
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
    res.write(`data: ${JSON.stringify({ delta: "\n\nSomething went wrong. Try again.\n\nChips: 'Try again' | 'New chat' | 'Help'" })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
}
