import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FONT = "'Instrument Sans', sans-serif";
const SERIF = "'Instrument Serif', serif";

export default function SharedChat() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = React.useState(null);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    const sharedChats = JSON.parse(localStorage.getItem('corex_shared_chats') || '{}');
    if (sharedChats[shareId]) {
      setData(sharedChats[shareId]);
    } else {
      setNotFound(true);
    }
  }, [shareId]);

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FONT }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Conversation not found</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>This link may have expired or been deleted.</p>
      <button onClick={() => navigate('/')} style={{ padding: '12px 28px', borderRadius: 100, background: 'linear-gradient(135deg,#226FF7,#9CFCAF)', border: 'none', color: '#000', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Try Corex free →</button>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: FONT }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: FONT }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 18, color: '#fff' }}>Corex</span>
        <button onClick={() => navigate('/app')} style={{ padding: '8px 20px', borderRadius: 100, background: 'linear-gradient(135deg,#226FF7,#9CFCAF)', border: 'none', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Try free →</button>
      </div>

      {/* Messages */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        {data.brandName && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 24, fontFamily: FONT }}>
            Creative session for {data.brandName}
          </p>
        )}
        {(data.messages || []).map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ marginBottom: 24, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'user' ? (
              <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px 16px 4px 16px', padding: '12px 16px', maxWidth: '75%', fontSize: 15, lineHeight: 1.65, fontFamily: FONT }}>
                {msg.content}
              </div>
            ) : (
              <div style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', fontFamily: FONT, maxWidth: '100%', whiteSpace: 'pre-wrap' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>COREX Intelligence</div>
                {msg.content}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <div style={{ textAlign: 'center', padding: '48px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 22, color: '#fff', marginBottom: 8 }}>Built with Corex</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: FONT, marginBottom: 24 }}>The Creative Operating System for Indian brands & creators</p>
        <button onClick={() => navigate('/app')} style={{ padding: '14px 32px', borderRadius: 100, background: 'linear-gradient(135deg,#226FF7,#6BC3CE,#9CFCAF,#FFEA71)', border: 'none', color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: FONT }}>Try Corex free → 50 credits, no card</button>
      </div>
    </div>
  );
}
