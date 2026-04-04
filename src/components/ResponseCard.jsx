import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Copy, RefreshCw, CheckCircle, Sparkles } from "lucide-react";
import clsx from "clsx";
import GraphComponent from "./GraphComponent";

/* ── Parse AI text into structured sections ── */
function parseResponse(text) {
  const result = {
    title: "",
    summary: "",
    steps: [],
    graphData: null,
    graphTitle: "Performance Overview",
    raw: text,
  };

  // Extract GRAPH_DATA JSON
  const graphMatch = text.match(/GRAPH_DATA:\s*(\{[^}]+\})/s);
  if (graphMatch) {
    try {
      const parsed = JSON.parse(graphMatch[1]);
      if (parsed.labels && parsed.values) {
        result.graphData = { labels: parsed.labels, values: parsed.values };
        result.graphTitle = parsed.title || "Data Visualization";
      }
    } catch {}
  }

  // Extract "Graph:" flat format: Graph: Reels: 20000 Stories: 15000
  if (!result.graphData) {
    const flatMatch = text.match(/Graph:\s*(.+)/i);
    if (flatMatch) {
      const pairs = flatMatch[1].matchAll(/([A-Za-z0-9 %₹\/\-]+):\s*(\d[\d,]*)/g);
      const labels = [], values = [];
      for (const m of pairs) {
        labels.push(m[1].trim());
        values.push(parseInt(m[2].replace(/,/g, ""), 10));
      }
      if (labels.length >= 2) result.graphData = { labels, values };
    }
  }

  // Extract chips
  const chipsMatch = text.match(/Chips:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\|\s*"([^"]+)"/);
  result.chips = chipsMatch ? [chipsMatch[1], chipsMatch[2], chipsMatch[3]] : [];

  // Clean text — remove GRAPH_DATA block, chips
  let clean = text
    .replace(/GRAPH_DATA:[\s\S]*?(?=\n##|\n\n|$)/, "")
    .replace(/Graph:.*?\n?/gi, "")
    .replace(/Chips:.*$/m, "")
    .trim();

  // Extract ## sections
  const sections = clean.split(/\n##\s+/).filter(Boolean);

  // Try to get summary from first non-## section
  const firstSectionIdx = clean.indexOf("## ");
  if (firstSectionIdx > 0) {
    result.summary = clean.slice(0, firstSectionIdx).replace(/^\*+|\*+$/g, "").trim();
  }

  // Extract title from "## What To Do" or first heading
  for (const sec of sections) {
    const lines = sec.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const heading = lines[0];
    const body = lines.slice(1).join("\n");

    // Use first real heading as title if no explicit title
    if (!result.title && heading.length < 60) {
      result.title = heading;
    }

    // Collect numbered/bulleted steps
    const stepLines = body
      .split("\n")
      .filter((l) => /^(\d+[\.\)]|[-•*])/.test(l.trim()))
      .map((l) => l.replace(/^(\d+[\.\)]|[-•*])\s*/, "").trim())
      .filter(Boolean);

    result.steps.push(...stepLines);

    // First non-trivial body as summary if not set
    if (!result.summary) {
      const para = body.split("\n").find((l) => l.trim() && !/^(\d+[\.\)]|[-•*])/.test(l.trim()));
      if (para) result.summary = para.trim();
    }
  }

  // Fallback: if no structure found, use first 2 sentences as summary
  if (!result.summary && clean.length > 0) {
    result.summary = clean.split(/[.!?]\s+/).slice(0, 2).join(". ").trim();
    if (result.summary && !result.summary.endsWith(".")) result.summary += ".";
  }

  // If no title, derive from query context
  if (!result.title) result.title = "Strategic Overview";

  return result;
}

/* ── Typing animation hook ── */
function useTyping(text, speed = 12) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let pos = 0;
    const id = setInterval(() => {
      pos += 4;
      setDisplayed(text.slice(0, pos));
      if (pos >= text.length) { clearInterval(id); setDisplayed(text); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text]);

  return { displayed, done };
}

/* ── Individual step item ── */
function StepItem({ text, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 py-2"
    >
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-600/20 border border-violet-500/30
        flex items-center justify-center mt-0.5">
        <span className="text-violet-400 text-[10px] font-bold">{index + 1}</span>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
    </motion.div>
  );
}

/* ── Main ResponseCard ── */
export default function ResponseCard({ message, onChip, onRegenerate }) {
  const { role, content, id } = message;
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-lg px-4 py-2.5 rounded-2xl rounded-br-md
          bg-violet-600/20 border border-violet-500/25 text-sm text-zinc-200 leading-relaxed"
          style={{ boxShadow: "0 2px 12px rgba(139,92,246,0.15)" }}>
          {content}
        </div>
      </motion.div>
    );
  }

  // Assistant message
  const parsed = parseResponse(content);
  const { displayed, done } = useTyping(parsed.summary || "", 8);

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* Corex badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md gradient-purple-blue flex items-center justify-center"
          style={{ boxShadow: "0 0 10px rgba(139,92,246,0.4)" }}>
          <Sparkles size={11} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Corex</span>
      </div>

      {/* Card */}
      <motion.div
        whileHover={{ boxShadow: "0 0 0 1px rgba(139,92,246,0.2), 0 8px 32px rgba(139,92,246,0.1)" }}
        transition={{ duration: 0.2 }}
        className="glass rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)" }}
      >
        {/* Top accent line */}
        <div className="h-px w-full gradient-purple-blue opacity-60" />

        <div className="p-5">
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="text-lg font-bold text-white leading-snug mb-2 tracking-tight"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {parsed.title}
          </motion.h2>

          {/* Summary with typing effect */}
          <div className={clsx("text-sm text-zinc-400 leading-relaxed mb-4", !done && "typing-cursor")}>
            {displayed}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06] mb-4" />

          {/* Steps preview (first 2) */}
          {parsed.steps.length > 0 && (
            <div className="space-y-0.5 mb-4">
              {parsed.steps.slice(0, 2).map((step, i) => (
                <StepItem key={i} text={step} index={i} />
              ))}
            </div>
          )}

          {/* Expandable section */}
          {(parsed.steps.length > 2 || parsed.graphData) && (
            <>
              <button
                onClick={() => setExpanded((e) => !e)}
                className="flex items-center gap-2 text-xs font-medium text-violet-400
                  hover:text-violet-300 transition-colors duration-200 mb-2 group"
              >
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <ChevronDown size={14} />
                </motion.div>
                <span>{expanded ? "Show less" : `Show more${parsed.steps.length > 2 ? ` (${parsed.steps.length - 2} more steps)` : ""}`}</span>
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    {/* Remaining steps */}
                    <div className="space-y-0.5 mb-2">
                      {parsed.steps.slice(2).map((step, i) => (
                        <StepItem key={i + 2} text={step} index={i + 2} />
                      ))}
                    </div>

                    {/* Graph */}
                    {parsed.graphData && (
                      <>
                        <div className="h-px bg-white/[0.06] my-4" />
                        <GraphComponent
                          labels={parsed.graphData.labels}
                          values={parsed.graphData.values}
                          title={parsed.graphTitle}
                        />
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Graph always visible if no steps */}
          {parsed.graphData && parsed.steps.length === 0 && (
            <>
              <div className="h-px bg-white/[0.06] mb-4" />
              <GraphComponent
                labels={parsed.graphData.labels}
                values={parsed.graphData.values}
                title={parsed.graphTitle}
              />
            </>
          )}

          {/* Chips */}
          {parsed.chips?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/[0.06]">
              {parsed.chips.map((chip, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onChip(chip)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium
                    text-violet-300 bg-violet-600/10 border border-violet-500/20
                    hover:bg-violet-600/20 hover:border-violet-400/30
                    transition-all duration-200"
                >
                  {chip}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-white/[0.05] bg-white/[0.01]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]
              transition-all duration-200"
          >
            {copied ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]
              transition-all duration-200"
          >
            <RefreshCw size={12} />
            Regenerate
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
