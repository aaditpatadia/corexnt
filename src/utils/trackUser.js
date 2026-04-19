export const trackSignup = async (userData) => {
  const webhookUrl = import.meta.env.VITE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'signup',
        email: userData.email || '',
        name: userData.name || '',
        brand: userData.brand || '',
        timestamp: new Date().toISOString(),
        credits: userData.credits || 50,
        plan: 'free',
      }),
    });
  } catch (e) {
    console.log('Track failed:', e);
  }
};

export const trackPayment = async (paymentData) => {
  const webhookUrl = import.meta.env.VITE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'payment_submitted',
        email: paymentData.email || '',
        name: paymentData.name || '',
        pack: paymentData.pack || '',
        amount: paymentData.amount || '',
        txnId: paymentData.txnId || '',
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.log('Track failed:', e);
  }
};
