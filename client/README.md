# Golden Perfume — Client

React 19 frontend for the Golden Perfume e-commerce store — a New Orleans-based fragrance & botanical wholesaler.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19.2.6 | UI framework |
| React Router DOM | 7.15.1 | Client-side routing |
| Vite | 8.0.12 | Build tool & dev server |
| Tailwind CSS | 4.3.0 | Utility-first styling |
| lucide-react | 1.16.0 | Icons |
| react-icons | 5.6.0 | Social / brand icons |
| react-slick | 0.31.0 | Product & category carousels |
| body-scroll-lock | 4.0.0-beta | Mobile menu scroll lock |

---

## Getting Started

```bash
cd client
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build
```

---

## Project Structure

```
client/
├── public/
│   ├── logo.png
│   └── assets/              # Images (products, categories, promos, brand)
├── src/
│   ├── main.jsx             # Entry — wraps router in Context providers
│   ├── index.css            # Tailwind + custom design tokens + animations
│   ├── MainLayout/
│   │   └── MainLayout.jsx   # Header + <Outlet> + Footer + ScrollButtons
│   ├── routers/
│   │   └── router.jsx       # All routes (public + protected)
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── WishlistContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCart.js
│   │   ├── useWishlist.js
│   │   └── useWindowSize.js
│   ├── pages/
│   │   ├── Home/
│   │   ├── Shop/
│   │   ├── ProductDetail/
│   │   ├── Cart/
│   │   ├── Wishlist/
│   │   ├── Contact/
│   │   ├── Login/
│   │   └── Register/        # RegisterPage + WholesaleApplicationPage
│   ├── components/
│   │   ├── Header/          # Header, Nav (mega-menu), SearchPanel
│   │   ├── Footer/          # Footer, NavCol
│   │   ├── Banner/          # Hero slideshow (3-slide Ken Burns)
│   │   ├── TopCategories/   # Category carousel
│   │   ├── FeaturedProducts/
│   │   ├── NewArrivals/
│   │   ├── PromoBanner/
│   │   ├── LatestNews/
│   │   ├── Subscribe/
│   │   ├── FAQ/             # Accordion FAQ section
│   │   ├── Product/         # SingleProduct card, ProductsCarousel
│   │   ├── Auth/            # ProtectedRoute
│   │   ├── ScrollToTop/     # Scroll to top on route change
│   │   ├── ScrollButtons/   # Floating gold ↑ ↓ buttons
│   │   └── shared/SectionTitle/
│   └── data/
│       ├── product/product.json       # Products with variants
│       ├── category/category.json     # 17 categories
│       ├── blog/blog.json
│       ├── footer/footerNav.json
│       ├── footer/payment.json
│       ├── social/index.json
│       └── data.header.js             # Nav mega-menu config
```

---

## Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/shop` | Shop (filter, sort, sidebar) | Public |
| `/shop?category=<slug>` | Category filter | Public |
| `/shop?sale=1` | Sale items | Public |
| `/shop?new=1` | New arrivals | Public |
| `/product/:id` | Product detail + variants | Public |
| `/cart` | Shopping cart | Public |
| `/wishlist` | Wishlist | Public |
| `/contact` | Contact form + map | Public |
| `/login` | Sign in | Guest only |
| `/register` | Create account | Guest only |
| `/wholesale-apply` | Wholesale application | Guest only |
| `/profile` | My profile | Any authenticated user |
| `/wholesale` | Wholesale portal | `wholesale` + `admin` |
| `/staff` | Staff dashboard | `staff` + `admin` |
| `/admin` | Admin dashboard | `admin` only |

---

## Design System

### Colours (defined in `src/index.css` via `@theme {}`)

| Token | Hex | Usage |
|---|---|---|
| `dark-green` | `#2A3D31` | Primary backgrounds, text |
| `forest` | `#3B5249` | Hover states, secondary backgrounds |
| `gold` | `#D4A853` | CTAs, badges, scroll buttons |
| `cream` | `#F7F3EE` | Page backgrounds |
| `linen` | `#EDE0CC` | Section backgrounds, borders |
| `mid-green` | `#6B8F71` | Muted text on dark |
| `sage` | `#B8C9BD` | Footer text |
| `brand-green` | `#267B44` | Links, active states, brand accent |

### Fonts
- **Playfair Display** — headings (`font-playfair`)
- **Lato** — body, labels, buttons (`font-lato`)

---

## Global State (Context API)

### AuthContext
Mock login system with 4 roles. Replace `login()` internals with a real API call when the backend is ready.

| Dev account | Role |
|---|---|
| `customer@test.com` | `customer` |
| `wholesale@test.com` | `wholesale` |
| `staff@test.com` | `staff` |
| `admin@test.com` | `admin` |

Password: anything works in dev mode.

### CartContext
- `addItem()`, `removeItem()`, `updateQty()`, `clearCart()`
- Persisted to `localStorage` key `gp_cart`

### WishlistContext
- `toggleItem()`, `isWishlisted()`
- Persisted to `localStorage` key `gp_wishlist`

---

## Key Features

| Feature | Details |
|---|---|
| Inline search panel | Drops below the header; live filters by name, category, description |
| Shop sidebar | Desktop sticky sidebar + mobile drawer; category, availability, sale, new filters; sort dropdown; active filter chips |
| Product detail | Image gallery, size variant selector, wholesale price gating (wholesale/admin only), related products, star ratings |
| Role-based routes | `ProtectedRoute` with role array; redirects unauthenticated users to `/login` |
| Mobile navigation | Slide-in sidebar with logo, accordion category sub-menus, "Shop All Products" CTA |
| Hero banner | 3-slide animated background with Ken Burns zoom effect (21 s cycle) |
| FAQ accordion | Smooth `max-height` expand/collapse |
| Contact page | Validated form with success state + Google Maps embed |
| Scroll buttons | Floating gold ↑ ↓ buttons fixed bottom-right; hidden on dashboard routes |
| Wholesale application | Multi-section form — business info, contact, ordering intent, account setup |
| Smooth scroll | `scroll-behavior: smooth` on `html` — affects all navigation and scroll buttons |

---

## Product Data Schema

```json
{
  "id": 1,
  "name": "Product Name",
  "category": "Fragrance & Body Oils",
  "price": "5.00",
  "image": "/assets/products/...",
  "description": "Short description",
  "isSale": false,
  "isNew": true,
  "isStocked": true,
  "rating": 4.5,
  "reviews": 12,
  "variants": [
    {
      "sku": "GF-001-A",
      "size": "1/3 oz Roll-On",
      "price": "5.00",
      "wholesalePrice": "1.50",
      "weight": "1.2 oz",
      "inStock": true
    }
  ]
}
```

---

## Connecting to the Backend

When the server is ready, update `AuthContext.jsx`:

```js
// Replace the mock login with:
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const data = await res.json();
```

Add a proxy in `vite.config.js` to avoid CORS in development:

```js
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```