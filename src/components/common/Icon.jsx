import { BadgeCheck, Gem, Globe, HeartHandshake, IndianRupee, Lightbulb, LockKeyhole, MapPin, RefreshCcw, ShieldCheck, Sparkles, Sprout, TrendingUp } from 'lucide-react';

// Explicit map keeps the bundle small (a namespace import would ship every Lucide icon).
const ICONS = { BadgeCheck, Gem, Globe, HeartHandshake, IndianRupee, Lightbulb, LockKeyhole, MapPin, RefreshCcw, ShieldCheck, Sparkles, Sprout, TrendingUp };

export default function Icon({ name, ...props }) {
  const C = ICONS[name] || Sparkles;
  return <C {...props} />;
}
