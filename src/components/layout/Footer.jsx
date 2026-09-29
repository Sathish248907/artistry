import { Link } from 'react-router-dom';
import { BadgeCheck, Facebook, Instagram, Mail, MapPin, Phone, ShieldCheck, Truck, Youtube } from 'lucide-react';
import Logo from '../common/Logo';
import { FOOTER_COLUMNS } from '../../data/navigation';
import { BRAND } from '../../data/brand';

const PAYMENTS = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'EMI'];

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-cream via-ivory to-ivory pb-20 md:pb-0">
      {/* Assurance strip */}
      <div className="w-full border-y border-rose-light/50 bg-ivory/70">
        <div className="shell grid grid-cols-2 gap-6 py-7 text-sm lg:grid-cols-4">
          {[
            [BadgeCheck, 'BIS Hallmarked', 'HUID on every piece'],
            [Truck, 'Free Insured Shipping', 'Across India'],
            [ShieldCheck, 'Lifetime Exchange', 'At today’s gold rate'],
            [MapPin, '40+ Boutiques', 'Pan-India presence'],
          ].map(([I, t, s]) => (
            <div key={t} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rose-light bg-ivory text-rose">
                <I size={19} strokeWidth={1.5} />
              </span>
              <span>
                <span className="block font-medium text-ink">{t}</span>
                <span className="text-xs text-ink-faint">{s}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="shell grid gap-12 py-16 lg:grid-cols-[1.3fr_3fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
            Hallmarked gold jewellery, handcrafted by Indian karigars since {BRAND.since}. Transparent pricing, lifetime care, and pieces made to be passed on.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
            <li className="flex items-center gap-2.5"><Phone size={15} className="text-rose" /> {BRAND.phone} (toll free)</li>
            <li className="flex items-center gap-2.5"><Mail size={15} className="text-rose" /> {BRAND.email}</li>
            <li className="flex items-center gap-2.5"><Instagram size={15} className="text-rose" /> {BRAND.instagram}</li>
          </ul>
          <div className="mt-6 flex gap-2">
            {[Instagram, Facebook, Youtube].map((I, i) => (
              <a key={i} href="#" onClick={(e) => e.preventDefault()} aria-label="Social link" className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-light bg-ivory text-rose transition hover:-translate-y-0.5 hover:bg-rose hover:text-white">
                <I size={17} />
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-ink-soft transition hover:pl-1 hover:text-rose-deep">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full border-t border-rose-light/60">
        <div className="shell flex flex-col items-center justify-between gap-4 py-6 text-xs text-ink-soft lg:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved. · Privacy · Terms · Cookie preferences</p>
          <div className="flex flex-wrap justify-center gap-2">
            {PAYMENTS.map((p) => (
              <span key={p} className="rounded-md border border-rose-light/70 bg-ivory px-2.5 py-1 text-[10.5px] font-medium tracking-wide text-ink-soft">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
