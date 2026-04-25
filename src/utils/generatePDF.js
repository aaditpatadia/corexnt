import { jsPDF } from "jspdf";

// ── Constants ─────────────────────────────────────────────────────────────────
const GREEN      = [26, 122, 60];
const GREEN_PALE = [232, 245, 238];
const GREEN_MID  = [200, 230, 212];
const GREEN_DARK = [18, 90, 44];
const DARK       = [26, 26, 26];
const GREY       = [85, 85, 85];
const MUTED      = [150, 150, 150];
const BORDER     = [228, 228, 224];
const BLUE       = [34, 111, 247];
const ORANGE     = [249, 115, 22];
const TEAL       = [20, 184, 166];
const PURPLE     = [168, 85, 247];
const PINK       = [244, 63, 94];
const YELLOW     = [234, 179, 8];

const BAR_COLORS = [ORANGE, TEAL, YELLOW, PURPLE, PINK, GREEN];
const PAGE_W = 210;
const PAGE_H = 297;
const M  = 16;              // left/right margin
const CW = PAGE_W - M * 2; // usable content width

const LH     = 5.8;   // standard line height (mm)
const LH_SM  = 5.2;   // tight line height for small text
const BODY_SZ = 10;   // body font size
const SM_SZ   = 8.5;  // small font size

// ── Helpers ───────────────────────────────────────────────────────────────────

function clean(str = "") {
  return str
    .replace(/₹/g, "Rs.")
    .replace(/[""]/g, '"').replace(/['']/g, "'")
    .replace(/—/g, " - ").replace(/–/g, "-")
    .replace(/…/g, "...").replace(/[^\x00-\x7F]/g, () => " ");
}

function strip(text = "") {
  return text
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1")
    .replace(/\*\*/g, "").replace(/\*/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/`+([^`]*)`+/g, "$1")
    .trim();
}

/** Extract all hyperlinks from markdown text */
function extractLinks(text = "") {
  const seen = new Set();
  const out  = [];
  let m;
  const md = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  while ((m = md.exec(text)) !== null) {
    if (!seen.has(m[2])) { seen.add(m[2]); out.push({ label: clean(m[1]), url: m[2] }); }
  }
  const bare = /(?<!\()(https?:\/\/[^\s)"'<>]+)/g;
  while ((m = bare.exec(text)) !== null) {
    if (!seen.has(m[1])) { seen.add(m[1]); out.push({ label: m[1], url: m[1] }); }
  }
  return out;
}

// ── Core line-by-line renderer ────────────────────────────────────────────────
// This is the only text rendering function. It iterates lines, wraps each,
// checks page bounds before EVERY line — impossible to collide.

class Pen {
  constructor(doc, newPageFn) {
    this.doc    = doc;
    this.newPage = newPageFn;
    this.y      = 0;
  }

  // ── Low-level: write one physical line at current y, advance ──
  _line(text, x, { size = BODY_SZ, font = "normal", color = DARK } = {}) {
    if (this.y + LH > PAGE_H - 16) this.y = this.newPage();
    this.doc.setFont("helvetica", font);
    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);
    this.doc.text(clean(text), x, this.y);
    this.y += LH;
  }

  // ── Write wrapped text block, return Pen for chaining ──
  write(text, x = M, maxW = CW, opts = {}) {
    const lines = this.doc.splitTextToSize(clean(text), maxW);
    for (const l of lines) this._line(l, x, opts);
    return this;
  }

  gap(mm = 3) { this.y += mm; return this; }

  rule(color = BORDER) {
    if (this.y + 3 > PAGE_H - 16) this.y = this.newPage();
    this.doc.setDrawColor(...color);
    this.doc.setLineWidth(0.25);
    this.doc.line(M, this.y, PAGE_W - M, this.y);
    this.y += 4;
    return this;
  }

  sectionLabel(text) {
    this.gap(5);
    if (this.y + 10 > PAGE_H - 16) this.y = this.newPage();
    this.doc.setFillColor(...GREEN);
    this.doc.rect(M, this.y - 1, 3, 6, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...GREEN);
    this.doc.text(text, M + 6, this.y + 4);
    this.y += 10;
    return this;
  }

  // ── Render a full body string (the main AI response text) ──
  renderBody(body) {
    if (!body) return this;
    const rawLines = body.split("\n");
    let inList = false;

    for (const raw of rawLines) {
      const line = strip(raw).trimEnd();

      // Blank line — small gap
      if (!line) {
        if (inList) { this.y += 1; } else { this.y += 3; }
        inList = false;
        continue;
      }

      // ── Markdown header (##, ###) ──
      const h3m = line.match(/^#{2,3} (.+)/);
      const h4m = line.match(/^#{4,6} (.+)/);
      if (h3m) {
        inList = false;
        this.gap(4);
        if (this.y + 8 > PAGE_H - 16) this.y = this.newPage();
        this.doc.setDrawColor(...GREEN_MID);
        this.doc.setLineWidth(0.3);
        this.doc.line(M, this.y + 5, M + CW, this.y + 5);
        this._line(clean(h3m[1]), M, { size: 12, font: "bold", color: DARK });
        this.y += 1;
        continue;
      }
      if (h4m) {
        inList = false;
        this.gap(3);
        this._line(clean(h4m[1]).toUpperCase(), M, { size: 8, font: "bold", color: MUTED });
        continue;
      }

      // ── Numbered list item ──
      const numM = line.match(/^(\d{1,2})\. (.+)/);
      if (numM) {
        inList = true;
        if (this.y + LH > PAGE_H - 16) this.y = this.newPage();
        // Number badge
        this.doc.setFillColor(...GREEN);
        this.doc.roundedRect(M, this.y - 3.5, 6.5, 5.5, 1, 1, "F");
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(7.5);
        this.doc.setTextColor(255, 255, 255);
        this.doc.text(numM[1], M + 3.25, this.y + 0.5, { align: "center" });
        // Item text
        const itemLines = this.doc.splitTextToSize(clean(numM[2]), CW - 10);
        for (let li = 0; li < itemLines.length; li++) {
          if (this.y + LH > PAGE_H - 16) this.y = this.newPage();
          this.doc.setFont("helvetica", li === 0 ? "bold" : "normal");
          this.doc.setFontSize(BODY_SZ);
          this.doc.setTextColor(...DARK);
          this.doc.text(itemLines[li], M + 9, this.y);
          this.y += LH;
        }
        this.y += 1;
        continue;
      }

      // ── Bullet item (-, *, •) ──
      const bulM = line.match(/^[-*•]\s+(.+)/);
      if (bulM) {
        inList = true;
        if (this.y + LH > PAGE_H - 16) this.y = this.newPage();
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(11);
        this.doc.setTextColor(...GREEN);
        this.doc.text("·", M + 1.5, this.y);
        const bulLines = this.doc.splitTextToSize(clean(bulM[1]), CW - 8);
        for (let li = 0; li < bulLines.length; li++) {
          if (this.y + LH > PAGE_H - 16) this.y = this.newPage();
          this.doc.setFont("helvetica", "normal");
          this.doc.setFontSize(BODY_SZ);
          this.doc.setTextColor(...DARK);
          this.doc.text(bulLines[li], M + 7, this.y);
          this.y += LH;
        }
        this.y += 0.5;
        continue;
      }

      // ── ALL-CAPS section label ──
      if (/^[A-Z][A-Z &':\/\-]{3,}:?\s*$/.test(line)) {
        inList = false;
        this.gap(3);
        this.doc.setDrawColor(...BORDER);
        this.doc.setLineWidth(0.2);
        this.doc.line(M, this.y, M + CW, this.y);
        this.y += 3;
        this._line(line, M, { size: 8, font: "bold", color: MUTED });
        this.y += 1;
        continue;
      }

      // ── Horizontal rule ──
      if (/^-{3,}$/.test(line)) { inList = false; this.rule(); continue; }

      // ── Bold-only subheading (short line, no period) ──
      if (line.length < 70 && !line.endsWith(".") && !line.endsWith(",") && !inList) {
        const wrapped = this.doc.splitTextToSize(clean(line), CW);
        if (wrapped.length === 1) {
          inList = false;
          this.gap(2);
          this._line(line, M, { size: BODY_SZ + 1, font: "bold", color: DARK });
          this.y += 1;
          continue;
        }
      }

      // ── Regular paragraph line ──
      inList = false;
      this.write(line, M, CW, { size: BODY_SZ, font: "normal", color: DARK });
    }

    return this;
  }
}

// ── Page chrome ───────────────────────────────────────────────────────────────

function drawHeader(doc, title, subtitle, userName) {
  // Top bar
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, PAGE_W, 17, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("COREX", M, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREEN_MID);
  doc.text("Creative Intelligence Engine", M + 31, 12);
  // Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 230, 212);
  doc.text(
    new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    PAGE_W - M, 12, { align: "right" }
  );

  // Title block
  doc.setFillColor(...GREEN_PALE);
  doc.rect(0, 17, PAGE_W, 36, "F");

  const titleLines = doc.splitTextToSize(clean(title || "COREX Report"), CW - 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  let ty = 30;
  titleLines.slice(0, 2).forEach(l => { doc.text(l, M, ty); ty += 9; });

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text(clean(subtitle), M, 49);
  }

  // "For USER" pill
  if (userName) {
    const tag = `For  ${userName}`;
    doc.setFillColor(...GREEN);
    doc.roundedRect(PAGE_W - M - 58, 38, 56, 8, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(clean(tag), PAGE_W - M - 30, 43.5, { align: "center" });
  }

  // Rule
  doc.setDrawColor(...GREEN_MID);
  doc.setLineWidth(0.4);
  doc.line(M, 54, PAGE_W - M, 54);

  return 62; // starting Y for content
}

function drawMiniHeader(doc, userName) {
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, PAGE_W, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("COREX", M, 6.5);
  if (userName) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GREEN_MID);
    doc.text(`for  ${userName}`, M + 22, 6.5);
  }
  return 17;
}

function drawFooter(doc, pageNum, userName) {
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.25);
  doc.line(M, PAGE_H - 12, PAGE_W - M, PAGE_H - 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(
    userName ? `COREX  ·  for ${userName}  ·  corexnt.com` : "COREX  ·  corexnt.com",
    M, PAGE_H - 7
  );
  doc.text(`Page ${pageNum}`, PAGE_W - M, PAGE_H - 7, { align: "right" });
}

function drawClosingCard(doc, y) {
  if (y + 26 > PAGE_H - 16) return y;
  y += 8;
  doc.setFillColor(...GREEN_DARK);
  doc.roundedRect(M, y, CW, 18, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text("COREX  —  Creative Intelligence Engine", M + CW / 2, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREEN_MID);
  doc.text("corexnt.com", M + CW / 2, y + 14, { align: "center" });
  return y + 18;
}

// ── References section ────────────────────────────────────────────────────────

function drawLinksSection(pen, links) {
  if (!links || links.length === 0) return;
  pen.sectionLabel("LINKS & REFERENCES");
  links.forEach((link, i) => {
    pen.gap(1);
    if (pen.y + LH * 2 + 2 > PAGE_H - 16) pen.y = pen.newPage();

    // Number circle
    pen.doc.setFillColor(...BLUE);
    pen.doc.circle(M + 3, pen.y - 1, 2.8, "F");
    pen.doc.setFont("helvetica", "bold");
    pen.doc.setFontSize(7);
    pen.doc.setTextColor(255, 255, 255);
    pen.doc.text(String(i + 1), M + 3, pen.y + 0.5, { align: "center" });

    // Label
    const label = link.label.length > 65 ? link.label.slice(0, 63) + "…" : link.label;
    pen.doc.setFont("helvetica", "bold");
    pen.doc.setFontSize(SM_SZ);
    pen.doc.setTextColor(...DARK);
    pen.doc.text(clean(label), M + 8, pen.y);
    pen.y += LH_SM;

    // URL (clickable)
    if (pen.y + LH_SM > PAGE_H - 16) pen.y = pen.newPage();
    const urlText = link.url.length > 75 ? link.url.slice(0, 73) + "…" : link.url;
    pen.doc.setFont("helvetica", "normal");
    pen.doc.setFontSize(7.5);
    pen.doc.setTextColor(...BLUE);
    pen.doc.text(urlText, M + 8, pen.y);
    const urlW = pen.doc.getStringUnitWidth(urlText) * 7.5 / pen.doc.internal.scaleFactor;
    pen.doc.setDrawColor(...BLUE);
    pen.doc.setLineWidth(0.2);
    pen.doc.line(M + 8, pen.y + 0.8, M + 8 + urlW, pen.y + 0.8);
    pen.doc.link(M + 8, pen.y - 3.5, urlW + 1, 5, { url: link.url });
    pen.y += LH_SM + 2;
  });
}

// ── 1. Response PDF ───────────────────────────────────────────────────────────

export function generateResponsePDF({
  title, body, actionSteps = [], realExample = "",
  graphData = null, chartImage = null, userName = "",
}) {
  const name = userName
    || localStorage.getItem("corex_user_name")
    || localStorage.getItem("userName")
    || "";

  const links = extractLinks(body || "");
  const doc   = new jsPDF({ unit: "mm", format: "a4" });
  let pageNum = 1;

  const newPage = () => {
    drawFooter(doc, pageNum, name);
    doc.addPage();
    pageNum++;
    return drawMiniHeader(doc, name);
  };

  const pen = new Pen(doc, newPage);
  pen.y = drawHeader(doc, title, "COREX Intelligence Report", name);

  // ── Body ──────────────────────────────────────────────────────────────────
  pen.renderBody(body || "");

  // ── Chart ─────────────────────────────────────────────────────────────────
  if (chartImage) {
    pen.sectionLabel("DATA VISUALISATION");
    const chartH = 70;
    if (pen.y + chartH > PAGE_H - 16) pen.y = newPage();
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.35);
    doc.roundedRect(M, pen.y, CW, chartH, 3, 3, "FD");
    if (graphData?.title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...GREY);
      doc.text(clean(graphData.title), M + CW / 2, pen.y + 8, { align: "center" });
    }
    try { doc.addImage(chartImage, "PNG", M + 4, pen.y + 12, CW - 8, chartH - 16); } catch {}
    pen.y += chartH + 6;

  } else if (graphData?.labels && graphData?.values?.length > 0) {
    pen.sectionLabel("DATA SNAPSHOT");
    const vals    = graphData.values;
    const labels  = graphData.labels;
    const maxVal  = Math.max(...vals, 1);
    const chartH  = 60;
    if (pen.y + chartH + 14 > PAGE_H - 16) pen.y = newPage();
    const aY = pen.y + 4;
    doc.setFillColor(250, 252, 250);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.25);
    doc.roundedRect(M, aY, CW, chartH + 14, 3, 3, "FD");
    if (graphData.title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...GREY);
      doc.text(clean(graphData.title), M + CW / 2, aY + 8, { align: "center" });
    }
    const barArea = CW - 8;
    const barW    = Math.min(16, barArea / vals.length - 3);
    const barSp   = barArea / vals.length;
    vals.forEach((val, i) => {
      const bH  = (val / maxVal) * (chartH - 14);
      const bx  = M + 4 + i * barSp + (barSp - barW) / 2;
      const by  = aY + chartH - bH - 2;
      doc.setFillColor(...BAR_COLORS[i % BAR_COLORS.length]);
      doc.roundedRect(bx, by, barW, bH, 1.2, 1.2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...DARK);
      doc.text(String(val), bx + barW / 2, by - 1.5, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(...GREY);
      const lbl = doc.splitTextToSize(clean(labels[i] || ""), barSp - 2);
      lbl.slice(0, 2).forEach((l, li) => {
        doc.text(l, bx + barW / 2, aY + chartH + 3 + li * 4, { align: "center" });
      });
    });
    pen.y = aY + chartH + 18;
  }

  // ── Action Steps ──────────────────────────────────────────────────────────
  if (actionSteps.length > 0) {
    pen.sectionLabel("ACTION STEPS");
    actionSteps.forEach((step, i) => {
      const txt   = clean(strip(step));
      const lines = doc.splitTextToSize(txt, CW - 14);
      const bH    = lines.length * LH + 10;
      if (pen.y + bH > PAGE_H - 16) pen.y = newPage();

      doc.setFillColor(...GREEN);
      doc.circle(M + 5, pen.y + 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(String(i + 1), M + 5, pen.y + 5.5, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(BODY_SZ);
      doc.setTextColor(...DARK);
      lines.forEach((l, li) => { doc.text(l, M + 12, pen.y + (li === 0 ? 5.5 : 5.5 + li * LH)); });

      if (i < actionSteps.length - 1) {
        doc.setDrawColor(...GREEN_MID);
        doc.setLineWidth(0.4);
        doc.setLineDashPattern([1, 2], 0);
        doc.line(M + 5, pen.y + 8, M + 5, pen.y + bH - 2);
        doc.setLineDashPattern([], 0);
      }
      pen.y += bH;
    });
    pen.gap(4);
  }

  // ── Real Example ──────────────────────────────────────────────────────────
  if (realExample) {
    const ex   = clean(strip(realExample));
    const exL  = doc.splitTextToSize(ex, CW - 10);
    const exH  = exL.length * LH + 14;
    pen.sectionLabel("REAL EXAMPLE");
    if (pen.y + exH > PAGE_H - 16) pen.y = newPage();
    doc.setFillColor(...GREEN);
    doc.rect(M, pen.y, 3, exH, "F");
    doc.setFillColor(248, 252, 249);
    doc.setDrawColor(...GREEN_MID);
    doc.setLineWidth(0.25);
    doc.rect(M + 3, pen.y, CW - 3, exH, "FD");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(BODY_SZ);
    doc.setTextColor(...GREY);
    exL.forEach((l, li) => { doc.text(l, M + 8, pen.y + 9 + li * LH); });
    pen.y += exH + 5;
  }

  // ── Links ─────────────────────────────────────────────────────────────────
  drawLinksSection(pen, links);

  // ── Closing card ──────────────────────────────────────────────────────────
  pen.gap(6);
  drawClosingCard(doc, pen.y);
  drawFooter(doc, pageNum, name);

  const slug = name ? `-${name.replace(/\s+/g, "-").toLowerCase()}` : "";
  doc.save(`corex-report${slug}-${Date.now()}.pdf`);
}

// ── 2. Campaign Brief PDF ─────────────────────────────────────────────────────

export function generateCampaignBriefPDF({
  brandName = "Brand", campaignName = "Campaign",
  objective, audience, message, channels = [],
  timeline, budget, kpis = [], influencerTiers = [],
  userName = "",
}) {
  const name = userName
    || localStorage.getItem("corex_user_name")
    || localStorage.getItem("userName")
    || "";

  const doc   = new jsPDF({ unit: "mm", format: "a4" });
  let pageNum = 1;
  const newPage = () => { drawFooter(doc, pageNum, name); doc.addPage(); pageNum++; return drawMiniHeader(doc, name); };
  const pen = new Pen(doc, newPage);
  pen.y = drawHeader(doc, campaignName, `Campaign Brief  ·  ${brandName}`, name);

  const field = (label, value) => {
    if (!value) return;
    pen.gap(3);
    pen._line(label.toUpperCase(), M, { size: 7.5, font: "bold", color: MUTED });
    pen.write(clean(strip(value)), M, CW, { size: BODY_SZ, font: "normal", color: DARK });
  };

  pen.sectionLabel("CAMPAIGN OVERVIEW");
  field("Objective", objective);
  field("Target Audience", audience);
  field("Core Message", message);
  field("Timeline", timeline);
  field("Budget", budget);

  if (channels.length > 0) {
    pen.sectionLabel("CHANNEL MIX");
    const cols = 3, colW = CW / cols;
    channels.forEach((ch, i) => {
      const col = i % cols;
      if (col === 0 && pen.y + 12 > PAGE_H - 16) pen.y = newPage();
      const cx = M + col * colW;
      doc.setFillColor(...GREEN_PALE);
      doc.roundedRect(cx, pen.y - 3, colW - 4, 10, 2, 2, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text(clean(ch), cx + 4, pen.y + 3.5);
      if (col === cols - 1 || i === channels.length - 1) pen.y += 12;
    });
    pen.gap(4);
  }

  if (kpis.length > 0) {
    pen.sectionLabel("KEY PERFORMANCE INDICATORS");
    kpis.forEach(kpi => {
      if (pen.y + LH > PAGE_H - 16) pen.y = newPage();
      doc.setFillColor(...GREEN);
      doc.circle(M + 3, pen.y - 1, 1.8, "F");
      pen._line(clean(strip(kpi)), M + 7.5, { size: BODY_SZ, color: DARK });
    });
    pen.gap(4);
  }

  if (influencerTiers.length > 0) {
    pen.sectionLabel("INFLUENCER STRATEGY");
    influencerTiers.forEach(tier => {
      if (pen.y + 11 > PAGE_H - 16) pen.y = newPage();
      doc.setFillColor(...GREEN_PALE);
      doc.roundedRect(M, pen.y - 2, CW, 9.5, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text(clean(tier.name || ""), M + 4, pen.y + 4);
      if (tier.count) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GREY);
        doc.text(`${tier.count} creators`, M + 80, pen.y + 4);
      }
      if (tier.budget) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...GREEN);
        doc.text(clean(tier.budget), PAGE_W - M - 4, pen.y + 4, { align: "right" });
      }
      pen.y += 12;
    });
  }

  pen.gap(8);
  drawClosingCard(doc, pen.y);
  drawFooter(doc, pageNum, name);
  const slug = name ? `-${name.replace(/\s+/g, "-").toLowerCase()}` : "";
  doc.save(`corex-campaign-brief${slug}-${Date.now()}.pdf`);
}

// ── 3. Content Calendar PDF ───────────────────────────────────────────────────

export function generateContentCalendarPDF({ brandName = "Brand", month = "", posts = [], userName = "" }) {
  const name = userName
    || localStorage.getItem("corex_user_name")
    || localStorage.getItem("userName")
    || "";

  const doc   = new jsPDF({ unit: "mm", format: "a4" });
  let pageNum = 1;
  const newPage = () => { drawFooter(doc, pageNum, name); doc.addPage(); pageNum++; return drawMiniHeader(doc, name); };
  let y = drawHeader(doc, `Content Calendar${month ? `  —  ${month}` : ""}`, `Planned for  ${brandName}`, name);

  const ROW_H = 11;
  const C = { date: M, platform: M + 24, format: M + 52, hook: M + 82, status: PAGE_W - M - 24 };

  const tableHeader = (y) => {
    doc.setFillColor(...GREEN_DARK);
    doc.rect(M, y, CW, 8.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    [["DATE", C.date], ["PLATFORM", C.platform], ["FORMAT", C.format], ["HOOK / IDEA", C.hook], ["STATUS", C.status]]
      .forEach(([l, x]) => doc.text(l, x + 1.5, y + 5.5));
    return y + 8.5;
  };

  y = tableHeader(y);

  posts.forEach((post, i) => {
    if (y + ROW_H > PAGE_H - 14) { y = newPage(); y = tableHeader(y); }
    if (i % 2 === 0) { doc.setFillColor(248, 252, 249); doc.rect(M, y, CW, ROW_H, "F"); }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK);
    doc.text(clean(post.date || ""), C.date + 1.5, y + 7);
    doc.text(clean(post.platform || ""), C.platform + 1.5, y + 7);
    doc.text(clean(post.format || ""), C.format + 1.5, y + 7);
    const hook = clean(strip(post.hook || ""));
    doc.text(hook.length > 52 ? hook.slice(0, 50) + "…" : hook, C.hook + 1.5, y + 7);
    const sc = { Draft: [GREEN_PALE, DARK], Scheduled: [[224,242,254],[2,132,199]], Published: [GREEN_PALE, GREEN] }[post.status] || [GREEN_PALE, DARK];
    doc.setFillColor(...sc[0]);
    doc.roundedRect(C.status, y + 2, 22, 6, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...sc[1]);
    doc.text(post.status || "Draft", C.status + 11, y + 6.2, { align: "center" });
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.18);
    doc.line(M, y + ROW_H, M + CW, y + ROW_H);
    y += ROW_H;
  });

  y += 10;
  drawClosingCard(doc, y);
  drawFooter(doc, pageNum, name);
  const slug = name ? `-${name.replace(/\s+/g, "-").toLowerCase()}` : "";
  doc.save(`corex-content-calendar${slug}-${Date.now()}.pdf`);
}
