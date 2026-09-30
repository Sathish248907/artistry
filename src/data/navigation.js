// Mega menu + footer structure. `to` values map onto real routes/filters.
const shop = (params) => `/products?${new URLSearchParams(params).toString()}`;

export const MEGA_MENU = [
  {
    id: 'gold',
    label: 'Gold',
    to: '/products',
    feature: { image: 'feature_gold', title: 'The 22K Bridal Edit', copy: 'Hallmarked heirlooms, priced live to today’s rate.', to: shop({ purity: '22K' }) },
    columns: [
      {
        title: 'Shop by Category',
        links: [
          ['Gold Rings', shop({ category: 'rings' })],
          ['Gold Earrings', shop({ category: 'earrings' })],
          ['Gold Necklaces', shop({ category: 'necklaces' })],
          ['Gold Bangles', shop({ category: 'bangles' })],
          ['Gold Bracelets', shop({ category: 'bracelets' })],
        ],
      },
      {
        title: 'More Gold',
        links: [
          ['Gold Chains', shop({ category: 'chains' })],
          ['Gold Pendants', shop({ category: 'pendants' })],
          ['Gold Mangalsutra', shop({ category: 'mangalsutra' })],
          ['Gold Nose Pins', shop({ category: 'nose-pins' })],
          ['Gold Jewellery Sets', shop({ category: 'sets' })],
        ],
      },
      {
        title: 'Shop by Purity',
        links: [
          ['24K Pure Gold', '/gold-coins'],
          ['22K Gold', shop({ purity: '22K' })],
          ['18K Gold', shop({ purity: '18K' })],
          ['Today’s Gold Rate', '/gold-rates'],
        ],
      },
    ],
  },
  {
    id: 'jewellery',
    label: 'Jewellery',
    to: '/products',
    feature: { image: 'feature_jewellery', title: 'Rings of Promise', copy: 'Engagement rings and wedding bands in 22K gold.', to: shop({ category: 'rings' }) },
    columns: [
      {
        title: 'Shop by Style',
        links: [
          ['Daily Wear', shop({ type: 'daily-wear' })],
          ['Traditional', shop({ type: 'traditional' })],
          ['Temple Jewellery', shop({ type: 'temple' })],
          ['Contemporary', shop({ type: 'contemporary' })],
          ['Office Wear', shop({ type: 'office-wear' })],
        ],
      },
      {
        title: 'Shop For',
        links: [
          ['Women’s Jewellery', shop({ gender: 'women' })],
          ['Men’s Jewellery', shop({ category: 'mens' })],
          ['Kids Jewellery', shop({ category: 'kids' })],
          ['Unisex Designs', shop({ gender: 'unisex' })],
        ],
      },
      {
        title: 'Shop by Price',
        links: [
          ['Under ₹50,000', shop({ price: '0-50000' })],
          ['₹50,000 – ₹1,50,000', shop({ price: '50000-150000' })],
          ['₹1,50,000 – ₹4,00,000', shop({ price: '150000-400000' })],
          ['Above ₹4,00,000', shop({ price: '400000-999999999' })],
        ],
      },
    ],
  },
  {
    id: 'collections',
    label: 'Collections',
    to: '/collections',
    feature: { image: 'feature_collections', title: 'Everyday Luxe', copy: 'Featherlight pendants and chains for daily wear.', to: shop({ collection: 'everyday' }) },
    columns: [
      {
        title: 'Curated',
        links: [
          ['New Arrivals', shop({ collection: 'new-arrivals' })],
          ['Best Sellers', shop({ collection: 'best-sellers' })],
          ['Festive Collection', shop({ collection: 'festive' })],
        ],
      },
      {
        title: 'Signature',
        links: [
          ['Wedding Collection', shop({ collection: 'wedding' })],
          ['Heritage Collection', shop({ collection: 'heritage' })],
          ['Everyday Collection', shop({ collection: 'everyday' })],
        ],
      },
    ],
  },
  {
    // External partner link: the nav item and every panel link open growcapital.app in a new tab.
    id: 'grow-capital',
    label: 'Grow Capital',
    external: true,
    href: 'https://growcapital.app/',
    panel: {
      eyebrow: 'Grow Capital',
      title: 'Grow Your Wealth With Purpose',
      copy: 'Explore smarter ways to grow and manage your wealth with Grow Capital.',
      cta: 'Explore Grow Capital',
      cards: [
        { icon: 'TrendingUp', title: 'Investment Opportunities', copy: 'Explore opportunities designed to help you build long-term financial growth.' },
        { icon: 'Sprout', title: 'Wealth Growth', copy: 'Discover strategies and solutions focused on sustainable wealth creation.' },
        { icon: 'Lightbulb', title: 'Financial Insights', copy: 'Access useful insights and information to help you make informed financial decisions.' },
        { icon: 'Globe', title: 'Grow Capital', copy: 'Learn more about Grow Capital and explore its platform.' },
      ],
    },
  },
  { id: 'wedding', label: 'Wedding', to: '/wedding' },
  {
    id: 'customize',
    label: 'Customize',
    to: '/customize',
    feature: { image: 'craftsmanship', title: 'Design Your Own', copy: 'From sketch to heirloom in five guided steps.', to: '/customize' },
    columns: [
      {
        title: 'Made for You',
        links: [
          ['Custom Jewellery', '/customize'],
          ['Personalised Jewellery', '/customize?type=pendant'],
          ['Name Engraving', '/customize?type=bracelet'],
          ['Custom Wedding Jewellery', '/customize?style=bridal'],
          ['Design Your Own', '/customize'],
        ],
      },
    ],
  },
  {
    id: 'coins',
    label: 'Gold Coins',
    to: '/gold-coins',
    feature: { image: 'feature_coins', title: 'Gift a Gold Coin', copy: '999.9 pure, certified and beautifully boxed.', to: '/gold-coins' },
    columns: [
      {
        title: 'Coins by Design',
        links: [
          ['24K Gold Coins', '/gold-coins?cat=24k'],
          ['Lakshmi Coins', '/gold-coins?cat=lakshmi'],
          ['Ganesha Coins', '/gold-coins?cat=ganesha'],
        ],
      },
      {
        title: 'Coins by Occasion',
        links: [
          ['Festival Coins', '/gold-coins?cat=festival'],
          ['Wedding Coins', '/gold-coins?cat=wedding'],
          ['Gift Coins', '/gold-coins?cat=gift'],
        ],
      },
    ],
  },
  { id: 'gifts', label: 'Gifts', to: '/gifts' },
  { id: 'offers', label: 'Offers', to: shop({ collection: 'offers' }), badge: 'Up to 25%' },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Shop Gold',
    links: [
      ['Gold Rings', shop({ category: 'rings' })],
      ['Gold Earrings', shop({ category: 'earrings' })],
      ['Gold Necklaces', shop({ category: 'necklaces' })],
      ['Gold Bangles', shop({ category: 'bangles' })],
      ['Gold Chains', shop({ category: 'chains' })],
      ['Gold Pendants', shop({ category: 'pendants' })],
    ],
  },
  {
    title: 'Customize',
    links: [
      ['Custom Jewellery', '/customize'],
      ['Personalised Jewellery', '/customize?type=pendant'],
      ['Name Engraving', '/customize?type=bracelet'],
      ['Custom Wedding Jewellery', '/customize?style=bridal'],
    ],
  },
  {
    title: 'Gold Coins',
    links: [
      ['24K Coins', '/gold-coins?cat=24k'],
      ['Lakshmi Coins', '/gold-coins?cat=lakshmi'],
      ['Ganesha Coins', '/gold-coins?cat=ganesha'],
      ['Festival Coins', '/gold-coins?cat=festival'],
      ['Gift Coins', '/gold-coins?cat=gift'],
    ],
  },
  {
    title: 'Customer Service',
    links: [
      ['Contact', '/account?tab=support'],
      ['Shipping', '/account?tab=support'],
      ['Returns', '/account?tab=support'],
      ['FAQs', '/account?tab=support'],
      ['Order Tracking', '/account?tab=orders'],
      ['Appointment', '/appointment'],
    ],
  },
  {
    title: 'About',
    links: [
      ['Our Story', '/collections'],
      ['Craftsmanship', '/customize'],
      ['Stores', '/stores'],
      ['Careers', '/account?tab=support'],
      ['Sustainability', '/collections'],
    ],
  },
];
