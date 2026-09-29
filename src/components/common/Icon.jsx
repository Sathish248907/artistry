import { BadgeCheck, Gem, HeartHandshake, IndianRupee, LockKeyhole, MapPin, RefreshCcw, ShieldCheck, Sparkles } from 'lucide-react';

// Explicit map keeps the bundle small (a namespace import would ship every Lucide icon).
const ICONS = { BadgeCheck, Gem, HeartHandshake, IndianRupee, LockKeyhole, MapPin, RefreshCcw, ShieldCheck, Sparkles };

export default function Icon({ name, ...props }) {
  const C = ICONS[name] || Sparkles;
  return <C {...props} />;
}
