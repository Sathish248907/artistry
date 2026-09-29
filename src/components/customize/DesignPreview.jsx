import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TONES = {
  '22K': ['#FBE4DF', '#D99A99', '#A9646C'],
  '18K': ['#FDEDEA', '#E7B8B6', '#C08589'],
};

function Ornament({ style, x, y, color, scale = 1 }) {
  // Style-specific accent drawn at (x, y)
  const t = `translate(${x} ${y}) scale(${scale})`;
  if (style === 'traditional')
    return (
      <g transform={t}>
        <circle r="14" fill={color} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(a) * 18} cy={Math.sin(a) * 18} r="3.2" fill={color} />;
        })}
        <circle r="6" fill="#9E5A66" opacity="0.85" />
      </g>
    );
  if (style === 'bridal')
    return (
      <g transform={t}>
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} rx="7" ry="15" fill={color} transform={`rotate(${i * 60}) translate(0 -12)`} />
        ))}
        <circle r="8" fill="#9E5A66" />
        <circle r="3" fill="#FFF1EE" />
        <path d="M0 26 v14" stroke={color} strokeWidth="3" />
        <circle cy="44" r="5" fill="#FFFAF9" stroke={color} strokeWidth="2" />
      </g>
    );
  if (style === 'modern')
    return (
      <g transform={t}>
        <rect x="-15" y="-15" width="30" height="30" rx="4" transform="rotate(45)" fill={color} />
        <rect x="-8" y="-8" width="16" height="16" rx="2" transform="rotate(45)" fill="#FFF1EE" opacity="0.55" />
      </g>
    );
  return (
    <g transform={t}>
      <circle r="7" fill={color} />
    </g>
  );
}

export default function DesignPreview({ type = 'ring', purity = '22K', style = 'traditional', text = '', size = 320, className }) {
  const id = useId().replace(/:/g, '');
  const [hi, mid, lo] = TONES[purity] || TONES['22K'];
  const g = `url(#${id}g)`;
  const label = (text || '').slice(0, 14);

  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ maxWidth: size }} className={className} role="img" aria-label={`${style} ${purity} ${type} preview${label ? ` engraved ${label}` : ''}`}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="0.5" stopColor={mid} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        <path id={`${id}arc`} d="M78 175 A72 72 0 0 0 222 175" />
        <path id={`${id}arc2`} d="M60 150 A90 90 0 0 0 240 150" />
      </defs>
      <AnimatePresence mode="wait">
        <motion.g key={`${type}-${style}`} initial={{ opacity: 0, scale: 0.9, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: '150px 150px' }}>
          {type === 'ring' && (
            <>
              <ellipse cx="150" cy="248" rx="80" ry="10" fill="#B76E79" opacity="0.12" />
              <circle cx="150" cy="160" r="72" fill="none" stroke={g} strokeWidth={style === 'minimal' ? 12 : 20} />
              <circle cx="150" cy="160" r="62" fill="none" stroke="#FFF1EE" strokeOpacity="0.4" strokeWidth="1" />
              {style !== 'minimal' && <Ornament style={style} x={150} y={84} color={g} scale={style === 'bridal' ? 1.1 : 1.2} />}
              <text fontSize="11" letterSpacing="2" fill={lo} fontFamily="'Cormorant Garamond',serif" fontStyle="italic">
                <textPath href={`#${id}arc`} startOffset="50%" textAnchor="middle">{label || 'forever'}</textPath>
              </text>
            </>
          )}
          {type === 'necklace' && (
            <>
              <path d="M40 30 C 60 170, 240 170, 260 30" fill="none" stroke={g} strokeWidth="3" strokeDasharray={style === 'minimal' ? '0' : '2 3'} />
              {style !== 'minimal' &&
                Array.from({ length: 9 }, (_, i) => {
                  const tt = 0.15 + i * 0.0875;
                  const x = (1 - tt) ** 3 * 40 + 3 * (1 - tt) ** 2 * tt * 60 + 3 * (1 - tt) * tt ** 2 * 240 + tt ** 3 * 260;
                  const y = (1 - tt) ** 3 * 30 + 3 * (1 - tt) ** 2 * tt * 170 + 3 * (1 - tt) * tt ** 2 * 170 + tt ** 3 * 30;
                  return <circle key={i} cx={x} cy={y} r={style === 'bridal' ? 6 : 4} fill={g} />;
                })}
              {label ? (
                <g>
                  <path d="M150 134 v10" stroke={g} strokeWidth="2" />
                  <rect x="96" y="144" width="108" height="40" rx="20" fill={g} />
                  <text x="150" y="171" textAnchor="middle" fontSize="18" fill="#FFFAF9" fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontWeight="600">{label}</text>
                </g>
              ) : (
                <Ornament style={style === 'minimal' ? 'modern' : style} x={150} y={162} color={g} scale={1.3} />
              )}
            </>
          )}
          {type === 'bangle' && (
            <>
              <ellipse cx="150" cy="258" rx="90" ry="10" fill="#B76E79" opacity="0.12" />
              <circle cx="150" cy="150" r="90" fill="none" stroke={g} strokeWidth={style === 'minimal' ? 14 : 24} />
              {style !== 'minimal' &&
                Array.from({ length: style === 'bridal' ? 24 : 16 }, (_, i, arr) => {
                  const a = (i / arr.length) * Math.PI * 2;
                  return <circle key={i} cx={150 + Math.cos(a) * 90} cy={150 + Math.sin(a) * 90} r={style === 'modern' ? 2 : 4} fill={style === 'bridal' ? '#9E5A66' : '#FFF1EE'} opacity="0.85" />;
                })}
              <text fontSize="13" letterSpacing="3" fill={lo} fontFamily="'Cormorant Garamond',serif" fontStyle="italic">
                <textPath href={`#${id}arc2`} startOffset="50%" textAnchor="middle">{label || 'blessed'}</textPath>
              </text>
            </>
          )}
          {type === 'bracelet' && (
            <>
              {Array.from({ length: 12 }, (_, i) => (
                <ellipse key={i} cx={30 + i * 21.8} cy={150 + Math.sin(i / 1.9) * 4} rx="12" ry="8" fill="none" stroke={g} strokeWidth="4" />
              ))}
              <rect x="95" y="128" width="110" height="44" rx="10" fill={g} />
              <rect x="100" y="133" width="100" height="34" rx="7" fill="none" stroke="#FFF1EE" strokeOpacity="0.6" />
              <text x="150" y="157" textAnchor="middle" fontSize="18" fill="#FFFAF9" fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontWeight="600">{label || 'Aanya'}</text>
              {style !== 'minimal' && <Ornament style={style} x={222} y={188} color={g} scale={0.55} />}
            </>
          )}
          {type === 'pendant' && (
            <>
              <path d="M70 20 L150 110 L230 20" fill="none" stroke={g} strokeWidth="2.5" />
              <circle cx="150" cy="116" r="7" fill="none" stroke={g} strokeWidth="3" />
              {style === 'minimal' ? (
                <circle cx="150" cy="178" r="52" fill={g} />
              ) : style === 'modern' ? (
                <rect x="104" y="128" width="92" height="100" rx="46" fill={g} />
              ) : (
                <path d="M150 124 C 205 150, 205 220, 150 240 C 95 220, 95 150, 150 124 Z" fill={g} />
              )}
              {style === 'traditional' || style === 'bridal' ? <Ornament style={style} x={150} y={172} color="#FFF1EE" scale={0.7} /> : null}
              <text x="150" y={style === 'traditional' || style === 'bridal' ? 222 : 190} textAnchor="middle" fontSize={label.length > 4 ? 16 : 30} fill="#FFFAF9" fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontWeight="600">
                {label || 'A'}
              </text>
            </>
          )}
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}
