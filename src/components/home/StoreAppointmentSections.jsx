import SectionHeading from '../common/SectionHeading';
import SmartImage from '../common/SmartImage';
import Reveal from '../common/Reveal';
import StoreLocator from '../store/StoreLocator';
import AppointmentForm from '../appointment/AppointmentForm';
import { BRAND } from '../../data/brand';

export function StoreSection() {
  return (
    <section className="w-full bg-gradient-to-b from-cream to-ivory section-y">
      <div className="shell">
        <SectionHeading eyebrow="Visit us" title="Find a Boutique Near You" copy="Try on, get sized and meet our designers. Every boutique offers gold exchange and free cleaning for life." action={{ label: 'All stores', to: '/stores' }} />
        <StoreLocator compact />
      </div>
    </section>
  );
}

export function AppointmentSection() {
  return (
    <section className="relative w-full overflow-hidden bg-ivory">
      <div className="grid w-full lg:grid-cols-2">
        <div className="relative h-[46vh] min-h-[360px] lg:h-auto lg:min-h-[760px]">
          <SmartImage name="appointment" width={1800} sizes="(min-width:1024px) 50vw, 100vw" className="blend-split-r absolute inset-0 h-full w-full" position="40% 40%" />
          <div className="absolute inset-0 bg-gradient-to-t from-ivory via-transparent to-transparent lg:bg-gradient-to-l lg:from-ivory lg:via-transparent" />
          <Reveal className="absolute bottom-6 left-4 hidden max-w-xs rounded-2xl bg-ivory/90 p-5 shadow-soft backdrop-blur sm:left-6 lg:left-10 lg:block">
            <p className="font-display text-2xl italic text-rose-deep">“Every piece tells your story.”</p>
            <p className="mt-2 text-xs text-ink-soft">Private consultations are complimentary, with refreshments and no obligation to buy.</p>
          </Reveal>
        </div>
        <div className="shell py-14 lg:py-20 lg:pl-12">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-rose" /> Book an appointment
            </p>
            <h2 className="heading-lg mt-3">Experience Jewellery in Person</h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-soft">
              Reserve a private session at your nearest boutique or over video. Prefer to talk? Call {BRAND.phone}.
            </p>
          </Reveal>
          <div className="mt-8">
            <AppointmentForm />
          </div>
        </div>
      </div>
    </section>
  );
}
