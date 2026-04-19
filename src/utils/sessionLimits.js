export const PLAN_SESSION_LIMITS = {
  free:              { messages: 5,         cooldown: 19 * 60 + 20 },
  spark:             { messages: 19,        cooldown: 19 * 60 + 20 },
  studio:            { messages: 50,        cooldown: 10 * 60 },
  nineteen_twentys:  { messages: Infinity,  cooldown: 0 },
  canvas_enterprise: { messages: Infinity,  cooldown: 0 },
};

export function getPlanLimit(plan) {
  return PLAN_SESSION_LIMITS[plan] || PLAN_SESSION_LIMITS.free;
}

export function getSessionState() {
  return {
    count: parseInt(localStorage.getItem("corex_session_count") || "0"),
    start: parseInt(localStorage.getItem("corex_session_start") || "0"),
  };
}

export function resetSession() {
  localStorage.setItem("corex_session_count", "0");
  localStorage.setItem("corex_session_start", String(Date.now()));
}

export function incrementSessionCount() {
  const { count, start } = getSessionState();
  if (!start) resetSession();
  localStorage.setItem("corex_session_count", String(count + 1));
}

// Returns true if the user is currently blocked
export function isSessionLimited(plan) {
  const { messages, cooldown } = getPlanLimit(plan);
  if (messages === Infinity) return false;
  const { count, start } = getSessionState();
  if (!start) { resetSession(); return false; }
  const elapsedMs = Date.now() - start;
  if (elapsedMs >= cooldown * 1000) { resetSession(); return false; }
  return count >= messages;
}

// Returns ms remaining in cooldown (0 if not in cooldown)
export function getCooldownRemaining(plan) {
  const { messages, cooldown } = getPlanLimit(plan);
  if (messages === Infinity) return 0;
  const { count, start } = getSessionState();
  if (!start || count < messages) return 0;
  const elapsed = Date.now() - start;
  return Math.max(0, cooldown * 1000 - elapsed);
}

export function formatCountdown(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
