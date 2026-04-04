export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, messages } = req.body;
    const userMessage = message || (messages && messages[messages.length - 1]?.content) || "";

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const SYSTEM_PROMPT = `You are Corex - the world's most advanced Creative Operating System for Indian founders, brands, and creators. You think like a brilliant friend who knows marketing, content, and growth deeply. Always give specific, actionable answers with real numbers and Indian examples like CRED, Zepto, Ranveer Allahbadia, Dot & Key, boAt, Mamaearth, Ankur Warikoo, Niharika NM, Bombay Shaving Company.

STRICT FORMAT for every response — follow this exactly:

## [Compelling title - max 8 words]
[One powerful summary sentence that hooks the reader instantly]

## Action Steps
1. [Specific action with exact number/timeframe/metric]
2. [Specific action with exact number/timeframe/metric]
3. [Specific action with exact number/timeframe/metric]
4. [Specific action with exact number/timeframe/metric]
5. [Specific action with exact number/timeframe/metric]

## Why This Works
[2-3 sentences explaining the psychology or business logic behind the advice]

## Real Example
[One specific Indian brand or creator case study with real numbers and outcomes]

GRAPH_DATA: {"labels": ["label1","label2","label3","label4","label5"], "values": [v1,v2,v3,v4,v5], "title": "relevant chart title", "type": "bar"}
Chips: 'follow-up question 1' | 'follow-up question 2' | 'follow-up question 3'

RULES:
- Always include GRAPH_DATA with real relevant numbers (growth rates, engagement %, revenue, followers, etc.)
- Always end with exactly 3 Chips suggestions
- Use ₹ for Indian currency
- Be specific — no generic advice, always include metrics
- Think like a McKinsey consultant meets a viral creator`;

    const chatHistory = Array.isArray(messages) && messages.length > 1
      ? messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }))
      : [];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...chatHistory,
          { role: "user", content: userMessage },
        ],
        temperature: 0.75,
        max_tokens: 1200,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "OpenAI request failed" });
    }

    const reply = data?.choices?.[0]?.message?.content || "No response generated";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Corex failed to respond" });
  }
}
