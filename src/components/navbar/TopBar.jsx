import { Link } from 'react-router-dom';
import { CalendarHeart, MapPin, RotateCcw, TrendingDown, TrendingUp, Truck } from 'lucide-react';
import { GOLD_RATES } from '../../data/goldRates';
import { formatNumber } from '../../utils/format';

export default function TopBar() {
  const r = GOLD_RATES.rates['22K'];
  const up = r.per10g >= r.prev;
  const items = [
    {
      to: '/gold-rates',
      icon: up ? TrendingUp : TrendingDown,
      label: (
        <>
          Today’s Gold Rate · 22K <strong className="font-semibold text-rose-deep">₹{formatNumber(r.per10g / 10)}/g</strong>
          <span className={up ? 'text-rose-deep' : 'text-rose-deep'}>
            {up ? '▲' : '▼'} {formatNumber(Math.abs(r.per10g - r.prev))}
          </span>
        </>
      ),
    },
    { to: '/account?tab=support', icon: Truck, label: 'Free Insured Shipping' },
    { to: '/account?tab=support', icon: RotateCcw, label: '15-Day Easy Returns' },
    { to: '/appointment', icon: CalendarHeart, label: 'Book an Appointment' },
    { to: '/stores', icon: MapPin, label: 'Find a Store' },
  ];

  const row = (keyPrefix) =>
    items.map(({ to, icon: I, label }, i) => (
      <Link key={`${keyPrefix}${i}`} to={to} className="flex shrink-0 items-center gap-2 whitespace-nowrap transition hover:text-rose-deep">
        <I size={13} className="text-rose" strokeWidth={1.8} />
        <span className="flex items-center gap-1.5">{label}</span>
      </Link>
    ));

  return (
    <div className="w-full border-b border-rose-light/40 bg-gradient-to-r from-ivory via-ivory to-champagne/70 text-[11.5px] tracking-[0.04em] text-ink-soft">
      {/* Desktop: evenly spaced across the full width */}
      <div className="shell hidden h-9 items-center justify-between lg:flex">{row('d')}</div>
      {/* Mobile/tablet: gentle marquee */}
      <div className="relative flex h-9 items-center overflow-hidden lg:hidden">
        <div className="animate-marquee flex w-max items-center gap-10 pl-4">
          {row('a')}
          {row('b')}
        </div>
      </div>
    </div>
  );
}
