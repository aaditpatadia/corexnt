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

Give structured, high-quality, actionable answers.

FORMAT:

## What To Do
## How To Do It
## When To Do It
## Why It Works
## Real Example
## Data / Graph
Graph: Label1: Number Label2: Number Label3: Number
## Execution Plan
## Quick Wins

No fluff. No generic answers.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();

    console.log("OPENAI RESPONSE:", data);

    const reply =
      data?.choices?.[0]?.message?.content ||
      "No response generated";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      error: "Corex failed",
      details: error.message,
    });
  }
}