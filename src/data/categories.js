export const CATEGORIES = [
  { slug: 'rings', name: 'Gold Rings', short: 'Rings', image: 'cat_rings', blurb: 'All-gold statements for every finger' },
  { slug: 'earrings', name: 'Gold Earrings', short: 'Earrings', image: 'cat_earrings', blurb: 'Jhumkas, studs & chandbalis' },
  { slug: 'necklaces', name: 'Gold Necklaces', short: 'Necklaces', image: 'cat_necklaces', blurb: 'Chokers to layered haars' },
  { slug: 'bangles', name: 'Gold Bangles', short: 'Bangles', image: 'cat_bangles', blurb: 'Kadas, pairs & stackables' },
  { slug: 'chains', name: 'Gold Chains', short: 'Chains', image: 'cat_chains', blurb: 'Rope, box & Singapore links' },
  { slug: 'bracelets', name: 'Gold Bracelets', short: 'Bracelets', image: 'cat_bracelets', blurb: 'Fluid links, everyday shine' },
  { slug: 'pendants', name: 'Gold Pendants', short: 'Pendants', image: 'cat_pendants', blurb: 'Motifs close to the heart' },
  { slug: 'mangalsutra', name: 'Mangalsutra', short: 'Mangalsutra', image: 'cat_mangalsutra', blurb: 'Sacred, modern, forever' },
  { slug: 'sets', name: 'Gold Sets', short: 'Sets', image: 'cat_sets', blurb: 'Complete coordinated looks' },
  { slug: 'mens', name: 'Men’s Gold', short: 'Men’s', image: 'cat_mens', blurb: 'Bold chains, rings & kadas' },
  { slug: 'kids', name: 'Kids Jewellery', short: 'Kids', image: 'cat_kids', blurb: 'Tiny treasures, safe finishes' },
  { slug: 'nose-pins', name: 'Gold Nose Pins', short: 'Nose Pins', image: 'cat_nosepins', blurb: 'Delicate, precise sparkle' },
];

export const categoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);

export const OCCASIONS = [
  { slug: 'wedding', name: 'Wedding', image: 'occasion_wedding', copy: 'Heirlooms for the vows' },
  { slug: 'engagement', name: 'Engagement', image: 'occasion_engagement', copy: 'The first promise' },
  { slug: 'festival', name: 'Festival', image: 'occasion_festival', copy: 'Glow for every puja' },
  { slug: 'birthday', name: 'Birthday', image: 'occasion_birthday', copy: 'Another year of gold' },
  { slug: 'anniversary', name: 'Anniversary', image: 'occasion_anniversary', copy: 'Love, re-promised' },
  { slug: 'everyday', name: 'Everyday', image: 'occasion_everyday', copy: 'Light, lovely, daily' },
  { slug: 'gifting', name: 'Gifting', image: 'occasion_gifting', copy: 'Gifts that endure' },
];

export const COLLECTIONS = [
  { slug: 'new-arrivals', name: 'New Arrivals', image: 'collection_newArrivals', copy: 'Fresh from our karkhana this season.' },
  { slug: 'best-sellers', name: 'Best Sellers', image: 'collection_bestSellers', copy: 'The pieces India keeps coming back for.' },
  { slug: 'festive', name: 'Festive Collection', image: 'collection_festive', copy: 'Diwali to Onam — shine for every celebration.' },
  { slug: 'wedding', name: 'Wedding Collection', image: 'collection_wedding', copy: 'Bridal heirlooms in 22K gold.' },
  { slug: 'heritage', name: 'Heritage Collection', image: 'collection_heritage', copy: 'Temple and antique finishes, revived.' },
  { slug: 'everyday', name: 'Everyday Collection', image: 'collection_everyday', copy: 'Featherlight gold for daily wear.' },
];

export const GIFT_CATEGORIES = [
  { slug: 'birthday', name: 'Birthday', image: 'gift_birthday', budget: 'From ₹12,000' },
  { slug: 'wedding', name: 'Wedding', image: 'gift_wedding', budget: 'From ₹45,000' },
  { slug: 'anniversary', name: 'Anniversary', image: 'gift_anniversary', budget: 'From ₹25,000' },
  { slug: 'baby', name: 'Baby', image: 'gift_baby', budget: 'From ₹9,000' },
  { slug: 'festival', name: 'Festival', image: 'gift_festival', budget: 'From ₹11,000' },
  { slug: 'corporate', name: 'Corporate', image: 'gift_corporate', budget: 'Bulk pricing' },
];
