export default async function handler(req, res) {
  // ── CORS ──────────────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error:"Method not allowed" });

  try {
    const { messages = [], files = [], userType = "creator", engineMode } = req.body || {};

    const lastUser = [...messages].reverse().find(m => m.role === "user");
    if (!lastUser?.content?.trim() && (!files || files.length === 0)) {
      return res.status(400).json({ error:"Message is required" });
    }

    // ── System prompt ─────────────────────────────────────────────
    const ENGINE_ADDONS = {
      Narrative: "Focus on brand story, positioning, messaging, emotional resonance.",
      Content:   "Focus on content strategy, formats, hooks, distribution, and platforms.",
      Growth:    "Focus on growth tactics, acquisition channels, retention metrics, and compounding loops.",
      Trend:     "Focus on what is trending RIGHT NOW — viral formats, cultural moments, emerging formats.",
      Creator:   "Focus on creator-specific advice: short-form video, brand deals, audience building, monetisation.",
    };
    const engineLine = engineMode && ENGINE_ADDONS[engineMode]
      ? `\n\nActive engine: ${engineMode}. ${ENGINE_ADDONS[engineMode]}`
      : "";

    const userContext = userType === "company"
      ? "The user is a brand or company — speak to marketing strategy, campaigns, budgets, brand building, and team execution."
      : "The user is a content creator — speak to audience growth, content formats, monetisation, and platform strategy.";

    const SYSTEM_PROMPT = `You are COREX — a world-class creative strategist. You know everything about marketing, content creation, growth, brand strategy, and digital media globally.${engineLine}

${userContext}

HOW YOU COMMUNICATE:
- Never open with "Certainly", "Great question", "As an AI", or any robotic filler phrase
- Sound like a brilliant, direct friend who gives real advice — warm but opinionated
- Use phrases like "here's the thing", "honestly", "real talk" sparingly and naturally
- Give real numbers. Always specific. "3–5x" not "significantly". "post at 7pm" not "evening"
- Use global examples: MrBeast, Duolingo, Gymshark, Alex Hormozi, Notion, Morning Brew, Glossier, Lenny Rachitsky, Sahil Bloom, Jacksepticeye, Emma Chamberlain, Hims&Hers
- Never use ** for bold. Never use ## for headings. No markdown formatting at all.
- No bullet points starting with "-" or "•". Use numbered lists only when listing steps.
- Write in flowing conversational prose. Like a voice note transcribed.

RESPONSE FORMAT — follow this structure every single time:

[Title — max 8 words, compelling, no punctuation symbols, no ** no ##]

[One punchy sentence — the single core insight]

[3–5 paragraphs of conversational strategic advice. Mix data, psychology, global examples. Feels like a smart friend talking to you. Absolutely zero asterisks, zero hash symbols.]

Action Steps:
1. [Specific action with a number, metric, or timeframe]
2. [Specific action with a number, metric, or timeframe]
3. [Specific action with a number, metric, or timeframe]
4. [Specific action with a number, metric, or timeframe]
5. [Specific action with a number, metric, or timeframe]

Real Example:
[One real global creator or brand. Specific numbers. What they did. What happened. Zero asterisks.]

GRAPH_DATA: {"labels":["Week 1","Week 2","Week 3","Week 4","Week 5","Week 6"],"values":[12,28,45,67,89,120],"title":"Your growth projection"}

Chips: 'most relevant follow-up 1' | 'most relevant follow-up 2' | 'most relevant follow-up 3'`;

    // ── Decide model and build message content ────────────────────
    const hasImages = files && files.length > 0 &&
      files.some(f => f.type && f.type.startsWith("image/"));

    const model = hasImages ? "gpt-4o" : "gpt-4o-mini";

    // Build history (everything except last user message)
    const historyMessages = messages.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content || "",
    }));

    // Build last user message content
    let userContent;
    if (hasImages) {
      userContent = [];
      if (lastUser.content?.trim()) {
        userContent.push({ type:"text", text:lastUser.content });
      }
      for (const f of files) {
        if (f.type && f.type.startsWith("image/") && f.b64) {
          userContent.push({
            type:"image_url",
            image_url:{
              url: `data:${f.type};base64,${f.b64}`,
              detail:"auto",
            },
          });
        } else if (f.b64) {
          // Non-image file — append as text description
          userContent.push({ type:"text", text:`[Attached file: ${f.name}]` });
        }
      }
    } else {
      // Non-image files — describe them in the text
      const fileNote = files && files.length > 0
        ? "\n\n" + files.map(f => `[Attached: ${f.name}]`).join("\n")
        : "";
      userContent = (lastUser.content || "") + fileNote;
    }

    // ── Call OpenAI ───────────────────────────────────────────────
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body:JSON.stringify({
        model,
        messages:[
          { role:"system", content:SYSTEM_PROMPT },
          ...historyMessages,
          { role:"user", content:userContent },
        ],
        temperature: 0.78,
        max_tokens:  1600,
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      const msg = json?.error?.message || "OpenAI error";
      if (response.status === 429) {
        return res.status(429).json({ error:msg, reply:"Rate limit hit. Give it a few seconds and try again.\n\nChips: 'Try again' | 'Change topic' | 'Growth strategy'" });
      }
      return res.status(500).json({ error:msg });
    }

    const reply = json?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("COREX API error:", err);
    return res.status(500).json({ error:err.message || "Internal server error" });
  }
}
