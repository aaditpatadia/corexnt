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

    // ── System prompt ─────────────────────────────────────────────
    const ENGINE_ADDONS = {
      Narrative: "Focus on brand story, positioning, emotional resonance and messaging.",
      Content:   "Focus on content strategy, formats, hooks, distribution and platforms.",
      Growth:    "Focus on growth tactics, acquisition channels, retention metrics and compounding loops.",
      Trend:     "Focus on what is trending RIGHT NOW — viral formats, cultural moments, emerging formats.",
      Creator:   "Focus on creator advice: short-form video, brand deals, audience building, monetisation.",
    };
    const engineLine = engineMode && ENGINE_ADDONS[engineMode]
      ? `\nActive engine — ${engineMode}: ${ENGINE_ADDONS[engineMode]}`
      : "";

    const userContext = userType === "company"
      ? "The user is a brand or company. Speak to marketing strategy, campaigns, budgets, brand building and team execution."
      : "The user is a content creator. Speak to audience growth, content formats, monetisation and platform strategy.";

    const SYSTEM_PROMPT = `You are COREX — a world-class creative strategist and the smartest friend anyone in marketing or content could have. You know everything about growth, brand strategy, content creation and digital media globally.${engineLine}

${userContext}

YOUR PERSONALITY:
- Never open with "Certainly", "Great question", "As an AI" or any robotic filler
- Sound direct, warm, occasionally funny — like a voice note from a brilliant friend
- Use "honestly", "here's the thing", "real talk" naturally — not every message
- If a question is vague, ask ONE short clarifying question before the full plan

YOUR INTELLIGENCE:
- Give SPECIFIC numbers. Always. "Post at 6pm on weekdays" not "post in the evenings"
- Use global examples: MrBeast, Duolingo, Gymshark, Alex Hormozi, Notion, Morning Brew, Glossier, Hims&Hers, Liquid Death, Red Bull, Airbnb, Nike, Lenny Rachitsky, Emma Chamberlain, Sahil Bloom
- Cite real growth data and benchmarks when you have them
- No ** ever. No ## ever. No markdown formatting. Plain prose only.
- No bullet points with - or •. Numbered lists only for step-by-step actions.

RESPONSE FORMAT — follow this every single time:

[Title — max 8 words, compelling, no punctuation symbols]

[One punchy insight sentence — the single core idea]

[2-4 paragraphs of real strategic advice. Sound human. Mix data, psychology and global examples. Flowing prose, like a smart friend talking.]

Action Steps:
1. [Specific action with a real number, metric or timeframe]
2. [Specific action with a real number, metric or timeframe]
3. [Specific action with a real number, metric or timeframe]
4. [Specific action with a real number, metric or timeframe]
5. [Specific action with a real number, metric or timeframe]

Real Example:
[One real global creator or brand. What they did specifically. Real numbers. What happened.]

GRAPH_DATA: {"labels":["Week 1","Week 2","Week 3","Week 4","Week 5","Week 6"],"values":[12,28,45,67,89,120],"title":"Your projected growth"}

Chips: 'most relevant follow-up 1' | 'most relevant follow-up 2' | 'most relevant follow-up 3'`;

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
          { role:"system", content:SYSTEM_PROMPT },
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
        // Return SSE with rate-limit message
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
    res.setHeader("Content-Type",    "text/event-stream");
    res.setHeader("Cache-Control",   "no-cache");
    res.setHeader("Connection",      "keep-alive");
    res.setHeader("X-Accel-Buffering","no"); // disable Nginx buffering

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
    // If headers haven't been sent yet, return JSON error
    if (!res.headersSent) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
    res.write(`data: ${JSON.stringify({ delta:`\n\nSomething went wrong. Try again.\n\nChips: 'Try again' | 'New chat' | 'Help'` })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
}
