import { GOLD_RATES } from './goldRates';
import { BACKEND_URL, backendConfigured } from '../admin/api';

/**
 * When the Artistry backend is connected (VITE_BACKEND_URL), replace the built-in indicative gold rates
 * with the rates an admin entered there. Everything on the storefront that shows a gold rate or builds a
 * price from one reads GOLD_RATES, so it all follows.
 *
 * It runs once, before the app is loaded (see main.jsx). If the backend is not configured, slow or
 * unreachable, or has no rates yet, nothing changes and the built-in rates are used.
 *
 * @returns {Promise<boolean>} true when backend rates were applied
 */
export async function hydrateGoldRates({ timeoutMs = 1500 } = {}) {
  if (!backendConfigured) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const get = (path) => fetch(`${BACKEND_URL}${path}`, { signal: controller.signal }).then((res) => (res.ok ? res.json() : null));
    const [current, trend] = await Promise.all([get('/gold-rates/current'), get('/gold-rates/trend?purity=24K&days=30').catch(() => null)]);

    const rates = current?.data?.rates || [];
    let applied = false;
    rates.forEach((rate) => {
      const slot = GOLD_RATES.rates[rate.purity];
      if (!slot || !(rate.ratePerGram > 0)) return;
      slot.per10g = Math.round(rate.ratePerGram * 10);
      slot.prev = Math.round((rate.previousRatePerGram ?? rate.ratePerGram) * 10);
      applied = true;
    });
    if (!applied) return false;

    if (current.data.updatedAt) GOLD_RATES.updatedAt = current.data.updatedAt;
    GOLD_RATES.source = 'backend';

    // 30-day trend for the rate chart (kept in 24K per 10 g, the unit the chart already uses)
    const points = trend?.data?.points || [];
    const today24 = GOLD_RATES.rates['24K'].per10g;
    GOLD_RATES.history =
      points.length >= 2
        ? points.map((point) => ({ date: point.date, rate24: Math.round(point.ratePerGram * 10) }))
        : GOLD_RATES.history.map((entry) => ({ date: entry.date, rate24: today24 })); // not enough history yet: a flat line at today's rate
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
