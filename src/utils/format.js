const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inrNum = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const formatINR = (n) => inr.format(Math.round(n || 0));
export const formatNumber = (n) => inrNum.format(Math.round(n || 0));
export const formatWeight = (g) => `${Number(g).toFixed(g < 10 ? 2 : 1)} g`;
export const formatDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(d).toLocaleDateString('en-IN', opts);
export const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

export const classNames = (...c) => c.filter(Boolean).join(' ');
export const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const addBusinessDays = (days) => {
  const d = new Date();
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added += 1;
  }
  return d;
};
