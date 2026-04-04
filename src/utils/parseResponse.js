/**
 * parseResponse — strips all markdown syntax, extracts structured data
 * Returns: { title, summary, steps, example, graphData, chips, keyMetric, cleanBody }
 */

function extractGraphData(raw) {
  const match = raw.match(/GRAPH_DATA:\s*(\{[\s\S]*?\})\s*(?=\n|$)/);
  if (!match) return null;
  try {
    const gd = JSON.parse(match[1]);
    if (gd.labels && gd.values) return gd;
  } catch {}
  return null;
}

function extractChips(raw) {
  // Try single-quoted format: Chips: 'a' | 'b' | 'c'
  const sq = raw.match(/Chips:\s*'([^']+)'\s*\|\s*'([^']+)'\s*\|\s*'([^']+)'/);
  if (sq) return [sq[1], sq[2], sq[3]];
  // Double-quoted
  const dq = raw.match(/Chips:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\|\s*"([^"]+)"/);
  if (dq) return [dq[1], dq[2], dq[3]];
  // Bare pipe-separated
  const bare = raw.match(/Chips:\s*(.+)/);
  if (bare) {
    return bare[1]
      .split("|")
      .map((c) => c.trim().replace(/^['"`]|['"`]$/g, "").trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  return [];
}

function stripMarkdown(text) {
  return text
    .replace(/\*\*/g, "")               // bold
    .replace(/\*/g, "")                  // italic / bullets
    .replace(/^#{1,6}\s+/gm, "")        // headings
    .replace(/`{1,3}[^`]*`{1,3}/g, "")  // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .trim();
}

function generateDefaultGraph(text) {
  const lower = text.toLowerCase();
  if (lower.includes("follower") || lower.includes("subscriber") || lower.includes("growth")) {
    return {
      labels: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"],
      values: [10, 18, 32, 52, 80, 120],
      title: "Follower Growth Projection",
    };
  }
  if (lower.includes("engagement") || lower.includes("reach")) {
    return {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [3.2, 4.5, 3.8, 5.1, 6.2, 7.8, 5.5],
      title: "Engagement Rate %",
    };
  }
  if (lower.includes("revenue") || lower.includes("budget") || lower.includes("₹")) {
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      values: [50, 75, 95, 120, 155, 200],
      title: "Revenue Growth (₹K)",
    };
  }
  if (lower.includes("reel") || lower.includes("video") || lower.includes("content")) {
    return {
      labels: ["Reels", "Stories", "Carousel", "Static", "Live"],
      values: [92, 61, 78, 45, 38],
      title: "Content Performance Score",
    };
  }
  if (lower.includes("campaign") || lower.includes("brand") || lower.includes("influencer")) {
    return {
      labels: ["Awareness", "Interest", "Desire", "Action", "Loyalty"],
      values: [100, 72, 48, 31, 22],
      title: "Campaign Funnel",
    };
  }
  return {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    values: [20, 35, 52, 71, 92, 120],
    title: "Performance Projection",
  };
}

function extractKeyMetric(text) {
  const patterns = [
    /(\d[\d,]*[KMB]?)\s*(followers|subscribers|views)/i,
    /(\d[\d,.]+%)\s*(growth|engagement|reach|open rate|CTR)/i,
    /₹\s*(\d[\d,]*[KMBLakh]*)/i,
    /(\d+x)\s*(growth|return|ROI|ROAS)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0].trim();
  }
  return null;
}

export function parseResponse(raw) {
  if (!raw) return { title: "", summary: "", steps: [], example: "", graphData: null, chips: [], keyMetric: null, cleanBody: "" };

  const graphData = extractGraphData(raw) || generateDefaultGraph(raw);
  const chips = extractChips(raw);

  // Clean raw text
  let clean = raw
    .replace(/GRAPH_DATA:\s*\{[\s\S]*?\}\s*(?=\n|$)/g, "")
    .replace(/Chips:\s*.+$/m, "")
    .trim();

  clean = stripMarkdown(clean);

  // Split into lines, remove blank duplicates
  const lines = clean.split("\n").map((l) => l.trimEnd());

  // First non-empty line = title
  const titleIdx = lines.findIndex((l) => l.trim().length > 0);
  const title = titleIdx >= 0 ? lines[titleIdx].trim() : "Response";

  // Rest of body
  const bodyLines = lines.slice(titleIdx + 1);

  // Extract "Action Steps:" block
  const actionStart = bodyLines.findIndex((l) => /^action steps/i.test(l.trim()));
  const realExampleStart = bodyLines.findIndex((l) => /^real example/i.test(l.trim()));

  let mainBodyLines = bodyLines;
  let stepLines = [];
  let exampleLines = [];

  if (actionStart !== -1) {
    mainBodyLines = bodyLines.slice(0, actionStart);
    const afterAction = bodyLines.slice(actionStart + 1);
    const stepEnd = realExampleStart !== -1 ? realExampleStart - actionStart - 1 : afterAction.length;
    stepLines = afterAction.slice(0, stepEnd).filter((l) => /^\d+\./.test(l.trim()));
  }

  if (realExampleStart !== -1) {
    exampleLines = bodyLines.slice(realExampleStart + 1);
  }

  const steps = stepLines
    .map((l) => l.replace(/^\d+\.\s*/, "").trim())
    .filter((l) => l.length > 0);

  const example = exampleLines.join(" ").trim();

  // Summary = first non-empty line of mainBody
  const summary = mainBodyLines.find((l) => l.trim().length > 0)?.trim() || "";
  const cleanBody = mainBodyLines.join("\n").trim();

  const keyMetric = extractKeyMetric(cleanBody + " " + summary);

  return { title, summary, cleanBody, steps, example, graphData, chips, keyMetric };
}
