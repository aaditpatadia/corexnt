export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  try {
    const { niche = "Indian creator economy and D2C brands" } = req.body || {};

    const prompt = `You are a real-time news curator for creative professionals in India. Search the web RIGHT NOW and return exactly 5 COMPLETELY DIFFERENT recent news items (from the past 48 hours if possible, maximum 7 days) relevant to: ${niche}.

CRITICAL RULES:
- Each headline must be about a DIFFERENT topic/brand/event — no repeating the same story
- Include a mix of: platform updates, brand campaigns, creator deals, market trends, industry data
- Every item must have real facts, numbers, or brand names — NO generic statements
- If searching for creator economy, include: Instagram, YouTube, LinkedIn, WhatsApp, TikTok angles
- Prioritize breaking news, funding rounds, algorithm changes, viral campaigns

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "headline": "Short punchy headline under 12 words with actual brand/platform name",
    "summary": "One sentence with the key fact, number, or outcome",
    "source": "Publication or platform name",
    "category": "one of: Trends | Platform | Brand | Creator | Market",
    "timeAgo": "e.g. 3 hours ago or 2 days ago"
  }
]

Make sure ALL 5 items are on different topics. Do not repeat the same brand or platform more than once.`;

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model:       "gpt-4o-mini",
        instructions: "You are a precise JSON generator. Return only valid JSON arrays, no markdown, no explanation.",
        tools:       [{ type: "web_search_preview", search_context_size: "low" }],
        tool_choice: "required",
        input:       [{ role: "user", content: prompt }],
        max_output_tokens: 800,
      }),
    });

    if (!openaiRes.ok) {
      return res.status(500).json({ error: "Failed to fetch news" });
    }

    const data = await openaiRes.json();
    const rawText = (data.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => Array.isArray(item.content) ? item.content : [])
      .filter(c => c.type === "output_text")
      .map(c => c.text)
      .join("");

    // Parse the JSON array from the response
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Invalid news response format" });
    }

    const news = JSON.parse(jsonMatch[0]);
    // Deduplicate by headline similarity
    const uniqueNews = news.filter((item, idx, arr) =>
      arr.findIndex(n => n.headline.slice(0, 20) === item.headline.slice(0, 20)) === idx
    ).slice(0, 5);
    return res.status(200).json({ news: uniqueNews });

  } catch (err) {
    console.error("COREX News API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
