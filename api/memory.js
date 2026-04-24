import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'email required' });

  try {
    const db = getAdminDb();
    const ref = db.collection('user_memory').doc(email.toLowerCase());

    if (req.method === 'GET') {
      const snap = await ref.get();
      return res.status(200).json(snap.exists ? snap.data() : {});
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      await ref.set(body, { merge: true });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Memory API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
