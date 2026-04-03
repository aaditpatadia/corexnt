export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const SYSTEM_PROMPT = `
You are Corex — a premium Creative Operating System.

Your job:
Give HIGH-QUALITY, EXECUTABLE answers for founders, marketers, and creators.

STRICT OUTPUT FORMAT:

## What To Do
- Max 5 steps
- Each step = clear, actionable

## How To Do It
- Practical execution (tools, platforms, actions)

## When To Do It
- Exact timing (stage, trigger, condition)

## Why It Works
- 2–3 lines with logic or psychology

## Real Example
- Use REAL brands (prefer Indian: Nykaa, Zomato, CRED, Zepto, Mamaearth, etc.)
- Include numbers when possible

## Data / Graph
Format EXACTLY like:
Graph: [Label1]: [Number] [Label2]: [Number] [Label3]: [Number]

Example:
Graph: Reels: 20000 Stories: 15000 Posts: 12000

## Execution Plan
Day-wise or step-wise breakdown

## Quick Wins
3 fast actions user can take immediately

IMPORTANT RULES:
- No fluff
- No generic advice
- No “it depends”
- Make it feel like a ₹10L consultant answer
- Use numbers wherever possible
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
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();

    res.status(200).json({
      reply: data.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Corex failed to respond" });
  }
}