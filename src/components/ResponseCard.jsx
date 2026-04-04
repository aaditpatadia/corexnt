import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, RefreshCw, CheckCircle, ThumbsUp, ThumbsDown, Share2, ChevronDown, Sparkles } from "lucide-react";
import GraphComponent from "./GraphComponent";

/* ── Parse the structured AI response ── */
function parseResponse(raw) {
  const result = {
    title: "Strategic Overview",
    summary: "",
    sections: [],
    steps: [],
    graphData: null,
    graphTitle: "Performance Overview",
    chips: [],
    raw,
  };

  // Extract GRAPH_DATA
  const graphMatch = raw.match(/GRAPH_DATA:\s*(\{[\s\S]*?\})\s*(?:\n|$)/);
  if (graphMatch) {
    try {
      const gd = JSON.parse(graphMatch[1]);
      if (gd.labels && gd.values) {
        result.graphData = { labels: gd.labels, values: gd.values };
        result.graphTitle = gd.title || "Data Overview";
      }
    } catch {}
  }

  // Fallback: flat Graph: format
  if (!result.graphData) {
    const flatMatch = raw.match(/Graph:\s*(.+)/i);
    if (flatMatch) {
      const pairs = [...flatMatch[1].matchAll(/([A-Za-z0-9 %₹\/\-]+):\s*(\d[\d,]*)/g)];
      if (pairs.length >= 2) {
        result.graphData = {
          labels: pairs.map((p) => p[1].trim()),
          values: pairs.map((p) => parseInt(p[2].replace(/,/g, ""), 10)),
        };
      }
    }
  }

  // Extract Chips (single or double quotes)
  const chipsMatch = raw.match(/Chips:\s*['"](.+?)['"]\s*\|\s*['"](.+?)['"]\s*\|\s*['"](.+?)['"]/);
  if (chipsMatch) {
    result.chips = [chipsMatch[1], chipsMatch[2], chipsMatch[3]];
  } else {
    // Alternative: Chips: 'a' | 'b' | 'c' without strict quotes
    const altChips = raw.match(/Chips:\s*(.+?)(?:\n|$)/);
    if (altChips) {
      result.chips = altChips[1]
        .split("|")
        .map((c) => c.trim().replace(/^['"`]|['"`]$/g, "").trim())
        .filter((c) => c.length > 0)
        .slice(0, 3);
    }
  }

  // Clean text
  let clean = raw
    .replace(/GRAPH_DATA:\s*\{[\s\S]*?\}\s*(?:\n|$)/g, "")
    .replace(/Graph:.*?\n?/gi, "")
    .replace(/Chips:.*$/m, "")
    .trim();

  // Parse sections by ## headings
  const parts = clean.split(/\n(?=##\s)/);
  for (const part of parts) {
    const lines = part.trim().split("\n").filter(Boolean);
    if (!lines.length) continue;

    if (lines[0].startsWith("## ")) {
      const heading = lines[0].slice(3).trim();
      const body = lines.slice(1).join("\n").trim();
      result.sections.push({ heading, body });

      if (!result.title || result.title === "Strategic Overview") {
        result.title = heading;
      }
    } else {
      // Content before first ## is the summary
      if (!result.summary) {
        result.summary = lines.join(" ").trim();
      }
    }
  }

  // Extract numbered steps from "Action Steps" section
  const actionSection = result.sections.find((s) =>
    s.heading.toLowerCase().includes("action") || s.heading.toLowerCase().includes("step")
  );
  if (actionSection) {
    result.steps = actionSection.body
      .split("\n")
      .filter((l) => /^\d+[\.\)]/.test(l.trim()))
      .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter(Boolean);
  }

  // Fallback summary
  if (!result.summary && result.sections.length) {
    const firstSec = result.sections.find((s) => s.body);
    if (firstSec) {
      result.summary = firstSec.body.split("\n")[0].trim();
    }
  }

  return result;
}

/* ── Typewriter hook ── */
function useTypewriter(text, speed = 10, enabled = true) {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const [done, setDone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) { setDisplayed(text); setDone(true); return; }
    setDisplayed("");
    setDone(false);
    let pos = 0;
    const id = setInterval(() => {
      pos += 3;
      setDisplayed(text.slice(0, pos));
      if (pos >= text.length) {
        clearInterval(id);
        setDisplayed(text);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, enabled]);

  return { displayed, done };
}

/* ── Step row ── */
function StepItem({ text, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 py-2"
    >
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-600/20 border border-violet-500/30
        flex items-center justify-center mt-0.5">
        <span className="text-violet-400 font-bold" style={{ fontSize: 10 }}>{index + 1}</span>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
    </motion.div>
  );
}

/* ── Section block ── */
function Section({ heading, body }) {
  // Skip Action Steps (rendered as StepItems)
  if (heading.toLowerCase().includes("action") && heading.toLowerCase().includes("step")) return null;

  const lines = body.split("\n").filter(Boolean);

  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">{heading}</h4>
      <div className="space-y-1.5">
        {lines.map((line, i) => (
          <p key={i} className="text-sm text-zinc-400 leading-relaxed">{line}</p>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function ResponseCard({ message, onChip, onRegenerate, animate = false }) {
  const { role, content } = message;
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null); // null | 'up' | 'down'

  if (role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div
          className="max-w-lg px-4 py-3 rounded-2xl rounded-br-md text-sm text-zinc-200 leading-relaxed"
          style={{
            background: "rgba(124,58,237,0.18)",
            border: "1px solid rgba(124,58,237,0.25)",
            boxShadow: "0 2px 12px rgba(124,58,237,0.12)",
          }}
        >
          {content}
        </div>
      </motion.div>
    );
  }

  // Assistant
  const parsed = parseResponse(content);
  const { displayed, done } = useTypewriter(parsed.summary || "", 10, animate);

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasMore = parsed.steps.length > 2 || parsed.sections.length > 1 || parsed.graphData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* Corex label */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-xl gradient-purple-blue flex items-center justify-center"
          style={{ boxShadow: "0 0 12px rgba(124,58,237,0.45)", fontFamily: "Sora, sans-serif" }}
        >
          <span className="text-white font-bold text-xs">CX</span>
        </div>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Corex</span>
      </div>

      {/* Card */}
      <motion.div
        whileHover={{ boxShadow: "0 0 0 1px rgba(124,58,237,0.2), 0 8px 40px rgba(124,58,237,0.1)" }}
        transition={{ duration: 0.2 }}
        className="glass rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)" }}
      >
        {/* Top accent */}
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg,#7c3aed,#6366f1,#3b82f6)" }} />

        <div className="p-5">
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="text-lg font-bold text-white leading-snug mb-2 tracking-tight"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            {parsed.title}
          </motion.h2>

          {/* Summary typewriter */}
          {parsed.summary && (
            <div className={`text-sm text-zinc-400 leading-relaxed mb-4 ${!done && animate ? "typing-cursor" : ""}`}>
              {animate ? displayed : parsed.summary}
            </div>
          )}

          <div className="h-px bg-white/[0.06] mb-4" />

          {/* Steps (first 2) */}
          {parsed.steps.length > 0 && (
            <div className="mb-2">
              <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Action Steps</h4>
              <div>
                {parsed.steps.slice(0, 2).map((step, i) => (
                  <StepItem key={i} text={step} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Expand toggle */}
          {hasMore && (
            <>
              <button
                onClick={() => setExpanded((e) => !e)}
                className="flex items-center gap-1.5 text-xs font-medium text-violet-400
                  hover:text-violet-300 transition-colors mt-3 mb-2"
              >
                <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.22 }}>
                  <ChevronDown size={13} />
                </motion.span>
                {expanded ? "Show less" : `Show full response${parsed.steps.length > 2 ? ` (${parsed.steps.length - 2} more steps)` : ""}`}
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
                    {parsed.steps.slice(2).map((step, i) => (
                      <StepItem key={i + 2} text={step} index={i + 2} />
                    ))}

                    {/* Other sections */}
                    {parsed.sections.map((sec, i) => (
                      <Section key={i} heading={sec.heading} body={sec.body} />
                    ))}

                    {/* Graph */}
                    {parsed.graphData && (
                      <div className="mt-4">
                        <div className="h-px bg-white/[0.06] mb-4" />
                        <GraphComponent
                          labels={parsed.graphData.labels}
                          values={parsed.graphData.values}
                          title={parsed.graphTitle}
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Graph always shown if no steps and no expandable */}
          {parsed.graphData && !hasMore && (
            <>
              <div className="h-px bg-white/[0.06] mb-4" />
              <GraphComponent
                labels={parsed.graphData.labels}
                values={parsed.graphData.values}
                title={parsed.graphTitle}
              />
            </>
          )}

          {/* Follow-up chips */}
          {parsed.chips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/[0.06]">
              {parsed.chips.map((chip, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onChip(chip)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium
                    text-violet-300 border border-violet-500/20 bg-violet-600/10
                    hover:bg-violet-600/20 hover:border-violet-400/35
                    transition-all duration-200"
                >
                  {chip}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-1 px-5 py-3 border-t border-white/[0.05] bg-white/[0.015]">
          <ActionBtn onClick={copy} icon={copied ? <CheckCircle size={13} className="text-emerald-400" /> : <Copy size={13} />} label={copied ? "Copied!" : "Copy"} />
          <ActionBtn onClick={onRegenerate} icon={<RefreshCw size={13} />} label="Regenerate" />
          <ActionBtn onClick={() => {}} icon={<Share2 size={13} />} label="Share" />

          <div className="flex-1" />

          {/* Thumbs */}
          <button
            onClick={() => setLiked(liked === "up" ? null : "up")}
            className={`p-1.5 rounded-lg transition-all duration-200 ${liked === "up" ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-600 hover:text-zinc-400"}`}
          >
            <ThumbsUp size={13} />
          </button>
          <button
            onClick={() => setLiked(liked === "down" ? null : "down")}
            className={`p-1.5 rounded-lg transition-all duration-200 ${liked === "down" ? "text-red-400 bg-red-500/10" : "text-zinc-600 hover:text-zinc-400"}`}
          >
            <ThumbsDown size={13} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ActionBtn({ onClick, icon, label }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05]
        transition-all duration-200"
    >
      {icon}
      {label}
    </motion.button>
  );
}
