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
const M = 14;         // margin
const CW = PAGE_W - M * 2;  // content width

// ── Text helpers ──────────────────────────────────────────────────────────────

/** Replace characters jsPDF built-in fonts can't render */
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
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, ""))
    .trim();
}

/** Parse inline markdown links → [{text, url}] segments for a single line */
function parseLinks(line) {
  const segments = [];
  const RE = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let last = 0;
  let m;
  while ((m = RE.exec(line)) !== null) {
    if (m.index > last) segments.push({ text: line.slice(last, m.index), url: null });
    segments.push({ text: m[1], url: m[2] });
    last = m.index + m[0].length;
  }
  if (last < line.length) segments.push({ text: line.slice(last), url: null });
  return segments;
}

/** Write wrapped text, returns new Y. pageBreakCb must return new Y after page break. */
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

/**
 * Write text that may contain markdown links [label](url).
 * Links render in blue with underline and are clickable.
 */
function writeParsed(doc, rawLine, x, y, maxW, {
  size = 10.5, lineH = 6.2, color = DARK, pageBreakCb,
} = {}) {
  // Split on newlines first
  const rawLines = rawLine.split(/\n/);
  for (const rl of rawLines) {
    const segments = parseLinks(rl);
    // Measure total text to decide if it fits in one go or needs wrapping
    const fullText = segments.map((s) => s.text).join("");
    const wrapped = doc.splitTextToSize(cleanText(fullText), maxW);
    // For simplicity: render wrapped plain text, then re-render links on top
    // (jsPDF link API works by bounding-box overlay)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);

    let cx = x;
    for (const seg of segments) {
      const segText = cleanText(seg.text);
      if (!segText) continue;

      if (seg.url) {
        // Blue underlined link text
        doc.setTextColor(...BLUE);
        doc.setFont("helvetica", "bold");
        const w = doc.getStringUnitWidth(segText) * size / doc.internal.scaleFactor;
        if (cx + w > x + maxW) {
          // Wrap to next line
          y += lineH;
          if (pageBreakCb && y + lineH > PAGE_H - 18) y = pageBreakCb();
          cx = x;
        }
        doc.text(segText, cx, y);
        // Underline
        doc.setDrawColor(...BLUE);
        doc.setLineWidth(0.3);
        doc.line(cx, y + 0.8, cx + w, y + 0.8);
        // Clickable overlay
        doc.link(cx, y - size * 0.35 / doc.internal.scaleFactor, w, lineH, { url: seg.url });
        cx += w + 0.5;
      } else {
        doc.setTextColor(...color);
        doc.setFont("helvetica", "normal");
        const words = segText.split(" ");
        for (const word of words) {
          const wordW = doc.getStringUnitWidth(word + " ") * size / doc.internal.scaleFactor;
          if (cx > x && cx + wordW > x + maxW) {
            y += lineH;
            if (pageBreakCb && y + lineH > PAGE_H - 18) y = pageBreakCb();
            cx = x;
          }
          doc.text(word + " ", cx, y);
          cx += wordW;
        }
      }
    }

    y += lineH;
    if (pageBreakCb && y + lineH > PAGE_H - 18) y = pageBreakCb();
    cx = x;
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

/**
 * Draw the first-page header. Returns starting Y for content.
 * @param {string} title - Report/document title
 * @param {string} subtitle - Short descriptor line
 * @param {string} userName - The user's name (shown as "Generated for …")
 */
function addHeader(doc, title, subtitle, userName = "") {
  // Dark green top bar
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, PAGE_W, 16, "F");

  // COREX logotype
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("COREX", M, 11);

  // Tagline next to logo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREEN_MID);
  doc.text("Creative Intelligence Engine", M + 30, 11);

  // Date (top-right)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 230, 212);
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  doc.text(dateStr, PAGE_W - M, 11, { align: "right" });

  // Light green title block
  doc.setFillColor(...GREEN_PALE);
  doc.rect(0, 16, PAGE_W, 34, "F");

  // Title
  const safeTitle = cleanText(title || "COREX Report");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...DARK);
  const titleLines = doc.splitTextToSize(safeTitle, CW);
  let ty = 28;
  titleLines.slice(0, 2).forEach((l) => { doc.text(l, M, ty); ty += 9; });

  // Subtitle
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text(cleanText(subtitle), M, 46);
  }

  // "Generated for" tag (right side)
  if (userName) {
    const tag = `Generated for  ${userName.toUpperCase()}`;
    doc.setFillColor(...GREEN);
    const tagW = doc.getStringUnitWidth(tag) * 8 / doc.internal.scaleFactor + 10;
    const tagX = PAGE_W - M - tagW;
    doc.roundedRect(tagX, 36, tagW, 9, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(tag, tagX + 5, 42);
  }

  // Thin rule
  doc.setDrawColor(...GREEN_MID);
  doc.setLineWidth(0.4);
  doc.line(M, 51, PAGE_W - M, 51);

  return 60;
}

// ── Continuation page mini-header ─────────────────────────────────────────────

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
    doc.text(`for ${userName}`, M + 20, 6.2);
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

  const leftText = userName
    ? `COREX  ·  Generated for ${userName}  ·  corexnt.com`
    : "COREX  ·  corexnt.com";
  doc.text(leftText, M, PAGE_H - 7.5);
  doc.text(`Page ${pageNum}`, PAGE_W - M, PAGE_H - 7.5, { align: "right" });
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
  // Pull user name from localStorage if not passed
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

  let y = addHeader(
    doc,
    title,
    "COREX Intelligence Report",
    resolvedName,
  );

  // ── Body ────────────────────────────────────────────────────────────────────
  // Split on double newlines to get paragraphs; detect headings vs. plain text
  const paras = (body || "").split(/\n\n+/).filter((p) => p.trim());

  for (const para of paras) {
    const raw = para.trim();
    const stripped = stripForPDF(raw);

    // Detect list items
    const isBullet  = /^[-*•] /.test(stripped);
    const isNumbered = /^\d+\. /.test(stripped);
    const isSectionHead = /^[A-Z][A-Z\s''&\/\-]{4,}:?\s*$/.test(stripped) && stripped.length < 60;
    const isSubhead = !isBullet && !isNumbered && !isSectionHead && stripped.length < 80 && !stripped.endsWith(".");

    // Check if paragraph contains markdown links
    const hasLinks = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/.test(raw);

    if (isSectionHead) {
      y = checkY(y, 16);
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text(cleanText(stripped), M, y);
      // Underline
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.25);
      doc.line(M, y + 1.5, M + CW, y + 1.5);
      y += 8;
      continue;
    }

    if (isBullet || isNumbered) {
      // Render each line of the paragraph as a list item
      const items = raw.split("\n").filter((l) => l.trim());
      for (const item of items) {
        const itemStripped = stripForPDF(item.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, ""));
        const bullet = isNumbered ? item.match(/^(\d+)\./)?.[1] + "." : "•";
        const lines = doc.splitTextToSize(cleanText(itemStripped), CW - 8);
        y = checkY(y, lines.length * 6 + 4);

        // Bullet / number
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...GREEN);
        doc.text(bullet, M, y + 0.5);

        if (hasLinks) {
          y = writeParsed(doc, item.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, ""), M + 6, y, CW - 8, {
            size: 10, lineH: 6, color: DARK, pageBreakCb: newPage,
          });
        } else {
          y = write(doc, itemStripped, M + 6, y, CW - 8, {
            size: 10, lineH: 6, color: DARK, pageBreakCb: newPage,
          });
        }
        y += 2;
      }
      y += 3;
      continue;
    }

    // Regular paragraph
    const lines = doc.splitTextToSize(cleanText(stripped), CW);
    y = checkY(y, lines.length * 6.2 + 6);

    if (isSubhead && lines.length === 1 && para !== paras[0]) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(...DARK);
      doc.text(cleanText(stripped), M, y);
      y += 9;
    } else if (hasLinks) {
      y = writeParsed(doc, raw, M, y, CW, {
        size: 10.5, lineH: 6.2, color: DARK, pageBreakCb: newPage,
      });
      y += 5;
    } else {
      y = write(doc, stripped, M, y, CW, {
        size: 10.5, lineH: 6.2, color: DARK, pageBreakCb: newPage,
      });
      y += 5;
    }
  }

  // ── Chart ────────────────────────────────────────────────────────────────────
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
      const c = BAR_COLORS[i % BAR_COLORS.length];
      doc.setFillColor(...c);
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

  // ── Action Steps ─────────────────────────────────────────────────────────────
  if (actionSteps.length > 0) {
    y = checkY(y, 50);
    y += 4;
    y = sectionBadge(doc, "ACTION STEPS", y);

    for (let i = 0; i < actionSteps.length; i++) {
      const step = cleanText(stripForPDF(actionSteps[i]));
      const lines = doc.splitTextToSize(step, CW - 16);
      const blockH = lines.length * 6 + 12;
      y = checkY(y, blockH);

      // Number circle
      doc.setFillColor(...GREEN);
      doc.circle(M + 5, y + 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(String(i + 1), M + 5, y + 5.5, { align: "center" });

      // Step text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      lines.forEach((l, li) => {
        doc.text(l, M + 13, y + (li === 0 ? 5.5 : 5.5 + li * 6));
      });

      // Connector line
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

  // ── Real Example ─────────────────────────────────────────────────────────────
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

  // ── Closing COREX card ───────────────────────────────────────────────────────
  y = checkY(y, 32);
  y += 6;
  doc.setFillColor(...GREEN_DARK);
  doc.roundedRect(M, y, CW, 22, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("COREX  —  Creative Intelligence Engine", M + CW / 2, y + 9, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GREEN_MID);
  const closingLine = resolvedName
    ? `This report was generated for ${resolvedName}  ·  corexnt.com`
    : "Generated by COREX  ·  corexnt.com";
  doc.text(closingLine, M + CW / 2, y + 16, { align: "center" });

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
    const lines = doc.splitTextToSize(cleanText(value), CW);
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
      doc.text(cleanText(kpi), M + 8, y);
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

  // Closing card
  y = checkY(y, 28);
  y += 6;
  doc.setFillColor(...GREEN_DARK);
  doc.roundedRect(M, y, CW, 18, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("COREX  —  Creative Intelligence Engine", M + CW / 2, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREEN_MID);
  const msg = resolvedName
    ? `Campaign brief generated for ${resolvedName}  ·  corexnt.com`
    : "Generated by COREX  ·  corexnt.com";
  doc.text(msg, M + CW / 2, y + 14, { align: "center" });

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
  const COLS = {
    date: M,
    platform: M + 26,
    format: M + 56,
    hook: M + 86,
    status: PAGE_W - M - 24,
  };

  const drawTableHeader = (y) => {
    doc.setFillColor(...GREEN_DARK);
    doc.rect(M, y, CW, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    [
      ["DATE", COLS.date],
      ["PLATFORM", COLS.platform],
      ["FORMAT", COLS.format],
      ["HOOK / IDEA", COLS.hook],
      ["STATUS", COLS.status],
    ].forEach(([label, x]) => { doc.text(label, x + 1.5, y + 6); });
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

    const hookRaw = cleanText(post.hook || "");
    const hook = hookRaw.length > 55 ? hookRaw.slice(0, 53) + "…" : hookRaw;
    doc.text(hook, COLS.hook + 1.5, y + 7.5);

    // Status chip
    const statusColors = {
      Draft:     { bg: GREEN_PALE,       fg: DARK  },
      Scheduled: { bg: [224, 242, 254],  fg: [2, 132, 199] },
      Published: { bg: GREEN_PALE,       fg: GREEN },
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

  // Closing card
  y += 10;
  if (y + 22 > PAGE_H - 18) {
    addFooter(doc, pageNum, resolvedName);
    doc.addPage();
    pageNum++;
    y = addMiniHeader(doc, resolvedName);
  }
  doc.setFillColor(...GREEN_DARK);
  doc.roundedRect(M, y, CW, 18, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("COREX  —  Creative Intelligence Engine", M + CW / 2, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREEN_MID);
  const calMsg = resolvedName
    ? `Content calendar generated for ${resolvedName}  ·  corexnt.com`
    : "Generated by COREX  ·  corexnt.com";
  doc.text(calMsg, M + CW / 2, y + 14, { align: "center" });

  addFooter(doc, pageNum, resolvedName);

  const safeName = resolvedName ? `-${resolvedName.replace(/\s+/g, "-").toLowerCase()}` : "";
  doc.save(`corex-content-calendar${safeName}-${Date.now()}.pdf`);
}
