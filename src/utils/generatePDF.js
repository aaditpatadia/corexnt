import { jsPDF } from "jspdf";

// ── Design tokens ─────────────────────────────────────────────────────────────
const GREEN       = [26, 122, 60];
const GREEN_PALE  = [232, 245, 238];
const GREEN_MID   = [200, 230, 212];
const GREEN_DARK  = [18, 90, 44];
const DARK        = [26, 26, 26];
const GREY        = [85, 85, 85];
const MUTED       = [150, 150, 150];
const LIGHT_BG    = [248, 252, 249];
const BORDER      = [232, 232, 227];
const BLUE        = [34, 111, 247];
const ORANGE      = [249, 115, 22];
const TEAL        = [20, 184, 166];
const PURPLE      = [168, 85, 247];
const PINK        = [244, 63, 94];
const YELLOW      = [234, 179, 8];

const BAR_COLORS = [ORANGE, TEAL, YELLOW, PURPLE, PINK, GREEN];
const PAGE_W = 210;
const PAGE_H = 297;
const M  = 14;              // margin
const CW = PAGE_W - M * 2; // content width

// ── Text helpers ──────────────────────────────────────────────────────────────

function cleanText(str = "") {
  return str
    .replace(/₹/g, "Rs.")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/—/g, " - ")
    .replace(/–/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x00-\x7F]/g, () => " ");
}

function stripForPDF(text = "") {
  return text
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1")  // [label](url) → label
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, ""))
    .trim();
}

/**
 * Extract all markdown links [label](url) from text.
 * Returns array of {label, url} — deduplicated by URL.
 */
function extractLinks(text = "") {
  const RE = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const seen = new Set();
  const links = [];
  let m;
  while ((m = RE.exec(text)) !== null) {
    if (!seen.has(m[2])) {
      seen.add(m[2]);
      links.push({ label: m[1].trim(), url: m[2] });
    }
  }
  // Also extract bare URLs not already in a markdown link
  const bareRE = /(?<!\()(https?:\/\/[^\s)>"]+)/g;
  while ((m = bareRE.exec(text)) !== null) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      links.push({ label: m[1], url: m[1] });
    }
  }
  return links;
}

// ── Core write helper ─────────────────────────────────────────────────────────

/** Write wrapped text, return new Y. Triggers page break via pageBreakCb if needed. */
function write(doc, text, x, y, maxW, {
  size = 10.5, font = "normal", family = "helvetica", color = DARK, lineH = 6.2, pageBreakCb,
} = {}) {
  doc.setFont(family, font);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(cleanText(text), maxW);
  for (const line of lines) {
    if (pageBreakCb && y + lineH > PAGE_H - 18) y = pageBreakCb();
    doc.text(line, x, y);
    y += lineH;
  }
  return y;
}

// ── Section badge ─────────────────────────────────────────────────────────────

function sectionBadge(doc, label, y) {
  doc.setFillColor(...GREEN);
  doc.rect(M, y, 3, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  doc.text(label, M + 6, y + 5);
  return y + 13;
}

// ── Header ────────────────────────────────────────────────────────────────────

function addHeader(doc, title, subtitle, userName = "") {
  // Dark green top bar
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, PAGE_W, 16, "F");

  // COREX logotype
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("COREX", M, 11);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREEN_MID);
  doc.text("Creative Intelligence Engine", M + 30, 11);

  // Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 230, 212);
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  doc.text(dateStr, PAGE_W - M, 11, { align: "right" });

  // Title block background
  doc.setFillColor(...GREEN_PALE);
  doc.rect(0, 16, PAGE_W, 34, "F");

  // Title text (max 2 lines)
  const safeTitle = cleanText(title || "COREX Report");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...DARK);
  const titleLines = doc.splitTextToSize(safeTitle, CW - 50);
  let ty = 28;
  titleLines.slice(0, 2).forEach((l) => { doc.text(l, M, ty); ty += 9; });

  // Subtitle
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text(cleanText(subtitle), M, 46);
  }

  // "Generated for USER" pill (top-right of title block)
  if (userName) {
    const tag = `Generated for  ${userName}`;
    doc.setFillColor(...GREEN);
    doc.roundedRect(PAGE_W - M - 60, 36, 58, 9, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(cleanText(tag), PAGE_W - M - 31, 42, { align: "center" });
  }

  // Rule
  doc.setDrawColor(...GREEN_MID);
  doc.setLineWidth(0.4);
  doc.line(M, 51, PAGE_W - M, 51);

  return 60;
}

// ── Mini-header for continuation pages ───────────────────────────────────────

function addMiniHeader(doc, userName = "") {
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, PAGE_W, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("COREX", M, 6.2);
  if (userName) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GREEN_MID);
    doc.text(`for  ${userName}`, M + 22, 6.2);
  }
  return 18;
}

// ── Footer ────────────────────────────────────────────────────────────────────

function addFooter(doc, pageNum, userName = "") {
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(M, PAGE_H - 13, PAGE_W - M, PAGE_H - 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  const left = userName
    ? `COREX  ·  Generated for ${userName}  ·  corexnt.com`
    : "COREX  ·  corexnt.com";
  doc.text(left, M, PAGE_H - 7.5);
  doc.text(`Page ${pageNum}`, PAGE_W - M, PAGE_H - 7.5, { align: "right" });
}

// ── References / links section ────────────────────────────────────────────────

/**
 * Render a "LINKS & REFERENCES" section with clickable blue URLs.
 * Each link is rendered as "1. label" on one line, then the URL on the next (clickable).
 */
function addLinksSection(doc, links, y, newPage) {
  if (!links || links.length === 0) return y;
  y = (y + 20 > PAGE_H - 18) ? newPage() : y + 8;
  y = sectionBadge(doc, "LINKS & REFERENCES", y);

  links.forEach((link, i) => {
    const needed = 16;
    if (y + needed > PAGE_H - 18) y = newPage();

    // Number + label
    doc.setFillColor(...BLUE);
    doc.circle(M + 3, y, 2.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), M + 3, y + 1, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...DARK);
    const labelText = cleanText(link.label).slice(0, 70);
    doc.text(labelText, M + 8, y + 1);
    y += 6;

    // URL — clickable
    if (y + 7 > PAGE_H - 18) y = newPage();
    const urlText = link.url.length > 80 ? link.url.slice(0, 78) + "…" : link.url;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BLUE);
    doc.text(urlText, M + 8, y);
    // Underline
    const urlW = doc.getStringUnitWidth(urlText) * 8 / doc.internal.scaleFactor;
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.25);
    doc.line(M + 8, y + 0.8, M + 8 + urlW, y + 0.8);
    // Clickable area
    doc.link(M + 8, y - 4, urlW, 5, { url: link.url });

    y += 8;
  });

  return y;
}

// ── Closing brand card ────────────────────────────────────────────────────────

function addClosingCard(doc, y, resolvedName, newPage) {
  if (y + 30 > PAGE_H - 18) y = newPage();
  y += 8;
  doc.setFillColor(...GREEN_DARK);
  doc.roundedRect(M, y, CW, 22, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("COREX  —  Creative Intelligence Engine", M + CW / 2, y + 9, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GREEN_MID);
  const msg = resolvedName
    ? `This report was generated for ${resolvedName}  ·  corexnt.com`
    : "Generated by COREX  ·  corexnt.com";
  doc.text(cleanText(msg), M + CW / 2, y + 16, { align: "center" });
  return y + 22;
}

// ── 1. Response PDF ───────────────────────────────────────────────────────────

export function generateResponsePDF({
  title,
  body,
  actionSteps = [],
  realExample = "",
  graphData = null,
  chartImage = null,
  userName = "",
}) {
  const resolvedName = userName
    || localStorage.getItem("corex_user_name")
    || localStorage.getItem("userName")
    || "";

  // Collect all links from body text upfront
  const allLinks = extractLinks(body || "");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let pageNum = 1;

  const newPage = () => {
    addFooter(doc, pageNum, resolvedName);
    doc.addPage();
    pageNum++;
    return addMiniHeader(doc, resolvedName);
  };

  const checkY = (y, needed = 20) => {
    if (y + needed > PAGE_H - 18) return newPage();
    return y;
  };

  let y = addHeader(doc, title, "COREX Intelligence Report", resolvedName);

  // ── Body ─────────────────────────────────────────────────────────────────────
  const paras = (body || "").split(/\n\n+/).filter((p) => p.trim());

  for (const para of paras) {
    const raw = para.trim();
    const stripped = stripForPDF(raw);
    if (!stripped) continue;

    const isBullet   = /^[-*•] /.test(stripped);
    const isNumbered = /^\d+\. /.test(stripped);
    const isSectionHead = /^[A-Z][A-Z\s''&\/\-]{4,}:?\s*$/.test(stripped) && stripped.length < 60;

    // ── Section heading (ALL-CAPS) ──
    if (isSectionHead) {
      y = checkY(y, 14);
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text(cleanText(stripped), M, y);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.line(M, y + 2, M + CW, y + 2);
      y += 8;
      continue;
    }

    // ── List block (one or more items separated by \n) ──
    if (isBullet || isNumbered) {
      const items = raw.split("\n").filter((l) => l.trim());
      for (const item of items) {
        const itemClean = stripForPDF(
          item.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "")
        );
        const bulletLabel = isNumbered
          ? (item.match(/^(\d+)\./) || [])[1] + "."
          : "•";
        const lines = doc.splitTextToSize(cleanText(itemClean), CW - 9);
        const blockH = lines.length * 5.8 + 4;
        y = checkY(y, blockH);

        // Bullet / number
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...GREEN);
        doc.text(bulletLabel, M, y + 0.5);

        // Item text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...DARK);
        lines.forEach((l, li) => {
          doc.text(l, M + 8, y + li * 5.8);
        });

        y += blockH;
      }
      y += 2;
      continue;
    }

    // ── Regular paragraph ──
    const lines = doc.splitTextToSize(cleanText(stripped), CW);
    const blockH = lines.length * 6 + 4;
    y = checkY(y, blockH);

    // Short bold subheading (< 80 chars, no period at end)
    if (stripped.length < 80 && !stripped.endsWith(".") && lines.length === 1) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...DARK);
      doc.text(cleanText(stripped), M, y);
      y += 8;
    } else {
      y = write(doc, stripped, M, y, CW, {
        size: 10.5, lineH: 6, color: DARK, pageBreakCb: newPage,
      });
      y += 3;
    }
  }

  // ── Chart ─────────────────────────────────────────────────────────────────────
  if (chartImage) {
    y = checkY(y, 90);
    y += 4;
    y = sectionBadge(doc, "DATA VISUALISATION", y);
    const chartH = 72;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.4);
    doc.roundedRect(M, y, CW, chartH, 3, 3, "FD");
    if (graphData?.title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...GREY);
      doc.text(cleanText(graphData.title), M + CW / 2, y + 8, { align: "center" });
    }
    try { doc.addImage(chartImage, "PNG", M + 4, y + 12, CW - 8, chartH - 16); } catch {}
    y += chartH + 10;

  } else if (graphData?.labels && graphData?.values?.length > 0) {
    y = checkY(y, 80);
    y += 4;
    y = sectionBadge(doc, "DATA SNAPSHOT", y);

    const vals = graphData.values;
    const labels = graphData.labels;
    const maxVal = Math.max(...vals, 1);
    const chartAreaH = 52;
    const chartAreaY = y + 6;
    const barAreaW = CW - 8;
    const barW = Math.min(18, (barAreaW / vals.length) - 4);
    const barSpacing = barAreaW / vals.length;

    doc.setFillColor(250, 252, 250);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, chartAreaY, CW, chartAreaH + 14, 3, 3, "FD");

    if (graphData.title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...GREY);
      doc.text(cleanText(graphData.title), M + CW / 2, chartAreaY + 8, { align: "center" });
    }

    vals.forEach((val, i) => {
      const barH = (val / maxVal) * (chartAreaH - 16);
      const bx = M + 4 + i * barSpacing + (barSpacing - barW) / 2;
      const by = chartAreaY + chartAreaH - barH - 4;
      doc.setFillColor(...BAR_COLORS[i % BAR_COLORS.length]);
      doc.roundedRect(bx, by, barW, barH, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...DARK);
      doc.text(String(val), bx + barW / 2, by - 2, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...GREY);
      const labelLines = doc.splitTextToSize(cleanText(labels[i] || ""), barSpacing - 2);
      labelLines.slice(0, 2).forEach((l, li) => {
        doc.text(l, bx + barW / 2, chartAreaY + chartAreaH + li * 4 + 2, { align: "center" });
      });
    });

    y = chartAreaY + chartAreaH + 20;
  }

  // ── Action Steps ──────────────────────────────────────────────────────────────
  if (actionSteps.length > 0) {
    y = checkY(y, 50);
    y += 4;
    y = sectionBadge(doc, "ACTION STEPS", y);

    for (let i = 0; i < actionSteps.length; i++) {
      const step = cleanText(stripForPDF(actionSteps[i]));
      const lines = doc.splitTextToSize(step, CW - 16);
      const blockH = lines.length * 6 + 12;
      y = checkY(y, blockH);

      doc.setFillColor(...GREEN);
      doc.circle(M + 5, y + 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(String(i + 1), M + 5, y + 5.5, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      lines.forEach((l, li) => {
        doc.text(l, M + 13, y + (li === 0 ? 5.5 : 5.5 + li * 6));
      });

      if (i < actionSteps.length - 1) {
        doc.setDrawColor(...GREEN_MID);
        doc.setLineWidth(0.5);
        doc.setLineDashPattern([1, 2], 0);
        doc.line(M + 5, y + 8, M + 5, y + blockH - 2);
        doc.setLineDashPattern([], 0);
      }
      y += blockH;
    }
    y += 6;
  }

  // ── Real Example ──────────────────────────────────────────────────────────────
  if (realExample) {
    const exText = cleanText(stripForPDF(realExample));
    const exLines = doc.splitTextToSize(exText, CW - 10);
    const exH = exLines.length * 6.2 + 16;
    y = checkY(y, exH + 10);
    y += 4;
    y = sectionBadge(doc, "REAL EXAMPLE", y);

    doc.setFillColor(...GREEN);
    doc.rect(M, y, 3, exH, "F");
    doc.setFillColor(...LIGHT_BG);
    doc.setDrawColor(...GREEN_MID);
    doc.setLineWidth(0.3);
    doc.rect(M + 3, y, CW - 3, exH, "FD");

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...GREY);
    exLines.forEach((l, li) => { doc.text(l, M + 8, y + 10 + li * 6.2); });
    y += exH + 6;
  }

  // ── Links & References ────────────────────────────────────────────────────────
  y = addLinksSection(doc, allLinks, y, newPage);

  // ── Closing card ──────────────────────────────────────────────────────────────
  addClosingCard(doc, y, resolvedName, newPage);

  addFooter(doc, pageNum, resolvedName);

  const safeName = resolvedName ? `-${resolvedName.replace(/\s+/g, "-").toLowerCase()}` : "";
  doc.save(`corex-report${safeName}-${Date.now()}.pdf`);
}

// ── 2. Campaign Brief PDF ─────────────────────────────────────────────────────

export function generateCampaignBriefPDF({
  brandName = "Brand",
  campaignName = "Campaign",
  objective,
  audience,
  message,
  channels = [],
  timeline,
  budget,
  kpis = [],
  influencerTiers = [],
  userName = "",
}) {
  const resolvedName = userName
    || localStorage.getItem("corex_user_name")
    || localStorage.getItem("userName")
    || "";

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let pageNum = 1;

  const newPage = () => {
    addFooter(doc, pageNum, resolvedName);
    doc.addPage();
    pageNum++;
    return addMiniHeader(doc, resolvedName);
  };

  const checkY = (y, needed = 20) => {
    if (y + needed > PAGE_H - 18) return newPage();
    return y;
  };

  let y = addHeader(doc, campaignName, `Campaign Brief  ·  ${brandName}`, resolvedName);

  const field = (label, value, y) => {
    if (!value) return y;
    y = checkY(y, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(cleanText(label).toUpperCase(), M, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(cleanText(stripForPDF(value)), CW);
    lines.forEach((l) => {
      if (y + 7 > PAGE_H - 18) y = newPage();
      doc.text(l, M, y);
      y += 6.5;
    });
    return y + 5;
  };

  y = sectionBadge(doc, "CAMPAIGN OVERVIEW", y);
  y = field("Objective", objective, y);
  y = field("Target Audience", audience, y);
  y = field("Core Message", message, y);
  y = field("Timeline", timeline, y);
  y = field("Budget", budget, y);

  if (channels.length > 0) {
    y = checkY(y, 30);
    y = sectionBadge(doc, "CHANNEL MIX", y);
    const cols = 3;
    channels.forEach((ch, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      if (col === 0) y = checkY(y, 14);
      const cx = M + col * (CW / cols);
      doc.setFillColor(...GREEN_PALE);
      doc.roundedRect(cx, y - 4 + row * 14, CW / cols - 4, 11, 2, 2, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      doc.text(cleanText(ch), cx + 5, y + 3.5 + row * 14);
      if (col === cols - 1 || i === channels.length - 1) {
        if (col === cols - 1) y += 14;
      }
    });
    y += 8;
  }

  if (kpis.length > 0) {
    y = checkY(y, 30);
    y = sectionBadge(doc, "KEY PERFORMANCE INDICATORS", y);
    kpis.forEach((kpi) => {
      y = checkY(y, 10);
      doc.setFillColor(...GREEN);
      doc.circle(M + 3, y - 1, 2, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(cleanText(stripForPDF(kpi)), M + 8, y);
      y += 7;
    });
    y += 4;
  }

  if (influencerTiers.length > 0) {
    y = checkY(y, 40);
    y = sectionBadge(doc, "INFLUENCER STRATEGY", y);
    influencerTiers.forEach((tier) => {
      y = checkY(y, 12);
      doc.setFillColor(...GREEN_PALE);
      doc.roundedRect(M, y - 3, CW, 10, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      doc.text(cleanText(tier.name || ""), M + 4, y + 3.5);
      if (tier.count) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GREY);
        doc.text(`${tier.count} creators`, M + 80, y + 3.5);
      }
      if (tier.budget) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...GREEN);
        doc.text(cleanText(tier.budget), PAGE_W - M - 4, y + 3.5, { align: "right" });
      }
      y += 12;
    });
  }

  addClosingCard(doc, y, resolvedName, newPage);
  addFooter(doc, pageNum, resolvedName);

  const safeName = resolvedName ? `-${resolvedName.replace(/\s+/g, "-").toLowerCase()}` : "";
  doc.save(`corex-campaign-brief${safeName}-${Date.now()}.pdf`);
}

// ── 3. Content Calendar PDF ───────────────────────────────────────────────────

export function generateContentCalendarPDF({
  brandName = "Brand",
  month = "",
  posts = [],
  userName = "",
}) {
  const resolvedName = userName
    || localStorage.getItem("corex_user_name")
    || localStorage.getItem("userName")
    || "";

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let pageNum = 1;
  let y = addHeader(
    doc,
    `Content Calendar${month ? `  —  ${month}` : ""}`,
    `Planned for  ${brandName}`,
    resolvedName,
  );

  const ROW_H = 12;
  const COLS = { date: M, platform: M + 26, format: M + 56, hook: M + 86, status: PAGE_W - M - 24 };

  const drawTableHeader = (y) => {
    doc.setFillColor(...GREEN_DARK);
    doc.rect(M, y, CW, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    [["DATE", COLS.date], ["PLATFORM", COLS.platform], ["FORMAT", COLS.format], ["HOOK / IDEA", COLS.hook], ["STATUS", COLS.status]]
      .forEach(([label, x]) => { doc.text(label, x + 1.5, y + 6); });
    return y + 9;
  };

  y = drawTableHeader(y);

  posts.forEach((post, i) => {
    if (y + ROW_H > PAGE_H - 18) {
      addFooter(doc, pageNum, resolvedName);
      doc.addPage();
      pageNum++;
      y = addMiniHeader(doc, resolvedName);
      y = drawTableHeader(y);
    }

    if (i % 2 === 0) {
      doc.setFillColor(248, 252, 249);
      doc.rect(M, y, CW, ROW_H, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text(cleanText(post.date || ""), COLS.date + 1.5, y + 7.5);
    doc.text(cleanText(post.platform || ""), COLS.platform + 1.5, y + 7.5);
    doc.text(cleanText(post.format || ""), COLS.format + 1.5, y + 7.5);

    const hookRaw = cleanText(stripForPDF(post.hook || ""));
    const hook = hookRaw.length > 55 ? hookRaw.slice(0, 53) + "..." : hookRaw;
    doc.text(hook, COLS.hook + 1.5, y + 7.5);

    const statusColors = {
      Draft:     { bg: GREEN_PALE,      fg: DARK  },
      Scheduled: { bg: [224, 242, 254], fg: [2, 132, 199] },
      Published: { bg: GREEN_PALE,      fg: GREEN },
    };
    const sc = statusColors[post.status] || statusColors.Draft;
    doc.setFillColor(...sc.bg);
    doc.roundedRect(COLS.status, y + 2.5, 22, 6.5, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...sc.fg);
    doc.text(post.status || "Draft", COLS.status + 11, y + 7, { align: "center" });

    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.line(M, y + ROW_H, M + CW, y + ROW_H);
    y += ROW_H;
  });

  addClosingCard(doc, y, resolvedName, newPage);
  addFooter(doc, pageNum, resolvedName);

  const safeName = resolvedName ? `-${resolvedName.replace(/\s+/g, "-").toLowerCase()}` : "";
  doc.save(`corex-content-calendar${safeName}-${Date.now()}.pdf`);

  function newPage() {
    addFooter(doc, pageNum, resolvedName);
    doc.addPage();
    pageNum++;
    return addMiniHeader(doc, resolvedName);
  }
}
