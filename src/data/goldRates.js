// Indicative mock board rates (₹ per 10g). Replace via goldRateService once the rates API is live.
const base24 = 118450;

// Deterministic 30-day history so the trend chart is stable between renders.
const history = Array.from({ length: 30 }, (_, i) => {
  const wave = Math.sin(i / 3.2) * 900 + Math.cos(i / 1.7) * 420;
  const drift = (i - 29) * 62;
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return { date: d.toISOString().slice(0, 10), rate24: Math.round(base24 + wave + drift) };
});
history[29].rate24 = base24;

const yesterday24 = history[28].rate24;

const toPurity = (r24, factor) => Math.round((r24 * factor) / 10) * 10;

export const GOLD_RATES = {
  city: 'Mumbai',
  updatedAt: new Date(new Date().setHours(9, 45, 0, 0)).toISOString(),
  rates: {
    '24K': { label: '24K Gold', fineness: '999', per10g: base24, prev: yesterday24 },
    '22K': { label: '22K Gold', fineness: '916', per10g: toPurity(base24, 0.916), prev: toPurity(yesterday24, 0.916) },
    '18K': { label: '18K Gold', fineness: '750', per10g: toPurity(base24, 0.75), prev: toPurity(yesterday24, 0.75) },
  },
  history,
};

export const CITY_RATES = [
  { city: 'Mumbai', delta: 0 },
  { city: 'Delhi', delta: 150 },
  { city: 'Chennai', delta: 320 },
  { city: 'Bengaluru', delta: 80 },
  { city: 'Kolkata', delta: 60 },
  { city: 'Hyderabad', delta: 40 },
  { city: 'Kochi', delta: 210 },
  { city: 'Ahmedabad', delta: -30 },
];
