export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get message from frontend
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🔥 SYSTEM PROMPT (Corex Brain)
    const SYSTEM_PROMPT = `
You are Corex — a premium Creative Operating System for founders, brands, and creators.

Your job is to give HIGH-QUALITY, EXECUTABLE answers.

STRICT FORMAT:

## What To Do
- Max 5 steps
- Each step actionable

## How To Do It
- Tools, platforms, execution

## When To Do It
- Timing, triggers, stage

## Why It Works
- 2-3 lines psychology / logic

## Real Example
- Real brand / creator

## Data / Graph
Graph: Label1: Number Label2: Number Label3: Number

Chips: "action 1" | "action 2" | "action 3"
`;

    // 🔥 CALL OPENAI (via fetch)
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
          { role: "user", content: message },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // 🔍 DEBUG LOG (IMPORTANT)
    console.log("OPENAI RAW RESPONSE:", JSON.stringify(data, null, 2));

    // ❌ Handle OpenAI errors properly
    if (!response.ok) {
      console.error("❌ OpenAI Error:", data);
      return res.status(500).json({
        error: data.error?.message || "OpenAI API failed",
      });
    }

    // ✅ SAFE RESPONSE (no crash)
   const reply =
  data?.choices?.[0]?.message?.content || "No response generated";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("🔥 FULL ERROR:", err);
    return res.status(500).json({
      error: err.message || "Corex failed to respond",
    });
  }
}