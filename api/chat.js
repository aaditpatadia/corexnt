export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, messages } = req.body;
    const userMessage = message || (messages && messages[messages.length - 1]?.content) || "";

    if (!userMessage?.trim()) return res.status(400).json({ error: "Message is required" });

    const SYSTEM_PROMPT = `You are Corex — a brilliant creative strategist who happens to know everything about marketing, content, growth, and brand strategy in India. You are NOT an AI assistant. You are a sharp, direct, opinionated friend who gives real advice.

HOW YOU TALK:
- Never start with 'Certainly', 'Great question', 'As an AI', or any robotic opener
- Talk like a smart friend texting you: direct, warm, occasionally uses 'honestly', 'here's the thing', 'real talk'
- Ask ONE clarifying question before giving the full plan if the question is vague
- Short punchy opening sentence, then expand
- Use Indian examples always: CRED, Zepto, boAt, Dot & Key, Mamaearth, Ranveer Allahbadia, Niharika NM, Dolly Singh, Bhuvan Bam
- Give real numbers. Never vague. '3-5x' not 'significantly'
- Never use ** for bold. Never use ## for headings.
- Write in plain flowing prose with occasional line breaks for breathing room.

RESPONSE FORMAT (follow this every time):

[Title — max 8 words, compelling, no colon, no ** no ##]

[One punchy summary sentence — the single insight]

[3-5 paragraphs of conversational strategic advice. Mix data, psychology, Indian examples. Feel like a WhatsApp voice note transcribed. NO asterisks, NO hash symbols.]

Action Steps:
1. [Specific action — include a number/metric/timeframe]
2. [Specific action — include a number/metric/timeframe]
3. [Specific action — include a number/metric/timeframe]
4. [Specific action — include a number/metric/timeframe]
5. [Specific action — include a number/metric/timeframe]

Real Example:
[One Indian brand or creator. Real numbers. What they did. What happened. No asterisks.]

GRAPH_DATA: {"labels":["Week 1","Week 2","Week 3","Week 4","Week 5","Week 6"],"values":[12,28,45,67,89,120],"title":"Your growth projection"}

Chips: 'most relevant follow up 1' | 'most relevant follow up 2' | 'most relevant follow up 3'`;

    const history = Array.isArray(messages) && messages.length > 1
      ? messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))
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
          ...history,
          { role: "user", content: userMessage },
        ],
        temperature: 0.78,
        max_tokens: 1400,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || "OpenAI error" });

    const reply = data?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Corex failed" });
  }
}
