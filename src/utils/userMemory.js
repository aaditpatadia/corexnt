// User memory — collects behavior data and stores in Firestore
// so COREX remembers users across sessions

let _db = null;
async function getDb() {
  if (_db) return _db;
  try {
    const { db } = await import('../firebase');
    _db = db;
    return _db;
  } catch { return null; }
}

const EMAIL_KEY = 'userEmail';
const MEMORY_KEY = 'corex_user_memory';

function getEmail() {
  return (localStorage.getItem(EMAIL_KEY) || '').toLowerCase().trim();
}

// Load memory from localStorage (fast) and optionally Firestore (persistent)
export function loadMemorySync() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}');
  } catch { return {}; }
}

export async function loadMemory() {
  const email = getEmail();
  if (!email) return loadMemorySync();
  try {
    const db = await getDb();
    if (!db) return loadMemorySync();
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'user_memory', email));
    if (snap.exists()) {
      const data = snap.data();
      localStorage.setItem(MEMORY_KEY, JSON.stringify(data));
      return data;
    }
    return loadMemorySync();
  } catch { return loadMemorySync(); }
}

export async function saveMemory(updates) {
  const email = getEmail();
  const current = loadMemorySync();
  const merged = { ...current, ...updates, updatedAt: Date.now() };
  localStorage.setItem(MEMORY_KEY, JSON.stringify(merged));
  if (!email) return;
  try {
    const db = await getDb();
    if (!db) return;
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'user_memory', email), merged, { merge: true });
  } catch { /* silent */ }
}

// Called when user sends a message — track behavior
export async function trackMessage({ userMessage, assistantReply, userType, brandName }) {
  const memory = loadMemorySync();
  const topics = memory.topics || [];
  const outputs = memory.recentOutputs || [];

  // Extract topic keywords from user message
  const words = userMessage.toLowerCase().split(/\s+/);
  const topicKeywords = ['campaign', 'shoot', 'content', 'brand', 'creator', 'instagram',
    'youtube', 'strategy', 'pricing', 'audit', 'competitor', 'pitch', 'reel', 'design'];
  const found = topicKeywords.filter(k => words.includes(k));

  const newTopics = [...new Set([...topics, ...found])].slice(-20);
  const newOutputs = [...outputs, {
    prompt: userMessage.slice(0, 80),
    reply: assistantReply.slice(0, 120),
    ts: Date.now()
  }].slice(-10);

  await saveMemory({
    userType,
    brandName: brandName || memory.brandName,
    topics: newTopics,
    recentOutputs: newOutputs,
    messageCount: (memory.messageCount || 0) + 1,
    lastSeen: Date.now(),
  });
}

// Build a memory context string to inject into the system prompt
export function buildMemoryContext(memory) {
  if (!memory || Object.keys(memory).length === 0) return '';
  const parts = [];
  if (memory.brandName) parts.push(`Brand: ${memory.brandName}`);
  if (memory.userType) parts.push(`User type: ${memory.userType}`);
  if (memory.topics?.length) parts.push(`Topics they work on: ${memory.topics.join(', ')}`);
  if (memory.messageCount) parts.push(`Total conversations: ${memory.messageCount}`);
  if (parts.length === 0) return '';
  return `\n\nPERSISTENT USER MEMORY (from previous sessions — use this to personalise):\n${parts.join('\n')}\nThis user has used COREX before. Reference their history naturally. Never ask for information you already have.`;
}
