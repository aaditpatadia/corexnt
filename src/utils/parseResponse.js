/**
 * parseResponse v9 — proper nested JSON extraction + CLARIFY token support
 */

/**
 * Extracts nested JSON starting from `token` in `raw`.
 * Uses bracket counting to correctly handle nested objects/arrays.
 */
function extractNestedJSON(raw, token) {
  const tokenIdx = raw.indexOf(token);
  if (tokenIdx === -1) return { data: null, start: -1, end: -1 };

  // Find opening brace
  let braceStart = tokenIdx + token.length;
  while (braceStart < raw.length && raw[braceStart] !== '{') braceStart++;
  if (braceStart >= raw.length) return { data: null, start: -1, end: -1 };

  // Count brackets to find the matching closing brace
  let depth = 0;
  let i = braceStart;
  while (i < raw.length) {
    if (raw[i] === '{') depth++;
    else if (raw[i] === '}') {
      depth--;
      if (depth === 0) {
        const jsonStr = raw.slice(braceStart, i + 1);
        try {
          const data = JSON.parse(jsonStr);
          return { data, start: tokenIdx, end: i + 1 };
        } catch {
          return { data: null, start: tokenIdx, end: i + 1 };
        }
      }
    }
    i++;
  }
  return { data: null, start: -1, end: -1 };
}

/** Removes one token+JSON block from text using bracket counting */
function removeToken(text, token) {
  const { start, end } = extractNestedJSON(text, token);
  if (start === -1) return text;
  return text.slice(0, start) + text.slice(end);
}

function extractGraphData(raw) {
  const { data } = extractNestedJSON(raw, 'GRAPH_DATA:');
  if (!data) return null;
  if (data.labels && data.values) return data;
  return null;
}

function extractMindmapData(raw) {
  const { data } = extractNestedJSON(raw, 'MINDMAP_DATA:');
  if (!data) return null;
  if (data.center && Array.isArray(data.branches)) return data;
  return null;
}

function extractFlowchartData(raw) {
  const { data } = extractNestedJSON(raw, 'FLOWCHART_DATA:');
  if (!data) return null;
  if (Array.isArray(data.steps)) return data;
  return null;
}

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

function extractClarify(raw) {
  const match = raw.match(/CLARIFY:\s*(\[[\s\S]*?\])/);
  if (!match) return [];
  try {
    const arr = JSON.parse(match[1]);
    if (Array.isArray(arr)) return arr.filter(Boolean).slice(0, 4);
  } catch {}
  return [];
}

function extractChips(raw) {
  const sq = raw.match(/Chips:\s*'([^']+)'\s*\|\s*'([^']+)'\s*(?:\|\s*'([^']+)')?/);
  if (sq) return [sq[1], sq[2], sq[3]].filter(Boolean);
  const dq = raw.match(/Chips:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*(?:\|\s*"([^"]+)")?/);
  if (dq) return [dq[1], dq[2], dq[3]].filter(Boolean);
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
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, "$1")
    .replace(/\*+/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-•]\s+/gm, "")
    .replace(/_{1,2}([^_\n]+)_{1,2}/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/[☐□☑✓□]\s*/g, "")
    .trim();
}

export function parseResponse(raw) {
  if (!raw) {
    return {
      title: "", summary: "", steps: [], example: "",
      graphData: null, mindmapData: null, flowchartData: null,
      chips: [], keyMetric: null, cleanBody: "", followups: [], clarifyOptions: [],
    };
  }

  const graphData      = extractGraphData(raw);
  const mindmapData    = extractMindmapData(raw);
  const flowchartData  = extractFlowchartData(raw);
  const chips          = extractChips(raw);
  const followups      = extractFollowups(raw);
  const clarifyOptions = extractClarify(raw);

  // Remove all structured tokens using bracket-counting removal
  let clean = raw;
  clean = removeToken(clean, 'GRAPH_DATA:');
  clean = removeToken(clean, 'MINDMAP_DATA:');
  clean = removeToken(clean, 'FLOWCHART_DATA:');
  clean = clean
    .replace(/Chips:\s*.+$/m, "")
    .replace(/FOLLOWUPS:\s*\[[\s\S]*?\]/m, "")
    .replace(/CLARIFY:\s*\[[\s\S]*?\]/m, "")
    .trim();

  clean = stripMarkdown(clean);

  const lines = clean.split("\n").map(l => l.trimEnd());

  const titleIdx = lines.findIndex(l => l.trim().length > 0);
  let title = "";
  let bodyStart = 0;

  if (titleIdx >= 0) {
    const candidate = lines[titleIdx].trim();
    if (candidate.length < 80 && !candidate.match(/^(\d+[.)]\s|Action Steps|Real Example)/i)) {
      title = candidate;
      bodyStart = titleIdx + 1;
    }
  }

  const bodyLines = lines.slice(bodyStart);

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
  const keyMetric = extractKeyMetric(cleanBody);

  return {
    title, summary, cleanBody, steps, example,
    graphData, mindmapData, flowchartData,
    chips, followups, clarifyOptions, keyMetric,
  };
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
