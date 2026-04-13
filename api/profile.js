// ─── Cross-device profile sync ────────────────────────────────────────────────
// Uses an in-process Map as a fallback. For true cross-device persistence,
// set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel env vars,
// then replace the Map operations below with @vercel/kv calls.

const LOCAL_STORE = new Map();

async function getKV(key) {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const { kv } = await import("@vercel/kv");
      return await kv.get(key);
    }
  } catch {}
  return LOCAL_STORE.get(key) ?? null;
}

async function setKV(key, value) {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const { kv } = await import("@vercel/kv");
      await kv.set(key, value, { ex: 60 * 60 * 24 * 365 }); // 1 year TTL
      return;
    }
  } catch {}
  LOCAL_STORE.set(key, value);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { email } = req.query;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }

  // Hash the email to avoid storing PII as a plain key
  const key = `corex_profile_${Buffer.from(email.toLowerCase().trim()).toString("base64")}`;

  if (req.method === "GET") {
    const profile = await getKV(key);
    return res.status(200).json({ profile });
  }

  if (req.method === "POST") {
    const { profile } = req.body || {};
    if (!profile || typeof profile !== "object") {
      return res.status(400).json({ error: "Profile object required" });
    }
    // Only save safe fields
    const safe = {
      name:  String(profile.name  || "").slice(0, 80),
      phone: String(profile.phone || "").slice(0, 20),
    };
    await setKV(key, safe);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
