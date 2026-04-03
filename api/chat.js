import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const SYSTEM_PROMPT = `
You are Corex — a premium Creative Operating System.

Give HIGH-QUALITY, EXECUTABLE answers.

FORMAT:

## What To Do
(max 5 steps)

## How To Do It
(tools, execution)

## When To Do It
(timing)

## Why It Works
(2-3 lines)

## Real Example
(real brand)

## Data / Graph
(Graph: Label1: Number Label2: Number)

Chips: "action 1" | "action 2" | "action 3"
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast + cheap + good
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("🔥 FULL ERROR:", err);
    return res.status(500).json({ error: "Corex failed to respond" });
  }
}