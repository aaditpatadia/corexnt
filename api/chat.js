export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const SYSTEM_PROMPT = `
You are Corex — a premium Creative Operating System.

Give HIGH-QUALITY, EXECUTABLE answers.

FORMAT:

## What To Do
(max 5 steps)

## How To Do It

## When To Do It

## Why It Works

## Real Example

## Data / Graph
Graph: Label1: Number Label2: Number

Chips: "action 1" | "action 2" | "action 3"
`;

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

    if (!response.ok) {
      console.error("❌ OpenAI Error:", data);
      return res.status(500).json({ error: "OpenAI API failed" });
    }

    const reply = data.choices?.[0]?.message?.content || "No response";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("🔥 FULL ERROR:", err);
    return res.status(500).json({ error: "Corex failed to respond" });
  }
}