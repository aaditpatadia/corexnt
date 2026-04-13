export const MODEL_CONFIG = {
  free: {
    model: 'gpt-4o-mini',
    maxTokens: 1500,
    dailyLimit: 10,
    label: 'Basic',
  },
  spark: {
    model: 'gpt-4o-mini',
    maxTokens: 1800,
    dailyLimit: 15,
    label: 'Spark',
  },
  nineteen_twentys: {
    model: 'gpt-4o',
    maxTokens: 2500,
    dailyLimit: 60,
    label: 'Nineteen Twentys',
  },
  canvas_enterprise: {
    model: 'gpt-4o',
    maxTokens: 3000,
    dailyLimit: 999,
    label: 'Canvas Enterprise',
  },
  admin: {
    model: 'gpt-4o',
    maxTokens: 4000,
    dailyLimit: 999,
    label: 'Admin — All Access',
  },
};

export function getModelConfig() {
  const email = localStorage.getItem('userEmail');
  if (email === 'corexnt@gmail.com') {
    const override = localStorage.getItem('corex_model_override') || 'gpt-4o';
    return { ...MODEL_CONFIG.admin, model: override };
  }
  const plan = localStorage.getItem('corex_plan') || 'free';
  return MODEL_CONFIG[plan] || MODEL_CONFIG.free;
}

export function isAdmin() {
  return localStorage.getItem('userEmail') === 'corexnt@gmail.com';
}
