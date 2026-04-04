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

    const SYSTEM_PROMPT = "You are Corex, a premium Creative Operating System for founders, brands, and creators. Give HIGH-QUALITY, EXECUTABLE answers.";

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
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.st
    atus(500).json({ error: data.error?.message || "OpenAI failed" });
    const reply = data?.choices?.[0]?.message?.content || "No response generated";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Corex failed to respond" });
  }
}
