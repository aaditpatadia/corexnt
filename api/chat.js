export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🔥 COREX SYSTEM PROMPT (PREMIUM QUALITY)
    const SYSTEM_PROMPT = `
You are Corex — a premium Creative Operating System.

Your job:
Give HIGH-QUALITY, EXECUTABLE answers for founders, marketers, and creators.

STRICT FORMAT:

## What To Do
- Max 5 steps
- Each step must be actionable

## How To Do It
- Tools, platforms, exact execution

## When To Do It
- Timing, triggers, stage

## Why It Works
- Psychology / logic (2–3 lines)

## Real Example
- Use real brands (prefer Indian: Nykaa, Zomato, CRED, Zepto, Mamaearth)
- Include numbers

## Data / Graph
Format EXACTLY like:
Graph: [Label1]: [Number] [Label2]: [Number] [Label3]: [Number]

## Execution Plan
- Step-by-step or day-wise

## Quick Wins
- 3 fast actions

RULES:
- No fluff
- No generic advice
- No "it depends"
- Make it feel like ₹10L consultant answer
`;

    // 🔥 OPENAI CALL
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

    // 🔥 HANDLE API FAILURE
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Error:", errorText);

      return res.status(500).json({
        error: "AI failed to respond",
        details: errorText,
      });
    }

    const data = await response.json();

    // 🔥 SAFE PARSING
    const reply =
      data?.choices?.[0]?.message?.content ||
      "No response generated. Try again.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      error: "Corex crashed",
      details: error.message,
    });
  }
}