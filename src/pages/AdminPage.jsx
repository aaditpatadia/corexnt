import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, addDoc, collection, getDocs, updateDoc, increment, query, where } from 'firebase/firestore';

const FONT = "'Instrument Sans', sans-serif";
const SERIF = "'Instrument Serif', serif";

/* ── Shake keyframe (injected once) ── */
if (typeof document !== 'undefined' && !document.getElementById('admin-shake-style')) {
  const s = document.createElement('style');
  s.id = 'admin-shake-style';
  s.textContent = `@keyframes adminShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`;
  document.head.appendChild(s);
}

/* ── Tiny toast ── */
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: '#0A1A0F', border: '1px solid rgba(156,252,175,0.3)',
      color: '#9CFCAF', fontFamily: FONT, fontSize: 14, fontWeight: 600,
      padding: '12px 24px', borderRadius: 100, zIndex: 9999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}>{msg}</div>
  );
}

/* ── Password screen ── */
function PasswordScreen({ onAuth }) {
  const [pw, setPw] = useState('');
  const [shake, setShake] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (pw === (import.meta.env.VITE_ADMIN_PASSWORD || '')) {
      sessionStorage.setItem('corex_admin_auth', 'true');
      onAuth();
    } else {
      setShake(true);
      setPw('');
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
      <form onSubmit={handleSubmit} style={{ width: 320, animation: shake ? 'adminShake 0.4s ease' : 'none' }}>
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 28, color: '#fff', marginBottom: 8, textAlign: 'center' }}>Corex Admin</p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', marginBottom: 32 }}>Restricted access</p>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="Admin password"
          autoFocus
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '14px 16px', borderRadius: 12,
            background: '#111', border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', fontFamily: FONT, fontSize: 15, marginBottom: 12, outline: 'none',
          }}
        />
        <button type="submit" style={{
          width: '100%', padding: '14px', borderRadius: 12,
          background: 'linear-gradient(135deg,#226FF7,#9CFCAF)',
          border: 'none', color: '#000', fontWeight: 700, fontSize: 15,
          cursor: 'pointer', fontFamily: FONT,
        }}>Enter →</button>
      </form>
    </div>
  );
}

/* ── Section wrapper ── */
function Section({ title, children }) {
  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
      <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: FONT, marginBottom: 20 }}>{title}</h2>
      {children}
    </div>
  );
}

/* ── Credit Manager ── */
function CreditManager({ onToast }) {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    const amt = parseInt(amount, 10);
    if (!email || isNaN(amt) || amt <= 0) return;
    setLoading(true);
    try {
      if (db) {
        await setDoc(doc(db, 'users', email), { credits: increment(amt) }, { merge: true });
        await addDoc(collection(db, 'admin_log'), { action: 'add_credits', email, amount: amt, ts: Date.now(), by: 'admin' });
      }
      onToast(`+${amt} credits added to ${email}`);
      setEmail('');
      setAmount('');
    } catch (err) {
      console.error('[Admin] Credit add failed:', err);
      onToast('Failed — check console');
    }
    setLoading(false);
  }

  const inp = (extra) => ({
    padding: '12px 14px', borderRadius: 10, background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
    fontFamily: FONT, fontSize: 14, outline: 'none', ...extra,
  });

  return (
    <Section title="Credit Manager">
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="user@email.com" type="email" style={inp({ flex: '1 1 220px' })} />
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Credits" type="number" min="1" style={inp({ width: 110 })} />
        <button type="submit" disabled={loading} style={{
          padding: '12px 24px', borderRadius: 10,
          background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#226FF7,#9CFCAF)',
          border: 'none', color: loading ? 'rgba(255,255,255,0.4)' : '#000',
          fontWeight: 700, fontSize: 14, cursor: loading ? 'default' : 'pointer', fontFamily: FONT,
        }}>
          {loading ? 'Adding…' : 'Add Credits'}
        </button>
      </form>
    </Section>
  );
}

/* ── Pending Payments ── */
function PendingPayments({ onToast }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      if (db) {
        const q = query(collection(db, 'pending_payments'), where('status', '==', 'pending'));
        const snap = await getDocs(q);
        setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        throw new Error('no db');
      }
    } catch {
      try {
        const ls = JSON.parse(localStorage.getItem('corex_pending_payments') || '[]');
        setPayments(ls.filter(p => p.status === 'pending'));
      } catch {
        setPayments([]);
      }
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(p) {
    try {
      if (db) {
        const packCredits = { spark: 300, studio: 1000, nt: 3500 };
        const credits = packCredits[p.pack] || 0;
        if (credits && p.email) {
          await setDoc(doc(db, 'users', p.email), { credits: increment(credits) }, { merge: true });
          await addDoc(collection(db, 'admin_log'), { action: 'approve_payment', email: p.email, amount: credits, txnId: p.txnId, ts: Date.now(), by: 'admin' });
        }
        await updateDoc(doc(db, 'pending_payments', p.id), { status: 'approved' });
      }
      setPayments(prev => prev.filter(x => x.id !== p.id));
      onToast(`Approved — ${p.email}`);
    } catch (err) {
      console.error('[Admin] Approve failed:', err);
      onToast('Approve failed — check console');
    }
  }

  async function reject(p) {
    try {
      if (db) {
        await updateDoc(doc(db, 'pending_payments', p.id), { status: 'rejected' });
      }
      setPayments(prev => prev.filter(x => x.id !== p.id));
      onToast(`Rejected — ${p.email}`);
    } catch (err) {
      console.error('[Admin] Reject failed:', err);
      onToast('Reject failed — check console');
    }
  }

  const cell = (extra) => ({ padding: '10px 12px', fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: FONT, borderBottom: '1px solid rgba(255,255,255,0.05)', ...extra });

  return (
    <Section title="Pending Payments">
      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: FONT, fontSize: 13 }}>Loading…</p>
      ) : payments.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.25)', fontFamily: FONT, fontSize: 13 }}>No pending payments.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Time', 'Name', 'Email', 'Amount', 'TxnID', 'Pack', 'Actions'].map(h => (
                  <th key={h} style={{ ...cell({ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', textAlign: 'left', fontWeight: 700 }) }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td style={cell()}>{p.ts ? new Date(p.ts).toLocaleDateString() : '—'}</td>
                  <td style={cell()}>{p.name || '—'}</td>
                  <td style={cell()}>{p.email || '—'}</td>
                  <td style={cell()}>₹{p.amount || '—'}</td>
                  <td style={cell({ fontFamily: 'monospace', fontSize: 12 })}>{p.txnId || '—'}</td>
                  <td style={cell()}>{p.pack || '—'}</td>
                  <td style={cell()}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => approve(p)} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(156,252,175,0.15)', border: '1px solid rgba(156,252,175,0.3)', color: '#9CFCAF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>✓ Approve</button>
                      <button onClick={() => reject(p)} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)', color: 'rgba(255,120,120,0.9)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>✗ Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

/* ── User List ── */
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        if (!db) throw new Error('no db');
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        setUsers([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = search
    ? users.filter(u => (u.email || u.id || '').toLowerCase().includes(search.toLowerCase()))
    : users;

  const cell = (extra) => ({ padding: '10px 12px', fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: FONT, borderBottom: '1px solid rgba(255,255,255,0.05)', ...extra });

  return (
    <Section title="Users">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by email…"
        style={{ padding: '10px 14px', borderRadius: 10, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: FONT, fontSize: 14, outline: 'none', marginBottom: 16, width: 280, boxSizing: 'border-box' }}
      />
      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: FONT, fontSize: 13 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.25)', fontFamily: FONT, fontSize: 13 }}>No users found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Email', 'Name', 'Brand', 'Credits', 'Plan', 'Joined'].map(h => (
                  <th key={h} style={{ ...cell({ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', textAlign: 'left', fontWeight: 700 }) }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map(u => (
                <tr key={u.id}>
                  <td style={cell()}>{u.email || u.id}</td>
                  <td style={cell()}>{u.name || '—'}</td>
                  <td style={cell()}>{u.brand || u.company || '—'}</td>
                  <td style={cell()}>{u.credits ?? '—'}</td>
                  <td style={cell()}>{u.plan || 'free'}</td>
                  <td style={cell()}>{u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 100 && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: FONT, marginTop: 8 }}>Showing 100 of {filtered.length}</p>}
        </div>
      )}
    </Section>
  );
}

/* ── Stats ── */
function Stats() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const colls = ['users', 'pending_payments', 'admin_log'];
      const result = {};
      for (const name of colls) {
        try {
          if (!db) throw new Error('no db');
          const snap = await getDocs(collection(db, name));
          result[name] = snap.size;
        } catch {
          result[name] = '—';
        }
      }
      setCounts(result);
      setLoading(false);
    }
    load();
  }, []);

  const labels = { users: 'Total Users', pending_payments: 'Pending Payments', admin_log: 'Admin Actions' };

  return (
    <Section title="Stats">
      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: FONT, fontSize: 13 }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {Object.entries(counts).map(([k, v]) => (
            <div key={k} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 24px', minWidth: 140 }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: FONT, marginBottom: 4 }}>{v}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '1px' }}>{labels[k] || k}</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ── Main ── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('corex_admin_auth') === 'true');
  const [toast, setToast] = useState(null);

  if (!authed) return <PasswordScreen onAuth={() => setAuthed(true)} />;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: FONT }}>
      {/* Header */}
      <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 20, color: '#fff' }}>Corex Admin</span>
        <button
          onClick={() => { sessionStorage.removeItem('corex_admin_auth'); setAuthed(false); }}
          style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT }}
        >
          Sign out
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 64px' }}>
        <Stats />
        <CreditManager onToast={setToast} />
        <PendingPayments onToast={setToast} />
        <UserList />
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
