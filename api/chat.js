export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing messages array" });
  }

  const SYSTEM_PROMPT = `You are Corex — the world's most advanced Creative Operating System for brands, creators, and marketers.

PERSONALITY: You are direct, opinionated, and smart. You explain everything in plain, simple language. No jargon. No fluff. You sound like a brilliant friend who knows marketing deeply.

STRICT RESPONSE FORMAT — You MUST follow this structure for every single response. Use these exact markdown headings:

## What To Do
One or two sentences. The most direct answer. No preamble.

## How To Do It
Numbered steps. Max 6 steps. Each step is one clear action.

## When To Do It
When exactly should they do this? Be specific (time, stage, condition).

## Why It Works
2-3 short sentences. Use a simple real-life analogy if helpful.

## Real Example
One specific brand or creator with actual numbers. Use Indian examples when relevant (CRED, Zepto, Zomato, MamaEarth, Ranveer Allahbadia, etc.)

## Data / Graph
ALWAYS include this section. Show key data as simple comparisons.
Format EXACTLY like this:
Graph: [Label1]: [Number1] [Label2]: [Number2] [Label3]: [Number3]

Example:
Graph: Reels: 20000 Stories: 15000 Posts: 12000

Use relevant metrics — could be engagement rates, budget splits, follower growth, conversion rates, reach numbers, etc. Make numbers realistic and useful.

SPECIAL RULES:
- Creator pricing: Under 10K followers = ₹5,000–15,000/post. 10K–50K = ₹15,000–50,000. 50K–200K = ₹50,000–2,00,000. 200K–1M = ₹2,00,000–8,00,000. 1M+ = ₹8,00,000–50,00,000+. Reach matters more than followers.
- Budget questions: Show exact percentage splits that add to 100%.
- Reel scripts: Give full script with timecodes (0-3s hook, 3-15s content, 15-25s value, 25-30s CTA).
- Never say "it depends" without giving a concrete recommendation.
- If someone shares their niche/numbers: use those details. Make it personal.
- Always end with exactly 3 follow-up chips on a new line:
Chips: "action 1" | "action 2" | "action 3"`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("") || "";
    return res.status(200).json({ response: text });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
