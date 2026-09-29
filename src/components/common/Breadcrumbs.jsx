import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ items, light = false }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] ${light ? 'text-ink-soft' : 'text-ink-faint'}`}>
      <Link to="/" className="transition hover:text-rose-deep">Home</Link>
      {items.map(([label, to]) => (
        <span key={label} className="flex items-center gap-1.5">
          <ChevronRight size={12} />
          {to ? <Link to={to} className="transition hover:text-rose-deep">{label}</Link> : <span className="text-rose-deep">{label}</span>}
        </span>
      ))}
    </nav>
  );
}
