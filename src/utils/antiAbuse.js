export const getFingerprint = () => {
  const stored = localStorage.getItem('corex_fp');
  if (stored) return stored;
  const fp = btoa([
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 4,
  ].join('|')).slice(0, 32);
  localStorage.setItem('corex_fp', fp);
  return fp;
};

export const hasClaimedFree = () => {
  const claimed = JSON.parse(localStorage.getItem('corex_free_claimed') || '[]');
  return claimed.includes(getFingerprint());
};

export const markFreeClaimed = (email) => {
  const claimed = JSON.parse(localStorage.getItem('corex_free_claimed') || '[]');
  const fp = getFingerprint();
  if (!claimed.includes(fp)) claimed.push(fp);
  localStorage.setItem('corex_free_claimed', JSON.stringify(claimed));
  const log = JSON.parse(localStorage.getItem('corex_signup_log') || '[]');
  log.push({ email, fp, ts: Date.now() });
  localStorage.setItem('corex_signup_log', JSON.stringify(log.slice(-100)));
};
