import { useId } from 'react';
import { BRAND } from '../../data/brand';

// Original vector motifs, drawn inside a 100×100 box centred on (50, 50).
function Motif({ motif, stroke }) {
  const common = { fill: 'none', stroke, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (motif) {
    case 'lotus':
      return (
        <g {...common}>
          <path d="M50 30c6 9 6 20 0 29-6-9-6-20 0-29z" />
          <path d="M50 59c-2-10-9-18-18-21 0 10 7 18 18 21z" />
          <path d="M50 59c2-10 9-18 18-21 0 10-7 18-18 21z" />
          <path d="M50 60c-7-4-15-5-22-2 5 5 14 6 22 2z" />
          <path d="M50 60c7-4 15-5 22-2-5 5-14 6-22 2z" />
          <path d="M34 66c10 3 22 3 32 0" />
          <circle cx="50" cy="24" r="1.6" fill={stroke} />
        </g>
      );
    case 'om':
      return (
        <g>
          <text x="50" y="62" textAnchor="middle" fontSize="34" fill={stroke} fontFamily="'Noto Sans Devanagari','Nirmala UI',Mangal,serif">
            ॐ
          </text>
          <path d="M36 70h28" {...common} />
        </g>
      );
    case 'diya':
      return (
        <g {...common}>
          <path d="M50 30c4 5 5 9 3 13-1 2-3 3-3 3s-2-1-3-3c-2-4-1-8 3-13z" fill={stroke} fillOpacity="0.25" />
          <path d="M30 52c4 10 12 14 20 14s16-4 20-14z" />
          <path d="M30 52h40" />
          <path d="M44 66l-2 5h16l-2-5" />
        </g>
      );
    case 'rings':
      return (
        <g {...common}>
          <circle cx="43" cy="53" r="12" />
          <circle cx="57" cy="53" r="12" />
          <path d="M57 38l3-4 3 4-3 3z" fill={stroke} fillOpacity="0.3" />
        </g>
      );
    case 'bow':
      return (
        <g {...common}>
          <rect x="33" y="47" width="34" height="20" rx="2" />
          <path d="M50 47v20M33 55h34" />
          <path d="M50 47c-6-10-16-8-14-2 1 3 8 3 14 2zM50 47c6-10 16-8 14-2-1 3-8 3-14 2z" />
        </g>
      );
    default:
      return (
        <g>
          <text x="50" y="52" textAnchor="middle" fontSize="15" fontWeight="600" letterSpacing="0.5" fill={stroke} fontFamily="'Cormorant Garamond',serif">
            999.9
          </text>
          <text x="50" y="62" textAnchor="middle" fontSize="5" letterSpacing="1.6" fill={stroke} fontFamily="Jost,sans-serif">
            FINE GOLD
          </text>
        </g>
      );
  }
}

export default function CoinArt({ motif = 'mark', weight = 10, size = 160, shape = 'round', className }) {
  const id = useId().replace(/:/g, '');
  const ink = '#8A6516';

  if (shape === 'bar') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label={`${weight} gram 24K gold bar`}>
        <defs>
          <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F7E3A1" />
            <stop offset="0.45" stopColor="#D9B25A" />
            <stop offset="1" stopColor="#B98A2E" />
          </linearGradient>
        </defs>
        <rect x="24" y="12" width="52" height="76" rx="6" fill={`url(#${id}b)`} />
        <rect x="28.5" y="16.5" width="43" height="67" rx="4" fill="none" stroke="#FFF3CC" strokeOpacity="0.7" />
        <text x="50" y="34" textAnchor="middle" fontSize="6" letterSpacing="1.4" fill={ink} fontFamily="Jost,sans-serif">FINE GOLD</text>
        <text x="50" y="52" textAnchor="middle" fontSize="13" fontWeight="600" fill={ink} fontFamily="'Cormorant Garamond',serif">{weight} g</text>
        <text x="50" y="64" textAnchor="middle" fontSize="7" fill={ink} fontFamily="'Cormorant Garamond',serif">999.9</text>
        <text x="50" y="76" textAnchor="middle" fontSize="4.2" letterSpacing="1" fill={ink} fontFamily="Jost,sans-serif">{BRAND.name.toUpperCase()}</text>
        <path d="M30 14 L42 14 L30 40 Z" fill="#fff" opacity="0.22" />
      </svg>
    );
  }

  const label = `${BRAND.name.toUpperCase()} · 24 KARAT · ${weight} GRAM · 999.9 ·`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label={`${weight} gram 24K gold coin`}>
      <defs>
        <radialGradient id={`${id}f`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FBEBB5" />
          <stop offset="0.45" stopColor="#E3BE68" />
          <stop offset="0.85" stopColor="#C29236" />
          <stop offset="1" stopColor="#A77A26" />
        </radialGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E8B4B8" />
          <stop offset="0.5" stopColor="#FCE7B0" />
          <stop offset="1" stopColor="#B76E79" />
        </linearGradient>
        <path id={`${id}p`} d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" />
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id}r)`} />
      <circle cx="50" cy="50" r="45.5" fill={`url(#${id}f)`} />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2;
        return <circle key={i} cx={50 + Math.cos(a) * 43} cy={50 + Math.sin(a) * 43} r="0.7" fill="#FFF3CC" opacity="0.75" />;
      })}
      <circle cx="50" cy="50" r="30" fill="none" stroke={ink} strokeOpacity="0.45" strokeWidth="0.6" />
      <text fontSize="4.6" letterSpacing="1.1" fill={ink} fontFamily="Jost,sans-serif">
        <textPath href={`#${id}p`}>{label}</textPath>
      </text>
      <Motif motif={motif} stroke={ink} />
      <ellipse cx="36" cy="30" rx="16" ry="7" fill="#fff" opacity="0.18" transform="rotate(-30 36 30)" />
    </svg>
  );
}
