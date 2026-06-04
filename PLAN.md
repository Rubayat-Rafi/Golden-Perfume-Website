# Golden Perfume — Full System Plan (B2B + B2C)

> Reference: minebotanicals.com (good product catalogue UX, but no real B2B system — we will be significantly better)

---

## 1. The Core Idea

Golden Perfume serves two completely different buyer types from **one codebase**, but they experience the site differently:

| | B2C (Retail Customer) | B2B (Wholesale Business) |
|---|---|---|
| Who | Walk-in shopper, individual buyer | Store owner, salon, spa, reseller |
| Price they see | Retail price (`price`) | Wholesale price (`wholesalePrice`) |
| Min order | No minimum | Per-product minimum (e.g. 1 oz) |
| Account | Optional (guest checkout allowed) | **Required** — must be approved |
| Application | Just register | Apply → wait for admin approval |
| Dashboard | Order history, wishlist | Order history, wholesale pricing, invoices |

---

## 2. User Roles (already in codebase, needs backend enforcement)

```
guest          → browse all public pages, retail prices only
customer       → same as guest + checkout, order history, wishlist
wholesale      → same as customer + wholesale prices, bulk ordering
staff          → product/order management (no pricing changes)
admin          → full access — approve wholesale, manage everything
```

---

## 3. Frontend Journeys

### 3A — B2C Journey (Retail)

```
Landing (/)
  └─ Browse categories (TopCategories)
  └─ Shop page → filter by category / sale / new
  └─ Product detail → see RETAIL price only
       └─ Select size/variant → Add to cart
            └─ Cart page → promo code, order summary
                 └─ Checkout (name, address, payment)
                      └─ Order confirmation email
                           └─ /profile → order history
```

Key screens needed:
- **Checkout page** — shipping form + payment 
- **Order confirmation** — `/orders/:id`
- **Profile dashboard** — order history, saved addresses, wishlist

---

### 3B — B2B Journey (Wholesale)

```
Landing (/)
  └─ "Wholesale" nav link → /wholesale-landing (dedicated B2B page)
       └─ Benefits explained + "Apply Now" CTA
            └─ /wholesale-apply → multi-step application form
                 └─ Submitted → "Under Review" screen
                      └─ Admin approves in dashboard
                           └─ Email sent: "Your account is approved"
                                └─ /login → role = 'wholesale'
                                     └─ Shop page shows WHOLESALE prices
                                     └─ /wholesale/dashboard → order history, invoices
                                     └─ Bulk order form (order many SKUs at once)
```

Key screens needed:
- **`/wholesale`** — B2B landing page (benefits, pricing tiers, min order, apply CTA)
- **`/wholesale/dashboard`** — order history, downloadable invoices, account rep contact
- **Bulk order form** — paste/upload SKU list with quantities
- **Price display** — when `role === 'wholesale'`, EVERY product card and detail page shows wholesale price instead of retail

---

### 3C — Admin Journey

```
/admin
  ├─ Dashboard — revenue (B2B vs B2C split), orders today, low stock alerts
  ├─ Products — CRUD, upload images, set retail + wholesale price per variant
  ├─ Orders — all orders, filter by status, update shipping
  ├─ Wholesale Applications — list pending → Approve / Reject with note
  ├─ Customers — view all users, upgrade/downgrade role
  └─ Content — manage blog posts, FAQ, promo banners
```

---

## 4. Backend System Design

### 4A — Technology Choices (keep what's already started)

```
Runtime       Node.js 18+
Framework     Express 5
Database      MongoDB + Mongoose
Auth          JWT (access token 15m + refresh token 7d in httpOnly cookie)
File uploads  multer (product images)
Payments      (not sure yet)
Email         Nodemailer + SendGrid (order confirmation, wholesale approval)
```

---

### 4B — Database Schema

#### User
```js
{
  _id, 
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { enum: ['customer', 'wholesale', 'staff', 'admin'], default: 'customer' },
  phone: String,
  addresses: [{
    label: String,       // "Home", "Office"
    street, city, state, zip, country,
    isDefault: Boolean
  }],
  wholesaleApplicationId: ObjectId,   // ref to application if wholesale
  createdAt, updatedAt
}
```

#### WholesaleApplication
```js
{
  _id,
  userId: ObjectId,                   // created at time of application
  businessName: String,
  businessType: String,
  ein: String,
  licenseNumber: String,
  contactName: String,
  email, phone,
  address: { street, city, state, zip },
  monthlyOrderRange: String,
  productInterests: [String],
  status: { enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: String,                  // why approved/rejected
  reviewedBy: ObjectId,               // admin user
  reviewedAt: Date,
  submittedAt: Date
}
```

#### Category
```js
{
  _id,
  name: String,
  slug: String,
  image: String,
  count: Number,
  order: Number
}
```

#### Product
```js
{
  _id,
  name: String,
  slug: String,
  category: { type: ObjectId, ref: 'Category' },
  description: String,
  content: String,                    // long-form HTML
  images: [String],                   // Cloudinary URLs
  isSale: Boolean,
  isNew: Boolean,
  isActive: Boolean,                  // soft delete / hide
  tags: [String],
  gender: { enum: ['men', 'women', 'unisex'] },
  rating: Number,
  reviewCount: Number,
  variants: [{
    sku: String,
    size: String,
    retailPrice: Number,              // B2C price
    wholesalePrice: Number,           // B2B price (never sent to non-wholesale users)
    weight: String,
    inStock: Boolean,
    stockQty: Number
  }],
  createdAt, updatedAt
}
```

> **Security rule**: The API **never** returns `wholesalePrice` unless the authenticated user has role `wholesale` or `admin`. The frontend cannot bypass this — it's enforced server-side.

#### Order
```js
{
  _id,
  orderNumber: String,                // GP-2026-00042
  user: { type: ObjectId, ref: 'User' },
  customerType: { enum: ['b2c', 'b2b'] },
  items: [{
    product: ObjectId,
    variantSku: String,
    variantSize: String,
    qty: Number,
    unitPrice: Number,                // price at time of order (snapshot)
    total: Number
  }],
  subtotal: Number,
  discount: Number,
  shippingCost: Number,
  tax: Number,
  grandTotal: Number,
  promoCode: String,
  shippingAddress: { street, city, state, zip, country },
  paymentStatus: { enum: ['pending', 'paid', 'refunded'] },
  paymentIntentId: String,           
  fulfillmentStatus: { enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
  trackingNumber: String,
  notes: String,
  createdAt, updatedAt
}
```

#### PromoCode
```js
{
  _id,
  code: String,
  type: { enum: ['percent', 'fixed'] },
  value: Number,
  minOrderAmount: Number,
  applicableTo: { enum: ['all', 'b2c', 'b2b'] },
  usageLimit: Number,
  usedCount: Number,
  expiresAt: Date,
  isActive: Boolean
}
```

#### BlogPost
```js
{
  _id,
  title, slug,
  excerpt, content,
  image: String,
  author: String,
  publishedAt: Date,
  isPublished: Boolean
}
```

---

### 4C — API Routes

```
AUTH
  POST  /api/auth/register
  POST  /api/auth/login
  POST  /api/auth/logout
  POST  /api/auth/refresh
  GET   /api/auth/me
  POST  /api/auth/wholesale-apply

PRODUCTS
  GET   /api/products              (public — returns retailPrice; wholesalePrice only if auth + role)
  GET   /api/products/:id
  POST  /api/products              (admin)
  PUT   /api/products/:id          (admin, staff)
  DELETE /api/products/:id         (admin)

CATEGORIES
  GET   /api/categories
  POST  /api/categories            (admin)
  PUT   /api/categories/:id        (admin)

ORDERS
  POST  /api/orders                (auth required)
  GET   /api/orders                (admin — all orders)
  GET   /api/orders/mine           (auth — own orders)
  GET   /api/orders/:id            (auth — own order OR admin)
  PATCH /api/orders/:id/status     (admin, staff)

WHOLESALE
  GET   /api/wholesale/applications          (admin)
  GET   /api/wholesale/applications/:id      (admin)
  PATCH /api/wholesale/applications/:id      (admin — approve/reject)

PROMO CODES
  POST  /api/promo/validate        (auth — validate code at checkout)
  GET   /api/promo                 (admin)
  POST  /api/promo                 (admin)

CONTACT
  POST  /api/contact

PAYMENTS
  POST  /api/payments/intent       (create  PaymentIntent)
  POST  /api/payments/webhook      ( webhook — fulfil order on success)

UPLOAD
  POST  /api/upload                (admin — multer signed upload)
```

---

### 4D — Pricing Security (Most Important)

**The rule**: Wholesale prices are a secret from B2C users. Enforced at API level:

```js
// In the product controller:
const selectFields = req.user?.role === 'wholesale' || req.user?.role === 'admin'
  ? '+variants.wholesalePrice'
  : '-variants.wholesalePrice';

const product = await Product.findById(id).select(selectFields);
```

The frontend then:
- Shows `variant.retailPrice` for guests/customers
- Shows `variant.wholesalePrice` (with a "Wholesale Price" label) for wholesale/admin
- The cart always sends the price the user sees — the server **validates** this price against the DB before creating the order

---

## 5. Frontend Pages Still to Build

### B2C (Retail) — Remaining
| Page | Route | Priority |
|---|---|---|
| Checkout | `/checkout` | 🔴 High |
| Payment (not sure) | `/checkout/payment` | 🔴 High |
| Order confirmation | `/orders/:id` | 🔴 High |
| Profile dashboard | `/profile` | 🟡 Medium |
| Order history | `/profile/orders` | 🟡 Medium |
| Address book | `/profile/addresses` | 🟢 Low |

### B2B (Wholesale) — Remaining
| Page | Route | Priority |
|---|---|---|
| Wholesale landing | `/wholesale` | 🔴 High |
| Wholesale dashboard | `/wholesale/dashboard` | 🔴 High |
| Bulk order form | `/wholesale/bulk-order` | 🟡 Medium |
| Invoice download | `/wholesale/orders/:id/invoice` | 🟢 Low |

### Admin — Remaining
| Page | Route | Priority |
|---|---|---|
| Admin dashboard | `/admin` | 🔴 High |
| Product management | `/admin/products` | 🔴 High |
| Order management | `/admin/orders` | 🔴 High |
| Wholesale applications | `/admin/wholesale` | 🔴 High |
| User management | `/admin/users` | 🟡 Medium |
| Blog management | `/admin/blog` | 🟢 Low |
| Promo code management | `/admin/promos` | 🟢 Low |

---

## 6. Pricing Display Rules (Frontend)

```
Product Card (SingleProduct):
  guest / customer  →  show retailPrice as "$X.00"
  wholesale / admin →  show wholesalePrice as "$X.00" + badge "Wholesale"

Product Detail Page:
  guest / customer  →  retail price block only
  wholesale / admin →  retail price (strikethrough) + wholesale price highlighted in green

Cart:
  uses whichever price the user sees — server validates on order creation

Shop Sidebar:
  price range filter works on whichever price applies to the logged-in user
```

---

## 7. Build Order (Recommended Sequence)

### Phase 1 — Backend Foundation (2–3 weeks)
1. User auth (register, login, JWT, refresh tokens)
2. Product CRUD API + price security middleware
3. Category API
4. Wholesale application flow (submit → admin review → approve)
5. Connect frontend AuthContext to real API

### Phase 2 — Shopping Flow (2 weeks)
1. Cart → Checkout page
2. Payment integration
3. Order creation API
4. Order confirmation page + email

### Phase 3 — Dashboards (2 weeks)
1. B2C profile dashboard (order history)
2. Wholesale dashboard (orders, invoices)
3. Admin dashboard (orders, applications, product management)

### Phase 4 — B2B Enhancement (1–2 weeks)
1. Wholesale landing page (benefits, tier table, apply CTA)
2. Bulk order form
3. Volume pricing tiers (optional: 10% off if order > $500, 15% off > $1000)
4. PDF invoice generation

### Phase 5 — Polish (ongoing)
1. Real product images + Cloudinary upload in admin
2. Email templates (order confirmation, wholesale approval, shipping)
3. Blog / content management
4. SEO (meta tags, sitemap)
5. Analytics

---

## 8. Wholesale Pricing Tier Example

This can be shown on the `/wholesale` landing page to attract B2B buyers:

| Monthly Volume | Discount Off Wholesale Price | Notes |
|---|---|---|
| Any (approved account) | Wholesale base price | Default for all approved B2B |
| $500 – $999/mo | +5% off | Auto-applied at checkout |
| $1,000 – $4,999/mo | +10% off | Auto-applied |
| $5,000+/mo | +15% off | + dedicated account rep |

---

## 9. What's Already Done ✅

| Feature | Status |
|---|---|
| React 19 + Vite + Tailwind CSS v4 | ✅ Done |
| Responsive header (mega-menu, search, mobile sidebar) | ✅ Done |
| Home page (banner, categories, featured, FAQ, blog, subscribe) | ✅ Done |
| Shop page (filter, sort, sidebar, mobile drawer) | ✅ Done |
| Product detail (variants, wholesale price gating, related products) | ✅ Done |
| Cart page | ✅ Done |
| Wishlist page | ✅ Done |
| Login / Register / Wholesale Apply pages | ✅ Done |
| Contact page | ✅ Done |
| Role-based protected routes | ✅ Done |
| AuthContext / CartContext / WishlistContext | ✅ Done |
| Express server skeleton + MongoDB connection | ✅ Done |
| 17 categories + 50+ products (JSON data) | ✅ Done |

---

## 10. Summary

Golden Perfume is being built as a **dual-channel platform** — not two separate sites, but one codebase that shows the right experience to the right person:

- A **retail shopper** sees a beautiful fragrance boutique with retail prices and a clean checkout
- A **wholesale buyer** logs in and the entire price layer flips — they see wholesale prices on every product, every card, every checkout line
- An **admin** manages both worlds from a single dashboard

The reference site (minebotanicals.com) has good product UX but completely neglects B2B. **This is your competitive advantage** — a properly built wholesale experience on top of a beautiful retail store.