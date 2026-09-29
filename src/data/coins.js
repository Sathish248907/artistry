import { GOLD_RATES } from './goldRates';

// Coins are rendered as original SVG artwork (see components/goldCoins/CoinArt), so every card is distinct.
export const COIN_CATEGORIES = [
  { slug: '24k', name: '24K Gold Coins', motif: 'mark', copy: 'Plain 999.9 investment coins' },
  { slug: 'lakshmi', name: 'Lakshmi Coins', motif: 'lotus', copy: 'Blessings of prosperity' },
  { slug: 'ganesha', name: 'Ganesha Coins', motif: 'om', copy: 'Auspicious new beginnings' },
  { slug: 'festival', name: 'Festival Coins', motif: 'diya', copy: 'Dhanteras, Diwali & Akshaya Tritiya' },
  { slug: 'wedding', name: 'Wedding Coins', motif: 'rings', copy: 'Shagun for the couple' },
  { slug: 'gift', name: 'Gift Coins', motif: 'bow', copy: 'Birthdays, babies & milestones' },
];

const COIN_MAKING = 0.045; // flat minting + packaging premium

const base = [
  { cat: '24k', name: 'Classic 999.9 Round Coin', weights: [1, 2, 5, 10, 20, 50], finish: 'Mirror', design: 'Plain' },
  { cat: '24k', name: 'Minted Gold Bar', weights: [5, 10, 20, 50, 100], finish: 'Satin', design: 'Bar', shape: 'bar' },
  { cat: 'lakshmi', name: 'Mahalakshmi Lotus Coin', weights: [2, 5, 10, 20], finish: 'Antique relief', design: 'Deity' },
  { cat: 'lakshmi', name: 'Lakshmi Kalash Coin', weights: [1, 4, 8], finish: 'Mirror', design: 'Deity' },
  { cat: 'ganesha', name: 'Siddhivinayak Om Coin', weights: [2, 5, 10], finish: 'Antique relief', design: 'Deity' },
  { cat: 'ganesha', name: 'Vighnaharta Blessing Coin', weights: [1, 4, 8, 20], finish: 'Mirror', design: 'Deity' },
  { cat: 'festival', name: 'Dhanteras Diya Coin', weights: [2, 5, 10], finish: 'Mirror', design: 'Festive' },
  { cat: 'festival', name: 'Akshaya Tritiya Coin', weights: [1, 5, 10], finish: 'Satin', design: 'Festive' },
  { cat: 'wedding', name: 'Shubh Vivah Twin Rings Coin', weights: [5, 10, 20], finish: 'Mirror', design: 'Wedding' },
  { cat: 'wedding', name: 'Saat Phere Commemorative Coin', weights: [8, 10, 20], finish: 'Antique relief', design: 'Wedding' },
  { cat: 'gift', name: 'Golden Bow Gift Coin', weights: [1, 2, 5], finish: 'Mirror', design: 'Gift' },
  { cat: 'gift', name: 'Little Star Baby Coin', weights: [1, 2, 4], finish: 'Satin', design: 'Gift' },
];

const rate24 = GOLD_RATES.rates['24K'].per10g / 10;

export const coinPrice = (weight) => Math.round(rate24 * weight * (1 + COIN_MAKING) * 1.03);

export const COINS = base.map((c, i) => {
  const cat = COIN_CATEGORIES.find((x) => x.slug === c.cat);
  const weight = c.weights[Math.min(1, c.weights.length - 1)];
  return {
    id: `coin-${i + 1}`,
    code: `PHC${String(2401 + i)}`,
    ...c,
    motif: cat.motif,
    category: cat.name,
    purity: '24K',
    fineness: '999.9',
    weight,
    certification: i % 3 === 0 ? 'BIS Hallmark + Assay Certificate' : 'BIS Hallmarked 999.9',
    occasion: c.cat === 'wedding' ? 'Wedding' : c.cat === 'festival' ? 'Festival' : c.cat === 'gift' ? 'Gifting' : 'Investment',
    popularity: 90 - i * 3,
    inStock: i !== 9,
  };
});

export const COIN_WEIGHTS = [1, 2, 4, 5, 8, 10, 20, 50, 100];
