/**
 * parseResponse v8 — strips all markdown, extracts structured data.
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

function extractMindmapData(raw) {
  const match = raw.match(/MINDMAP_DATA:\s*(\{[\s\S]*?\})\s*(?=\n|$|\})/);
  if (!match) return null;
  try {
    const md = JSON.parse(match[1]);
    if (md.center && Array.isArray(md.branches)) return md;
  } catch {}
  return null;
}

function extractFlowchartData(raw) {
  const match = raw.match(/FLOWCHART_DATA:\s*(\{[\s\S]*?\})\s*(?=\n|$|\})/);
  if (!match) return null;
  try {
    const fd = JSON.parse(match[1]);
    if (Array.isArray(fd.steps)) return fd;
  } catch {}
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
    return { title:"", summary:"", steps:[], example:"", graphData:null, mindmapData:null, flowchartData:null, chips:[], keyMetric:null, cleanBody:"", followups:[] };
  }

  const graphData     = extractGraphData(raw);
  const mindmapData   = extractMindmapData(raw);
  const flowchartData = extractFlowchartData(raw);
  const chips         = extractChips(raw);
  const followups     = extractFollowups(raw);

  let clean = raw
    .replace(/GRAPH_DATA:\s*\{[\s\S]*?\}\s*(?=\n|$)/g, "")
    .replace(/MINDMAP_DATA:\s*\{[\s\S]*?\}\s*(?=\n|$)/g, "")
    .replace(/FLOWCHART_DATA:\s*\{[\s\S]*?\}\s*(?=\n|$)/g, "")
    .replace(/Chips:\s*.+$/m, "")
    .replace(/FOLLOWUPS:\s*\[[\s\S]*?\]/m, "")
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

  return { title, summary, cleanBody, steps, example, graphData, mindmapData, flowchartData, chips, followups, keyMetric };
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
