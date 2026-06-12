export const navItem = [
  { id: 1, name: 'Home', path: '/' },
  {
    id: 2,
    name: 'Shop',
    path: '/shop',
    // columns injected at runtime from /categories API (see Header.jsx buildShopColumns)
    megaNav: { columns: [] },
  },
  {
    id: 3,
    name: 'Sales & Offers',
    path: '/shop?sale=1',
    subNav: [
      { name: 'All Deals',      path: '/shop?sale=1' },
      { name: 'Lowest Price',   path: '/shop?sale=1&sort=price-asc' },
      { name: 'Highest Price',  path: '/shop?sale=1&sort=price-desc' },
    ],
  },
  { id: 4, name: 'Wholesale', path: '/wholesale' },
  { id: 5, name: 'Contact',   path: '/contact' },
];
