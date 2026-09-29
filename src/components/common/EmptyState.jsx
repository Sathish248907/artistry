import { Link } from 'react-router-dom';
import { LogoMark } from './Logo';

export default function EmptyState({ title, copy, action, secondary }) {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-rose-light bg-gradient-to-b from-ivory to-ivory px-6 py-16 text-center">
      <LogoMark size={52} className="opacity-80" />
      <h3 className="mt-5 font-display text-3xl">{title}</h3>
      {copy && <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{copy}</p>}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {action && <Link to={action.to} className="btn-primary">{action.label}</Link>}
        {secondary && <Link to={secondary.to} className="btn-outline">{secondary.label}</Link>}
      </div>
    </div>
  );
}
