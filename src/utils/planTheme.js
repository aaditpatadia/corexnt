export const PLAN_THEMES = {
  free: {
    name: 'Free',
    bg: '#f5f5f0',
    cardBg: '#ffffff',
    accent: '#1a7a3c',
    accentLight: '#2dd668',
    accentPale: '#e8f5ee',
    text: '#1a1a1a',
    textMuted: '#888888',
    border: '#e8e8e3',
    inputBg: '#ffffff',
    topBarBg: '#ffffff',
    chatBg: '#f5f5f0',
    userBubble: '#1a1a1a',
    userBubbleText: '#ffffff',
    welcomeGlow: 'rgba(26,122,60,0.08)',
    font: 'Montserrat, sans-serif',
    chipBg: '#ffffff',
    chipBorder: '#e8e8e3',
    sendBtn: '#1a7a3c',
    label: 'COREX',
    labelColor: '#1a7a3c',
  },
  spark: {
    name: 'Spark',
    bg: '#f0f7ff',
    cardBg: '#ffffff',
    accent: '#2563eb',
    accentLight: '#60a5fa',
    accentPale: '#dbeafe',
    text: '#1e293b',
    textMuted: '#64748b',
    border: '#bfdbfe',
    inputBg: '#ffffff',
    topBarBg: '#ffffff',
    chatBg: '#f0f7ff',
    userBubble: '#2563eb',
    userBubbleText: '#ffffff',
    welcomeGlow: 'rgba(37,99,235,0.08)',
    font: 'Montserrat, sans-serif',
    chipBg: '#eff6ff',
    chipBorder: '#bfdbfe',
    sendBtn: '#2563eb',
    label: '⚡ COREX SPARK',
    labelColor: '#2563eb',
  },
  nineteen_twentys: {
    name: 'Nineteen Twentys',
    bg: '#0a0a0a',
    cardBg: '#111111',
    accent: '#c9a84c',
    accentLight: '#f0c040',
    accentPale: '#1a1500',
    text: '#f5f0e8',
    textMuted: '#888880',
    border: '#2a2520',
    inputBg: '#1a1a1a',
    topBarBg: '#111111',
    chatBg: '#0a0a0a',
    userBubble: '#1e1a12',
    userBubbleText: '#f5f0e8',
    welcomeGlow: 'rgba(201,168,76,0.08)',
    font: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
    chipBg: '#1a1a1a',
    chipBorder: '#2a2520',
    sendBtn: '#c9a84c',
    label: '✦ NINETEEN TWENTYS',
    labelColor: '#c9a84c',
  },
  canvas_enterprise: {
    name: 'Canvas Enterprise',
    bg: '#0a0f1a',
    cardBg: '#0f1520',
    accent: '#7c3aed',
    accentLight: '#a78bfa',
    accentPale: '#1a0f2e',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#1e2a3a',
    inputBg: '#0f1520',
    topBarBg: '#0a0f1a',
    chatBg: '#0a0f1a',
    userBubble: '#1e1535',
    userBubbleText: '#f8fafc',
    welcomeGlow: 'rgba(124,58,237,0.1)',
    font: 'Montserrat, sans-serif',
    chipBg: '#0f1520',
    chipBorder: '#1e2a3a',
    sendBtn: '#7c3aed',
    label: '◈ CANVAS ENTERPRISE',
    labelColor: '#a78bfa',
  },
};

export function getPlanTheme(planKey) {
  return PLAN_THEMES[planKey] || PLAN_THEMES.free;
}

export function getCurrentPlan() {
  return localStorage.getItem('corex_plan') || 'free';
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--bg-card', theme.cardBg);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-light', theme.accentLight);
  root.style.setProperty('--accent-pale', theme.accentPale);
  root.style.setProperty('--text-primary', theme.text);
  root.style.setProperty('--text-muted', theme.textMuted);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--input-bg', theme.inputBg);
  root.style.setProperty('--topbar-bg', theme.topBarBg);
  root.style.setProperty('--chat-bg', theme.chatBg);
  root.style.setProperty('--user-bubble', theme.userBubble);
  root.style.setProperty('--user-bubble-text', theme.userBubbleText);
  root.style.setProperty('--chip-bg', theme.chipBg);
  root.style.setProperty('--chip-border', theme.chipBorder);
  root.style.setProperty('--send-btn', theme.sendBtn);
  root.style.setProperty('--font-body', theme.font);
}
