export const navItem = [
  { id: 1, name: 'Home', path: '/' },
  {
    id: 2,
    name: 'Shop',
    path: '/shop',
    megaNav: {
      columns: [
        {
          title: 'Fragrances & Scents',
          path: '/shop',
          emoji: '🌿',
          items: [
            { name: 'Fragrance & Body Oils',       path: '/shop?category=fragrance-body-oils' },
            { name: 'Air Freshener & Burning Oil', path: '/shop?category=air-freshener-burning-oil' },
            { name: 'Essential Oil',               path: '/shop?category=essential-oil' },
            { name: 'Aroma Lamps',                 path: '/shop?category=aroma-lamps' },
            { name: 'Incense',                     path: '/shop?category=incense' },
            { name: 'Incense Burner',              path: '/shop?category=incense-burner' },
          ],
        },
        {
          title: 'Body & Skin',
          path: '/shop',
          emoji: '✨',
          items: [
            { name: 'Soap',                     path: '/shop?category=soap' },
            { name: 'Skin Care & Hair Product', path: '/shop?category=skin-care-hair-product' },
            { name: 'African Natural Products', path: '/shop?category=african-natural-products' },
            { name: 'Natural Supplements',      path: '/shop?category=natural-supplements' },
            { name: 'Cosmetic Base',            path: '/shop?category=cosmetic-base' },
            { name: 'Herbs & Smudges',          path: '/shop?category=herbs-smudges' },
          ],
        },
        {
          title: 'Lifestyle & More',
          path: '/shop',
          emoji: '☰',
          items: [
            { name: 'Life Style',    path: '/shop?category=life-style' },
            { name: 'Packaging',     path: '/shop?category=packaging' },
            { name: 'Bottle Display', path: '/shop?category=bottle-display' },
            { name: 'Jewelry',       path: '/shop?category=jewelry' },
            { name: 'New Arrival',   path: '/shop?new=1', badge: 'NEW' },
          ],
        },
      ],
      featured: {
        image: '/assets/brand/cat-fragrance.jpg',
        label: 'New Arrivals',
        title: 'Fresh\nFragrances',
        path: '/shop?new=1',
        cta: 'Shop Now',
      },
    },
  },
  {
    id: 3,
    name: 'Sales',
    path: '/sales',
    subNav: [
      { name: 'Current Deals',  path: '/sales/deals' },
      { name: 'Clearance',      path: '/sales/clearance' },
      { name: 'Bundle Offers',  path: '/sales/bundles' },
    ],
  },
  { id: 4, name: 'Wholesale', path: '/wholesale' },
  { id: 5, name: 'Contact',   path: '/contact' },
];
