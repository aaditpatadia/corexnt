import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "Just now";
}

function ProjectCard({ project, onContinue, delay }) {
  const [hovered, setHovered] = useState(false);
  const msgCount = project.messages?.length || 0;
  const lastMsg  = project.messages?.slice().reverse().find(m => m.role === "assistant");
  const preview  = lastMsg?.content?.slice(0, 120).replace(/FOLLOWUPS:.*$/m, "").trim() || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 24,
        borderRadius: 20,
        border: `1px solid ${hovered ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)"}`,
        background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onClick={() => onContinue(project)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <h3
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 600,
            fontSize: 15,
            color: "#ffffff",
            lineHeight: 1.4,
            flex: 1,
          }}
        >
          {project.title || "Untitled"}
        </h3>
        <span
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'Instrument Sans', sans-serif",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {timeAgo(project.updatedAt || project.timestamp)}
        </span>
      </div>

      {preview && (
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'Instrument Sans', sans-serif",
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {preview}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <span
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.25)",
            fontFamily: "'Instrument Sans', sans-serif",
          }}
        >
          {msgCount} message{msgCount !== 1 ? "s" : ""}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); onContinue(project); }}
          style={{
            padding: "6px 14px",
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent",
            color: "rgba(255,255,255,0.6)",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'Instrument Sans', sans-serif",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            e.currentTarget.style.color = "rgba(255,255,255,0.6)";
          }}
        >
          Continue →
        </button>
      </div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const navigate  = useNavigate();
  const [projects, setProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem("corex_history") || "[]"); }
    catch { return []; }
  });

  const handleContinue = (project) => {
    if (typeof window.__corex_loadConversation === "function") {
      window.__corex_loadConversation(project);
    }
    navigate("/app/chat");
  };

  const handleNew = () => {
    if (typeof window.__corex_newChat === "function") window.__corex_newChat();
    navigate("/app/chat");
  };

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        background: "#000000",
        padding: "40px 24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: 900, margin: "0 auto" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400,
              fontSize: 36,
              color: "#ffffff",
              margin: 0,
            }}
          >
            Your Projects
          </h1>

          <button
            onClick={handleNew}
            style={{
              padding: "10px 20px",
              borderRadius: 100,
              border: "none",
              background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)",
              color: "#000000",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Instrument Sans', sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            + New Project
          </button>
        </div>

        {/* Empty state */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "80px 24px" }}
          >
            <p
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "'Instrument Sans', sans-serif",
                marginBottom: 24,
              }}
            >
              No projects yet. Start with an idea.
            </p>
            <button
              onClick={handleNew}
              style={{
                padding: "12px 28px",
                borderRadius: 100,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
                fontFamily: "'Instrument Sans', sans-serif",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.color = "#ffffff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            >
              Start your first project →
            </button>
          </motion.div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                onContinue={handleContinue}
                delay={i * 0.05}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
