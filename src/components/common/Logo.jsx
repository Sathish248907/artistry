import { Link } from 'react-router-dom';
import { BRAND } from '../../data/brand';
import { classNames } from '../../utils/format';

/** Original mark: a lotus-bud arch framing an italic "A", with the wordmark set in Cormorant. */
export function LogoMark({ size = 40, className }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id="artistry-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9E5A66" />
          <stop offset="0.55" stopColor="#B76E79" />
          <stop offset="1" stopColor="#C98A8F" />
        </linearGradient>
      </defs>
      <path d="M24 3c6.5 7.2 13 12.4 13 22.2a13 13 0 0 1-26 0C11 15.4 17.5 10.2 24 3z" fill="none" stroke="url(#artistry-logo-g)" strokeWidth="1.6" />
      <path d="M24 9.5c4 4.6 8.2 8.4 8.2 15.4a8.2 8.2 0 0 1-16.4 0c0-7 4.2-10.8 8.2-15.4z" fill="none" stroke="url(#artistry-logo-g)" strokeWidth="0.8" opacity="0.55" />
      <text x="24" y="31.5" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontStyle="italic" fontSize="17" fontWeight="600" fill="url(#artistry-logo-g)">
        A
      </text>
      <circle cx="24" cy="44" r="1.3" fill="#C98A8F" />
    </svg>
  );
}

export default function Logo({ compact = false, className, onClick }) {
  return (
    <Link to="/" onClick={onClick} className={classNames('group flex items-center gap-2.5', className)} aria-label={`${BRAND.name} home`}>
      <LogoMark size={compact ? 34 : 42} className="transition-transform duration-500 group-hover:rotate-[8deg]" />
      <span className="flex flex-col leading-none">
        <span className={classNames('whitespace-nowrap font-display font-semibold tracking-[0.04em] text-rose-deep', compact ? 'text-[22px]' : 'text-[26px]')}>
          {BRAND.name}
        </span>
        {!compact && <span className="mt-1 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.38em] text-gold">{BRAND.descriptor}</span>}
      </span>
    </Link>
  );
}
