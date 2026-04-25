export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  try {
    const prompt = `You are a live creative intelligence news curator. Search the web RIGHT NOW for the 5 most recent, most impactful news stories in the global creative industry from the past 24-72 hours.

SEARCH ACROSS: advertising, branding, content creation, social media platforms, AI in design/video/marketing, creator economy, viral campaigns, influencer deals, streaming, music industry, fashion/design, film/TV production, D2C brands.

STRICT RULES — follow every one:
1. Every item must be from a DIFFERENT brand/platform/topic — no repeating
2. LATEST first: sort by recency, breaking news first
3. Every headline must contain a real proper noun (brand, person, platform, campaign name)
4. Every summary must contain at least one specific fact, number, or outcome
5. Source must be a real publication you actually found the story on
6. timeAgo must be accurate to when the story actually broke
7. NO placeholder, made-up, or recycled stories — only real news you find via search
8. Prioritize GLOBAL significance: include at least 1 story from US/Europe and 1 from India

Return ONLY a valid JSON array — no markdown fences, no explanation, nothing else:
[
  {
    "headline": "Punchy headline under 12 words with real brand/person name",
    "summary": "One sentence: the key fact, number, or outcome from the actual story",
    "source": "Real publication name where you found this",
    "category": "one of: Trends | Platform | Brand | Creator | Market | AI | Design",
    "timeAgo": "e.g. 2 hours ago / 1 day ago / 3 days ago"
  }
]`;

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model:       "gpt-4o",
        instructions: "You are a precise JSON generator with live web search. Return ONLY a valid JSON array, no markdown fences, no extra text.",
        tools:       [{ type: "web_search_preview", search_context_size: "high" }],
        tool_choice: "required",
        input:       [{ role: "user", content: prompt }],
        max_output_tokens: 1000,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text().catch(() => "");
      console.error("OpenAI news error:", openaiRes.status, errText);
      return res.status(500).json({ error: "Failed to fetch news" });
    }

    const data = await openaiRes.json();
    const rawText = (data.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => Array.isArray(item.content) ? item.content : [])
      .filter(c => c.type === "output_text")
      .map(c => c.text)
      .join("");

    // Strip markdown fences if model wraps it anyway
    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON array in news response:", rawText.slice(0, 300));
      return res.status(500).json({ error: "Invalid news response format" });
    }

    const news = JSON.parse(jsonMatch[0]);

    // Deduplicate by headline similarity (first 25 chars)
    const seen = new Set();
    const uniqueNews = news.filter((item) => {
      const key = (item.headline || "").slice(0, 25).toLowerCase().replace(/\s+/g, "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 5);

    return res.status(200).json({ news: uniqueNews });

  } catch (err) {
    console.error("COREX News API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
