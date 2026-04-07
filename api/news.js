export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  try {
    const { niche = "Indian creator economy and D2C brands" } = req.body || {};

    const prompt = `You are a marketing news curator for Indian creators and brands. Search the web and return exactly 5 recent news items (from the past 7 days) relevant to: ${niche}.

Return ONLY a JSON array in this exact format — no other text:
[
  {
    "headline": "Short punchy headline under 10 words",
    "summary": "One sentence summary with the key fact or number",
    "source": "Publication name",
    "category": "one of: Trends | Platform | Brand | Creator | Market",
    "timeAgo": "e.g. 2 hours ago or 1 day ago"
  }
]

Focus on: Instagram/YouTube algorithm changes, Indian D2C brand funding or campaigns, creator deals, social media trends in India, marketing spend shifts. Be specific — include actual brand names, numbers, and facts.`;

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
    return res.status(200).json({ news });

  } catch (err) {
    console.error("COREX News API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
