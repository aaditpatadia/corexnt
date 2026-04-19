import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";

const FONT = "'Instrument Sans', sans-serif";

function stripStars(text) {
  return (text || "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
}

export default function SharedChat() {
  const { shareId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!shareId) { setNotFound(true); setLoading(false); return; }
    async function load() {
      setLoading(true);
      // Try Firestore first
      try {
        if (db) {
          const snap = await getDoc(doc(db, "shared_chats", shareId));
          if (snap.exists()) { setConversation(snap.data()); setLoading(false); return; }
        }
      } catch { /* fall through to localStorage */ }
      // Fallback: new key format
      try {
        const local = localStorage.getItem(`corex_shared_${shareId}`);
        if (local) { setConversation(JSON.parse(local)); setLoading(false); return; }
      } catch { }
      // Fallback: old key format (corex_shared_chats object)
      try {
        const old = JSON.parse(localStorage.getItem("corex_shared_chats") || "{}");
        if (old[shareId]) {
          const d = old[shareId];
          setConversation({ messages: d.messages || [], title: "Shared conversation", ts: d.ts });
          setLoading(false);
          return;
        }
      } catch { }
      setNotFound(true);
      setLoading(false);
    }
    load();
  }, [shareId]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, color: "rgba(255,255,255,0.4)", fontSize: 15 }}>Loading conversation…</div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <p style={{ fontSize: 40, marginBottom: 16 }}>◎</p>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 28, color: "#fff", marginBottom: 12, fontWeight: 400 }}>Conversation not found</h1>
      <p style={{ fontFamily: FONT, fontSize: 15, color: "rgba(255,255,255,0.45)", marginBottom: 28 }}>This link may have expired or doesn't exist.</p>
      <Link to="/app" style={{ padding: "12px 28px", borderRadius: 100, background: "linear-gradient(135deg, #226FF7, #9CFCAF)", color: "#000", fontFamily: FONT, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
        Start your own →
      </Link>
    </div>
  );

  const messages = conversation?.messages || [];
  const title = conversation?.title || "Shared conversation";

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 20, color: "#fff", fontWeight: 400 }}>Corex</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: FONT, letterSpacing: "1px", textTransform: "uppercase" }}>Shared</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            style={{ padding: "7px 16px", borderRadius: 100, fontSize: 12, fontFamily: FONT, fontWeight: 600, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: copied ? "#9CFCAF" : "#fff", cursor: "pointer" }}
          >
            {copied ? "Copied ✓" : "Copy link"}
          </button>
          <Link to="/app" style={{ padding: "7px 16px", borderRadius: 100, fontSize: 12, fontFamily: FONT, fontWeight: 600, background: "linear-gradient(135deg, #226FF7, #9CFCAF)", color: "#000", textDecoration: "none" }}>
            Try COREX →
          </Link>
        </div>
      </div>

      {/* Conversation */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 26, color: "#fff", marginBottom: 32, fontWeight: 400 }}>{title}</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              {msg.role === "user" ? (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ maxWidth: "75%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px 20px 4px 20px", padding: "12px 18px", fontSize: 15, color: "#fff", lineHeight: 1.65, fontFamily: FONT, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: FONT, marginBottom: 8 }}>COREX</p>
                  <div style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.85)", fontFamily: FONT, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {stripStars(msg.content)}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
          <p style={{ fontFamily: FONT, fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>This conversation was shared from COREX — The Creative OS</p>
          <Link to="/app" style={{ padding: "12px 28px", borderRadius: 100, background: "linear-gradient(135deg, #226FF7, #6BC3CE, #9CFCAF, #FFEA71)", color: "#000", fontFamily: FONT, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Start your own conversation →
          </Link>
        </div>
      </div>
    </div>
  );
}
