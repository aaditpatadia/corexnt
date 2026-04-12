import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function getFileIcon(type = "") {
  if (type.startsWith("image/")) return "🖼️";
  if (type.includes("pdf")) return "📄";
  if (type.includes("word") || type.includes("document")) return "📝";
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv")) return "📊";
  if (type.includes("video")) return "🎬";
  if (type.includes("audio")) return "🎵";
  return "📎";
}

function formatSize(b) {
  if (!b) return "";
  if (b > 1024*1024) return `${(b/1024/1024).toFixed(1)} MB`;
  if (b > 1024) return `${(b/1024).toFixed(0)} KB`;
  return `${b} B`;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "Just now";
}

export default function MyResourcesPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("corex_history") || "[]");
      const allFiles = [];
      history.forEach(conv => {
        conv.messages?.forEach(msg => {
          if (msg.files?.length) {
            msg.files.forEach(f => {
              allFiles.push({
                ...f,
                conversationId: conv.id,
                conversationTitle: conv.title || "Untitled",
                addedAt: conv.timestamp || Date.now(),
              });
            });
          }
        });
      });
      setFiles(allFiles.reverse());
    } catch {}
  }, []);

  return (
    <div style={{ height:"100%", overflowY:"auto", background:"#000000", padding:"40px 24px" }}>
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}
        style={{ maxWidth:900, margin:"0 auto" }}>

        <div style={{ marginBottom:40 }}>
          <h1 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontWeight:400, fontSize:36, color:"#ffffff", margin:"0 0 8px" }}>
            My Resources
          </h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.4)", fontFamily:"'Instrument Sans', sans-serif" }}>
            Files and images you've shared with COREX across all conversations
          </p>
        </div>

        {files.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:"center", padding:"100px 24px" }}>
            <div style={{ fontSize:48, marginBottom:20 }}>📂</div>
            <p style={{ fontSize:18, color:"rgba(255,255,255,0.4)", fontFamily:"'Instrument Sans', sans-serif", marginBottom:8 }}>
              No files uploaded yet
            </p>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.25)", fontFamily:"'Instrument Sans', sans-serif", marginBottom:28 }}>
              Attach files in a conversation and they'll appear here
            </p>
            <button onClick={() => navigate("/app/chat")}
              style={{ padding:"12px 28px", borderRadius:100, border:"none", cursor:"pointer", background:"linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)", color:"#000000", fontSize:14, fontWeight:600, fontFamily:"'Instrument Sans', sans-serif" }}>
              Start a conversation →
            </button>
          </motion.div>
        ) : (
          <>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.25)", fontFamily:"'Instrument Sans', sans-serif", marginBottom:20 }}>
              {files.length} file{files.length !== 1 ? "s" : ""} across your conversations
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:16 }}>
              {files.map((file, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                  style={{ borderRadius:20, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", padding:20, display:"flex", flexDirection:"column", gap:12 }}>
                  {file.preview && file.type?.startsWith("image/") ? (
                    <img src={file.preview} alt={file.name} style={{ width:"100%", height:140, objectFit:"cover", borderRadius:12, flexShrink:0 }}/>
                  ) : (
                    <div style={{ width:"100%", height:80, borderRadius:12, background:"rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize:14, fontWeight:600, color:"#ffffff", fontFamily:"'Instrument Sans', sans-serif", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {file.name || "Unnamed file"}
                    </p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", fontFamily:"'Instrument Sans', sans-serif" }}>
                      {formatSize(file.size)} · {timeAgo(file.addedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (typeof window.__corex_loadConversation === "function") {
                        const hist = JSON.parse(localStorage.getItem("corex_history") || "[]");
                        const conv = hist.find(c => c.id === file.conversationId);
                        if (conv) window.__corex_loadConversation(conv);
                      }
                      navigate("/app/chat");
                    }}
                    style={{ padding:"7px 14px", borderRadius:100, border:"1px solid rgba(255,255,255,0.12)", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:12, fontWeight:600, fontFamily:"'Instrument Sans', sans-serif", cursor:"pointer", alignSelf:"flex-start", transition:"all 0.15s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.3)"; e.currentTarget.style.color="#ffffff"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}>
                    Open conversation →
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
