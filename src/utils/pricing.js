import { GOLD_RATES } from '../data/goldRates';

export const GST_RATE = 0.03;

// Price per gram for a purity, from the per-10g board rate.
export const ratePerGram = (purity) => (GOLD_RATES.rates[purity]?.per10g || GOLD_RATES.rates['22K'].per10g) / 10;

// Transparent price break-up used by cards, PDP, cart and checkout.
export function priceBreakup({ purity, weight, makingPct = 12, stoneValue = 0 }) {
  const goldValue = ratePerGram(purity) * weight;
  const making = goldValue * (makingPct / 100);
  const subtotal = goldValue + making + stoneValue;
  const gst = subtotal * GST_RATE;
  return {
    goldValue: Math.round(goldValue),
    making: Math.round(making),
    stoneValue: Math.round(stoneValue),
    gst: Math.round(gst),
    total: Math.round(subtotal + gst),
  };
}

export const productPrice = (p) => priceBreakup(p).total;
export const mrpPrice = (p) => (p.discountPct ? Math.round(productPrice(p) / (1 - p.discountPct / 100)) : null);

export function cartTotals(items, { coupon } = {}) {
  let goldValue = 0;
  let making = 0;
  let gst = 0;
  let weight = 0;
  items.forEach(({ product, qty }) => {
    const b = priceBreakup(product);
    goldValue += b.goldValue * qty;
    making += b.making * qty;
    gst += b.gst * qty;
    weight += product.weight * qty;
  });
  const subtotal = goldValue;
  const discount = coupon === 'GOLDEN10' ? Math.round(making * 0.1) : 0;
  const shipping = 0;
  const total = subtotal + making - discount + gst + shipping;
  return { subtotal, making, discount, gst, shipping, total, weight };
}
