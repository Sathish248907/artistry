import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarHeart, Clock, Crosshair, MapPin, Navigation, Phone, Search } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import { STORES } from '../../data/content';
import { classNames } from '../../utils/format';

const DEFAULT_POS = { lat: 19.076, lng: 72.8777 }; // Mumbai until the shopper shares location

function distanceKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const fmtKm = (km) => (km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km).toLocaleString('en-IN')} km`);

export default function StoreLocator({ compact = false }) {
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [pos, setPos] = useState(DEFAULT_POS);
  const [locating, setLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState('');
  const [selected, setSelected] = useState(STORES[0].id);

  const list = useMemo(() => {
    let out = STORES.map((s) => ({ ...s, km: distanceKm(pos, s) }));
    if (city.trim()) out = out.filter((s) => s.city.toLowerCase().includes(city.trim().toLowerCase()));
    if (pincode.trim().length >= 2) out = out.filter((s) => s.pincode.startsWith(pincode.trim().slice(0, 2)));
    return out.sort((a, b) => a.km - b.km);
  }, [city, pincode, pos]);

  const active = list.find((s) => s.id === selected) || list[0];

  const locate = () => {
    if (!navigator.geolocation) {
      setGeoMsg('Location is not available in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setCity('');
        setPincode('');
        setGeoMsg('Showing boutiques nearest to you.');
        setLocating(false);
      },
      () => {
        setGeoMsg('We couldn’t access your location — search by city or pincode instead.');
        setLocating(false);
      },
      { timeout: 8000 },
    );
  };

  const d = 0.018;
  const mapSrc = active
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${active.lng - d},${active.lat - d},${active.lng + d},${active.lat + d}&layer=mapnik&marker=${active.lat},${active.lng}`
    : null;

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[minmax(340px,0.9fr)_1.4fr]">
      <div className="flex min-w-0 flex-col">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="relative">
            <span className="sr-only">Search city</span>
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-rose" />
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Search city" className="input pl-11" />
          </label>
          <label className="relative">
            <span className="sr-only">Search pincode</span>
            <MapPin size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-rose" />
            <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="Search pincode" className="input pl-11" />
          </label>
        </div>
        <button onClick={locate} className="mt-3 inline-flex items-center gap-2 self-start text-[12px] font-medium uppercase tracking-[0.18em] text-rose-deep hover:underline">
          <Crosshair size={15} className={locating ? 'animate-spin' : ''} /> {locating ? 'Locating…' : 'Use my location'}
        </button>
        {geoMsg && <p className="mt-2 text-xs text-ink-soft">{geoMsg}</p>}

        <ul className={classNames('mt-5 space-y-3 overflow-y-auto pr-1', compact ? 'max-h-[520px]' : 'max-h-[640px]')}>
          <AnimatePresence initial={false}>
            {list.length === 0 && (
              <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-dashed border-rose-light p-6 text-center text-sm text-ink-soft">
                No boutique found there yet. Our video-call concierge serves all of India —{' '}
                <Link to="/appointment" className="text-rose-deep underline">book a virtual appointment</Link>.
              </motion.li>
            )}
            {list.map((s) => (
              <motion.li key={s.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(s.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelected(s.id)}
                  className={classNames('flex cursor-pointer gap-4 rounded-3xl border p-3 transition', active?.id === s.id ? 'border-rose bg-ivory shadow-rose' : 'border-rose-light/60 bg-ivory/70 hover:bg-rose-blush')}
                >
                  <SmartImage name={s.image} width={400} sizes="120px" className="h-auto w-24 shrink-0 self-stretch rounded-2xl sm:w-28" />
                  <div className="min-w-0 flex-1 py-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-xl leading-tight">{s.area}</h3>
                      <span className="shrink-0 rounded-full bg-rose-blush px-2 py-0.5 text-[10.5px] font-medium text-rose-deep">{fmtKm(s.km)}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">{s.address}</p>
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-soft">
                      <span className="flex items-center gap-1"><Clock size={12} className="text-rose" /> {s.hours}</span>
                      <a href={`tel:${s.phone.replace(/\s/g, '')}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-rose-deep"><Phone size={12} className="text-rose" /> {s.phone}</a>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-full border border-rose/50 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-rose-deep hover:bg-rose-blush"
                      >
                        <Navigation size={12} /> Get Directions
                      </a>
                      <Link to={`/appointment?store=${s.id}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-full bg-rose px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white">
                        <CalendarHeart size={12} /> Book Appointment
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <div className="relative min-h-[380px] overflow-hidden rounded-[28px] border border-rose-light/70 bg-rose-blush shadow-soft lg:min-h-[560px]">
        {mapSrc && <iframe key={mapSrc} title={`Map of ${active.name}`} src={mapSrc} className="absolute inset-0 h-full w-full saturate-[0.7] sepia-[0.15]" loading="lazy" />}
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-8 ring-inset ring-ivory/60" />
        {active && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-ivory/95 p-3 pr-4 shadow-rose backdrop-blur sm:right-auto">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose text-white">
              <MapPin size={18} />
            </span>
            <div>
              <p className="font-display text-lg leading-tight">{active.area}, {active.city}</p>
              <p className="text-[11px] text-ink-soft">{active.services.join(' · ')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
