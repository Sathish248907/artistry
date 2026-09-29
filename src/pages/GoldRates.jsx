import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Info } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import GoldRateTicker from '../components/home/GoldRateTicker';
import Reveal from '../components/common/Reveal';
import { CITY_RATES, GOLD_RATES } from '../data/goldRates';
import { classNames, formatINR, formatNumber } from '../utils/format';
import { GST_RATE } from '../utils/pricing';

export default function GoldRates() {
  const [purity, setPurity] = useState('22K');
  const [grams, setGrams] = useState(10);
  const [making, setMaking] = useState(12);
  const perG = GOLD_RATES.rates[purity].per10g / 10;
  const gold = perG * (grams || 0);
  const mk = gold * (making / 100);
  const total = (gold + mk) * (1 + GST_RATE);

  return (
    <>
      <section className="w-full bg-gradient-to-r from-cream via-ivory to-champagne/40 pt-8">
        <div className="shell">
          <Breadcrumbs items={[['Gold Rate']]} />
        </div>
      </section>
      <GoldRateTicker />

      <section className="w-full bg-ivory section-y">
        <div className="shell grid gap-8 xl:grid-cols-[1.2fr_1fr]">
          <Reveal className="overflow-hidden rounded-[28px] border border-rose-light/60 bg-ivory">
            <div className="border-b border-rose-light/50 bg-rose-blush/50 px-6 py-5">
              <h2 className="font-display text-3xl">Gold rate by city</h2>
              <p className="text-xs text-ink-soft">Indicative ₹ per 10 grams · local taxes may vary</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                    <th className="px-6 py-3 font-medium">City</th>
                    {['24K', '22K', '18K'].map((k) => <th key={k} className="px-6 py-3 text-right font-medium">{k}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {CITY_RATES.map((c, i) => (
                    <tr key={c.city} className={i % 2 ? 'bg-cream/60' : ''}>
                      <td className="px-6 py-3.5 font-medium text-ink">{c.city}</td>
                      {['24K', '22K', '18K'].map((k) => (
                        <td key={k} className="px-6 py-3.5 text-right tabular-nums text-ink-soft">₹{formatNumber(GOLD_RATES.rates[k].per10g + Math.round(c.delta * (k === '24K' ? 1 : k === '22K' ? 0.916 : 0.75)))}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="rounded-[28px] border border-rose-light/60 bg-gradient-to-br from-ivory via-ivory to-champagne/40 p-6 sm:p-8">
            <p className="eyebrow flex items-center gap-2"><Calculator size={14} /> Gold value calculator</p>
            <h2 className="mt-2 font-display text-3xl">What’s your jewellery worth?</h2>
            <div className="mt-6 flex rounded-full border border-rose-light/70 bg-ivory p-1">
              {['24K', '22K', '18K'].map((k) => (
                <button key={k} onClick={() => setPurity(k)} className={classNames('flex-1 rounded-full py-2 text-sm transition', purity === k ? 'bg-rose text-white' : 'text-ink-soft')}>
                  {k}
                </button>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="calc-g">Weight (g)</label>
                <input id="calc-g" type="number" min="0" step="0.1" value={grams} onChange={(e) => setGrams(Math.max(0, +e.target.value))} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="calc-m">Making (%)</label>
                <input id="calc-m" type="number" min="0" max="35" value={making} onChange={(e) => setMaking(Math.min(35, Math.max(0, +e.target.value)))} className="input" />
              </div>
            </div>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">Gold value @ ₹{formatNumber(perG)}/g</dt><dd className="tabular-nums">{formatINR(gold)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Making charges</dt><dd className="tabular-nums">{formatINR(mk)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">GST (3%)</dt><dd className="tabular-nums">{formatINR((gold + mk) * GST_RATE)}</dd></div>
              <div className="rose-rule my-3" />
              <div className="flex items-baseline justify-between"><dt className="font-medium">Estimated price</dt><dd className="font-display text-3xl text-rose-deep">{formatINR(total)}</dd></div>
            </dl>
            <p className="mt-4 flex gap-2 text-xs text-ink-faint"><Info size={14} className="shrink-0" /> Exchange value for old gold is calculated on today’s rate after purity testing at any boutique.</p>
            <Link to="/products" className="btn-primary mt-6 w-full">Shop at today’s rate</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
