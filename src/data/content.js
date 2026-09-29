import { BRAND } from './brand';

export const STORES = [
  {
    id: 'mum-bandra',
    area: 'Linking Road',
    name: `${BRAND.name} — Linking Road`,
    city: 'Mumbai',
    pincode: '400050',
    address: '14, Linking Road, Bandra West, Mumbai 400050',
    phone: '+91 22 4012 2026',
    hours: '10:30 AM – 9:00 PM',
    lat: 19.0608,
    lng: 72.8347,
    image: 'store_1',
    services: ['Bridal Lounge', 'Custom Design', 'Gold Exchange'],
  },
  {
    id: 'del-south-ext',
    area: 'South Extension',
    name: `${BRAND.name} — South Extension`,
    city: 'Delhi',
    pincode: '110049',
    address: 'E-21, South Extension Part II, New Delhi 110049',
    phone: '+91 11 4102 2026',
    hours: '11:00 AM – 8:30 PM',
    lat: 28.5686,
    lng: 77.2195,
    image: 'store_2',
    services: ['Bridal Lounge', 'Gold Savings Desk'],
  },
  {
    id: 'blr-indiranagar',
    area: 'Indiranagar',
    name: `${BRAND.name} — Indiranagar`,
    city: 'Bengaluru',
    pincode: '560038',
    address: '612, 100 Feet Road, Indiranagar, Bengaluru 560038',
    phone: '+91 80 4203 2026',
    hours: '10:30 AM – 9:00 PM',
    lat: 12.9719,
    lng: 77.6412,
    image: 'store_3',
    services: ['Custom Design', 'Gold Exchange', 'Coins Counter'],
  },
  {
    id: 'che-tnagar',
    area: 'T. Nagar',
    name: `${BRAND.name} — T. Nagar`,
    city: 'Chennai',
    pincode: '600017',
    address: '41, Usman Road, T. Nagar, Chennai 600017',
    phone: '+91 44 4304 2026',
    hours: '10:00 AM – 9:30 PM',
    lat: 13.0418,
    lng: 80.2341,
    image: 'store_4',
    services: ['Temple Jewellery Studio', 'Bridal Lounge'],
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ananya Iyer',
    city: 'Chennai',
    rating: 5,
    image: 'testimonial_1',
    purchase: 'Lakshmi Temple Choker Set',
    review:
      'I wanted my wedding set to feel like my grandmother’s, but lighter. The team redrew the design twice without a fuss, and the finish is exquisite.',
  },
  {
    id: 2,
    name: 'Rhea Malhotra',
    city: 'Delhi',
    rating: 5,
    image: 'testimonial_2',
    purchase: 'Custom Initial Bracelet',
    review:
      'The live preview was spot on — what I approved online is exactly what arrived. The engraving is crisp and the price break-up was completely transparent.',
  },
  {
    id: 3,
    name: 'Kavya Reddy',
    city: 'Hyderabad',
    rating: 5,
    image: 'testimonial_3',
    purchase: 'Gumbad Dome Hoops',
    review:
      'Booked an appointment for a trial and was treated like family. They even adjusted the hoop clasps for comfort before I left the store.',
  },
  {
    id: 4,
    name: 'Arjun & Meera Nair',
    city: 'Kochi',
    rating: 5,
    image: 'testimonial_4',
    purchase: 'Twin Rings Wedding Coin',
    review:
      'We gifted wedding coins to both families. Tamper-proof packaging, a proper assay certificate and delivered two days early.',
  },
  {
    id: 5,
    name: 'Sneha Kulkarni',
    city: 'Pune',
    rating: 4,
    image: 'testimonial_5',
    purchase: 'Monthly Gold Plan',
    review:
      'Eleven instalments later I walked out with a necklace I love and the 12th month on the house. The app reminders kept me on track.',
  },
];

export const JOURNAL = [
  {
    slug: 'choose-perfect-gold-necklace',
    title: 'How to Choose the Perfect Gold Necklace',
    excerpt: 'Neckline, length and occasion — a stylist’s guide to finding the necklace that frames you best.',
    category: 'Style Guide',
    readTime: '6 min read',
    date: '2026-09-12',
    image: 'journal_necklace',
  },
  {
    slug: 'understanding-gold-purity',
    title: 'Understanding Gold Purity',
    excerpt: '24K, 22K or 18K? What karats and BIS hallmarks really mean for durability and value.',
    category: 'Gold 101',
    readTime: '5 min read',
    date: '2026-09-02',
    image: 'journal_purity',
  },
  {
    slug: 'gold-jewellery-trends',
    title: 'Gold Jewellery Trends for the Season',
    excerpt: 'Sculptural cuffs, layered chains and softly matte temple work are shaping this festive season.',
    category: 'Trends',
    readTime: '4 min read',
    date: '2026-08-24',
    image: 'journal_trends',
  },
  {
    slug: 'care-for-gold-jewellery',
    title: 'How to Care for Gold Jewellery',
    excerpt: 'Simple rituals — from storage pouches to gentle cleaning — that keep gold glowing for generations.',
    category: 'Care',
    readTime: '3 min read',
    date: '2026-08-15',
    image: 'journal_care',
  },
  {
    slug: 'gold-coins-guide',
    title: 'The Complete Gold Coins Guide',
    excerpt: 'Weights, certifications and when to buy — everything you need before your first gold coin.',
    category: 'Investment',
    readTime: '7 min read',
    date: '2026-08-03',
    image: 'journal_coins',
  },
  {
    slug: 'wedding-jewellery-guide',
    title: 'The Wedding Jewellery Guide',
    excerpt: 'From haldi to reception: planning each look, budgeting smartly and choosing heirloom pieces.',
    category: 'Bridal',
    readTime: '8 min read',
    date: '2026-07-21',
    image: 'journal_wedding',
  },
];

export const INSTAGRAM = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  image: `insta_${i + 1}`,
  likes: [2841, 1920, 3310, 1402, 2280, 4105, 1733, 2967, 1588, 3620][i],
}));

export const SAVINGS_PLANS = [
  {
    id: 'savings',
    name: 'Gold Savings Plan',
    tag: 'Most Popular',
    highlight: '12th instalment on us',
    copy: 'Pay 11 monthly instalments from ₹2,000 and we contribute the 12th. Redeem for any jewellery.',
    points: ['From ₹2,000 / month', 'Zero making charges up to 8%', 'Redeem at any store or online'],
  },
  {
    id: 'monthly',
    name: 'Monthly Gold Plan',
    tag: 'Rate protected',
    highlight: 'Accumulate grams, not rupees',
    copy: 'Each instalment buys gold at the day’s rate, so you average out price swings over the year.',
    points: ['Grams credited instantly', 'Track holdings in your account', 'Flexible 6–18 month tenure'],
  },
  {
    id: 'investment',
    name: 'Gold Investment',
    tag: '24K 999.9',
    highlight: 'Digital gold, vault secured',
    copy: 'Buy pure gold from ₹500, store it in insured vaults and convert to coins or jewellery anytime.',
    points: ['Start with ₹500', 'Insured, audited vaults', 'Convert to coins or jewellery'],
  },
];

export const WHY_US = [
  { icon: 'ShieldCheck', title: '100% Certified Gold', copy: 'Every gram assayed and certified before it reaches you.' },
  { icon: 'BadgeCheck', title: 'BIS Hallmarked', copy: 'HUID hallmarked for guaranteed, verifiable purity.' },
  { icon: 'IndianRupee', title: 'Transparent Pricing', copy: 'Live gold rate, making and GST — itemised on every piece.' },
  { icon: 'LockKeyhole', title: 'Secure Payments', copy: 'PCI-DSS compliant checkout with UPI, cards and EMI.' },
  { icon: 'RefreshCcw', title: 'Easy Returns', copy: '15-day returns and lifetime exchange at today’s rate.' },
  { icon: 'Gem', title: 'Trusted Craftsmanship', copy: 'Hand-finished by karigars with generations of skill.' },
  { icon: 'HeartHandshake', title: 'Lifetime Support', copy: 'Free cleaning, polishing and repairs, for life.' },
  { icon: 'MapPin', title: 'Pan-India Stores', copy: '40+ boutiques and a concierge on WhatsApp.' },
];

export const NOTIFICATIONS = [
  { id: 1, type: 'order', title: 'Order shipped', body: 'Your Aarohi Filigree Jhumkas are on their way. Expected Thursday.', time: '2h ago', read: false },
  { id: 2, type: 'rate', title: 'Gold rate update', body: '22K gold moved by ₹180 / 10g today. Prices refresh automatically.', time: '5h ago', read: false },
  { id: 3, type: 'price', title: 'Price drop on your wishlist', body: 'Making charges on Meenakari Peacock Pendant dropped by 20%.', time: 'Yesterday', read: false },
  { id: 4, type: 'collection', title: 'New collection', body: 'The Festive Edit has arrived — hand-chased temple work in 22K.', time: '2 days ago', read: true },
  { id: 5, type: 'offer', title: 'Festive offer', body: 'Flat 25% off making charges on bangles until Sunday.', time: '3 days ago', read: true },
  { id: 6, type: 'appointment', title: 'Appointment reminder', body: 'Bridal consultation at Linking Road, Saturday 11:30 AM.', time: '4 days ago', read: true },
];

export const POPULAR_SEARCHES = ['gold necklace', 'jhumka', 'bangles', 'mangalsutra', 'gold coin', 'men’s chain', 'temple jewellery', 'bridal set'];
