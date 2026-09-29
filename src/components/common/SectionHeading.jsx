import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import { classNames } from '../../utils/format';

export default function SectionHeading({ eyebrow, title, copy, align = 'left', action, className }) {
  const center = align === 'center';
  return (
    <Reveal
      className={classNames(
        'mb-10 flex flex-col gap-5 lg:mb-14',
        center ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={classNames(center && 'flex flex-col items-center')}>
        {eyebrow && (
          <p className="eyebrow mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-rose/60" />
            {eyebrow}
            {center && <span className="h-px w-8 bg-rose/60" />}
          </p>
        )}
        <h2 className="heading-lg">{title}</h2>
        {copy && <p className={classNames('mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft', center && 'mx-auto')}>{copy}</p>}
      </div>
      {action && (
        <Link to={action.to} className="group inline-flex shrink-0 items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-rose-deep">
          <span className="border-b border-rose/40 pb-1 transition group-hover:border-rose">{action.label}</span>
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </Reveal>
  );
}
