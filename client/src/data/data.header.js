export const navItem = [
  { id: 1, name: 'Home', path: '/' },
  {
    id: 2,
    name: 'Shop',
    path: '/shop',
    megaNav: {
      columns: [
        {
          title: 'Fragrances',
          path: '/shop/fragrances',
          emoji: '🌹',
          items: [
            { name: 'Fragrance Oils', path: '/shop/fragrance-oils' },
            { name: 'Perfume Oils', path: '/shop/perfume-oils' },
            { name: 'Body Sprays', path: '/shop/body-sprays', badge: 'NEW' },
            { name: 'Cologne & EDT', path: '/shop/cologne' },
          ],
        },
        {
          title: 'Botanicals',
          path: '/shop/botanicals',
          emoji: '🌿',
          items: [
            { name: 'Dried Herbs', path: '/shop/dried-herbs' },
            { name: 'Incense Sticks', path: '/shop/incense' },
            { name: 'Essential Oils', path: '/shop/essential-oils' },
            { name: 'Resins & Roots', path: '/shop/resins', badge: 'HOT' },
          ],
        },
        {
          title: 'Skin Care',
          path: '/shop/skin-care',
          emoji: '✨',
          items: [
            { name: 'Body Butters', path: '/shop/body-butters' },
            { name: 'Natural Soaps', path: '/shop/soaps' },
            { name: 'Oils & Serums', path: '/shop/oils-serums' },
            { name: 'Bath Salts', path: '/shop/bath-salts' },
          ],
        },
      ],
      featured: {
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&auto=format&fit=crop',
        label: 'New Collection',
        title: 'Summer\nFragrances',
        path: '/shop/new',
        cta: 'Shop Now',
      },
    },
  },
  {
    id: 3,
    name: 'Sales',
    path: '/sales',
    subNav: [
      { name: 'Current Deals', path: '/sales/deals' },
      { name: 'Clearance', path: '/sales/clearance' },
      { name: 'Bundle Offers', path: '/sales/bundles' },
    ],
  },
  { id: 4, name: 'Wholesale', path: '/wholesale' },
  { id: 5, name: 'Contact', path: '/contact' },
];
