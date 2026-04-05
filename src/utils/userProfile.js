const PROFILE_KEY = 'corex_user_profile';

export function getUserProfile() {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

export function saveUserProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...(getUserProfile() || {}), ...profile }));
}

export function hasProfile() {
  const p = getUserProfile();
  return !!(p && (p.niche || p.company));
}

export function getProfileCompletion(userType) {
  const p = getUserProfile();
  if (!p) return 0;
  const creatorFields = ['name', 'niche', 'platform', 'followers', 'challenge'];
  const brandFields   = ['name', 'company', 'industry', 'competitors', 'budget'];
  const fields = userType === 'company' ? brandFields : creatorFields;
  const filled = fields.filter(f => p[f] && p[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
}

export function getProfileContext(userType) {
  const p = getUserProfile();
  if (!p) return '';
  if (userType !== 'company') {
    return `User context: ${p.name || 'this creator'} is a ${p.niche || 'content'} creator on ${p.platform || 'Instagram'} with ${p.followers || 'unknown'} followers. Their biggest challenge: ${p.challenge || 'growth'}. Always personalise every piece of advice to their exact situation — mention their niche and follower count where relevant.`;
  } else {
    return `User context: ${p.name || 'this user'} represents ${p.company || 'their brand'} in the ${p.industry || 'consumer'} industry. Main competitors: ${p.competitors || 'not specified'}. Marketing budget range: ${p.budget || 'not specified'}. Always personalise advice to their specific brand, industry, and competitors.`;
  }
}
