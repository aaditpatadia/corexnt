/**
 * parseResponse v5.2 — strips all markdown, extracts structured data.
 * Charts ONLY when response contains real GRAPH_DATA with meaningful variance.
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

/**
 * Only show chart if values have meaningful variance (>10% range vs max).
 * This prevents charts showing for flat/meaningless data.
 */
export function shouldShowChart(graphData) {
  if (!graphData) return false;
  const values = graphData.values;
  if (!values || values.length < 2) return false;
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max === 0) return false;
  return (max - min) > (max * 0.1);
}

function extractFollowups(raw) {
  const match = raw.match(/FOLLOWUPS:\s*(\[[\s\S]*?\])/);
  if (!match) return [];
  try {
    const arr = JSON.parse(match[1]);
    if (Array.isArray(arr)) return arr.filter(Boolean).slice(0, 2);
  } catch {}
  return [];
}

function extractChips(raw) {
  // Single-quoted
  const sq = raw.match(/Chips:\s*'([^']+)'\s*\|\s*'([^']+)'\s*(?:\|\s*'([^']+)')?/);
  if (sq) return [sq[1], sq[2], sq[3]].filter(Boolean);
  // Double-quoted
  const dq = raw.match(/Chips:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*(?:\|\s*"([^"]+)")?/);
  if (dq) return [dq[1], dq[2], dq[3]].filter(Boolean);
  // Bare pipe-separated
  const bare = raw.match(/Chips:\s*(.+)/);
  if (bare) {
    return bare[1]
      .split("|")
      .map(c => c.trim().replace(/^['"`]|['"`]$/g, "").trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  return [];
}

export function stripMarkdown(text) {
  return text
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, "$1")  // bold/italic
    .replace(/\*+/g, "")                           // remaining asterisks
    .replace(/^#{1,6}\s+/gm, "")                   // headings
    .replace(/`{1,3}[^`]*`{1,3}/g, "")             // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")        // links
    .replace(/^[-•]\s+/gm, "")                      // list bullets
    .replace(/_{1,2}([^_\n]+)_{1,2}/g, "$1")        // underline/italic
    .replace(/~~([^~]+)~~/g, "$1")                  // strikethrough
    .replace(/^>\s+/gm, "")                          // blockquotes
    .trim();
}

export function parseResponse(raw) {
  if (!raw) {
    return { title:"", summary:"", steps:[], example:"", graphData:null, chips:[], keyMetric:null, cleanBody:"" };
  }

  // Extract structured data first (from raw, before stripping)
  const graphData = extractGraphData(raw);
  const chips     = extractChips(raw);
  const followups = extractFollowups(raw);

  // Remove structured tokens from display text
  let clean = raw
    .replace(/GRAPH_DATA:\s*\{[\s\S]*?\}\s*(?=\n|$)/g, "")
    .replace(/Chips:\s*.+$/m, "")
    .replace(/FOLLOWUPS:\s*\[[\s\S]*?\]/m, "")
    .trim();

  clean = stripMarkdown(clean);

  // Normalise blank lines
  const lines = clean.split("\n").map(l => l.trimEnd());

  // First non-empty line = title (if under 80 chars)
  const titleIdx = lines.findIndex(l => l.trim().length > 0);
  let title = "";
  let bodyStart = 0;

  if (titleIdx >= 0) {
    const candidate = lines[titleIdx].trim();
    // Title if: short enough and doesn't start with a numbered step or section keyword
    if (candidate.length < 80 && !candidate.match(/^(\d+[.)]\s|Action Steps|Real Example)/i)) {
      title = candidate;
      bodyStart = titleIdx + 1;
    }
  }

  const bodyLines = lines.slice(bodyStart);

  // Find structured sections
  const actionStart      = bodyLines.findIndex(l => /^action steps/i.test(l.trim()));
  const realExampleStart = bodyLines.findIndex(l => /^real example/i.test(l.trim()));

  let mainBodyLines = bodyLines;
  let stepLines     = [];
  let exampleLines  = [];

  if (actionStart !== -1) {
    mainBodyLines = bodyLines.slice(0, actionStart);
    const afterAction = bodyLines.slice(actionStart + 1);
    const stepEnd = realExampleStart !== -1 ? realExampleStart - actionStart - 1 : afterAction.length;
    stepLines = afterAction.slice(0, stepEnd).filter(l => /^\d+[.)]\s/.test(l.trim()));
  }

  if (realExampleStart !== -1) {
    if (actionStart !== -1 && realExampleStart < actionStart) {
      exampleLines = bodyLines.slice(realExampleStart + 1, actionStart);
    } else {
      exampleLines = bodyLines.slice(realExampleStart + 1);
    }
  }

  const steps = stepLines
    .map(l => l.replace(/^\d+[.)]\s*/, "").trim())
    .filter(l => l.length > 0);

  const example   = exampleLines.join(" ").trim();
  const cleanBody = mainBodyLines.join("\n").trim();
  const summary   = mainBodyLines.find(l => l.trim().length > 0)?.trim() || "";

  // Key metric extraction (only from body, not title)
  const keyMetric = extractKeyMetric(cleanBody);

  return { title, summary, cleanBody, steps, example, graphData, chips, followups, keyMetric };
}

function extractKeyMetric(text) {
  const patterns = [
    /(\d[\d,]*[KMB]?)\s*(?:followers|subscribers|views|downloads)/i,
    /(\d[\d,.]+%)\s*(?:growth|engagement|reach|open rate|CTR|conversion)/i,
    /\$\s*(\d[\d,]*[KMB]?)/i,
    /(\d+x)\s*(?:growth|return|ROI|ROAS)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0].trim();
  }
  return null;
}
