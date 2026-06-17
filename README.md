# Golden Perfume

Full-stack e-commerce platform for **Golden Perfume / Golden Fragrance** — a New Orleans–based natural fragrance, botanical & skin-care brand with both **retail (B2C)** and **wholesale (B2B)** channels.

The repo is a monorepo with a **React (Vite)** storefront + admin panel in `client/` and an **Express + MongoDB** REST API in `server/`.

---

## Tech Stack

### Client (`client/`)
| Tool | Purpose |
|---|---|
| React 19 + Vite | UI framework & build/dev server |
| React Router 7 | Routing |
| TanStack Query | Server-state, caching, mutations |
| Zustand | Local global state (cart, wishlist, admin badges) |
| Axios (`axiosSecure`) + fetch (`api`) | HTTP with JWT + silent refresh |
| Tailwind CSS 4 | Styling (theme tokens in `index.css`) |
| react-helmet-async | Per-page SEO meta tags |
| sonner | Toast notifications |
| lucide-react / react-icons | Icons |
| TipTap | Rich text editor (product descriptions) |

### Server (`server/`)
| Tool | Purpose |
|---|---|
| Node.js + Express 5 | HTTP framework |
| MongoDB + Mongoose | Database & ODM |
| JWT (access + refresh) | Authentication |
| bcryptjs | Password hashing |
| Multer | Image uploads (products, categories, banners, reviews) |
| Nodemailer | Transactional email (order + wholesale notifications) |

---

## Features

### Storefront
- Product catalog with category mega-menu, search, filters, sorting & pagination
- Product detail: image gallery, **size variants**, **product-level colors** (each color tied to a gallery image; clicking a color swaps the hero image), wholesale price gating, short + full descriptions, SEO meta tags
- **Dynamic reviews** — customers submit text + photo reviews (pending admin approval); a reviewer sees their own pending review, others only see approved ones
- Cart & wishlist (persisted), checkout with promo codes, order tracking
- Wholesale application flow with auto-account creation
- Newsletter signup (footer + dedicated section) with toast confirmation
- Forgot-password flow (code-based, UI ready for SMTP wiring)
- Hide-on-scroll sticky header, skeleton loading states throughout

### Admin panel (`/admin`)
- **Dashboard** with KPIs, a revenue/orders **trend chart** (dependency-free SVG) with **custom date range** + presets, channel & paid-only filters
- **Products** — full CRUD with variants, colors, gallery, SEO, flags; category & status filters; drag-to-reorder
- **Categories, Banners, Promo Codes** — CRUD with drag ordering
- **Orders** — status management drawer, fulfillment filters
- **Customers** — list, detail drawer, account deletion (with modal + cascade)
- **Wholesale** — review/approve/reject applications
- **Reviews** — approve/reject/delete with product + search filters
- **Newsletter** — subscriber list, search, CSV export
- **Staff & Admins** — create staff with per-section permissions
- **History (audit log)** — every create/update/delete across products, categories, banners, promos, customers, staff & wholesale, recording **who** did **what** and **when**; filter by type/action/date/search, manual single & bulk delete, and a **configurable retention** (auto-purge after N days, default 60; `0` = keep forever)

### Cross-cutting
- **Role-based access**: `customer`, `wholesale`, `staff` (granular permissions), `admin`
- **JWT auth** — access token in memory, refresh token in httpOnly cookie, silent refresh on 401
- **Email notifications** (when SMTP is configured): order confirmation to customer + admin, wholesale application received + admin alert, wholesale decision notice
- Old uploaded images are deleted from disk when replaced/removed

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### 1. Server
```bash
cd server
npm install
# create .env (see below)
npm run dev        # nodemon, http://localhost:5000
```

### 2. Client
```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

The client talks to the API via `VITE_BACKEND_URL` (or a `/api` proxy in dev).

---

## Environment Variables

### `server/.env`
```env
# Core
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/golden-perfume
CLIENT_URL=http://localhost:5173        # comma-separated list allowed

# Auth
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Email (optional — notifications are skipped until set)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false                       # true for port 465
SMTP_USER=your-username-or-apikey
SMTP_PASS=your-password
MAIL_FROM="Golden Perfume <no-reply@goldenfragrances.com>"
ADMIN_EMAIL=orders@goldenfragrances.com # where store notifications go
```

### `client/.env` (optional)
```env
VITE_BACKEND_URL=http://localhost:5000   # omit to use the dev proxy / same origin
```

---

## Project Structure

```
Golden Perfume/
├── client/                     # React + Vite app
│   └── src/
│       ├── pages/              # Storefront + Admin pages
│       ├── components/         # Header, Footer, Product, Banner, etc.
│       ├── hooks/queries.js    # TanStack Query hooks
│       ├── store/              # Zustand stores
│       ├── lib/                # api (fetch), axiosSecure, normalize
│       └── routers/router.jsx  # All routes
└── server/                     # Express + MongoDB API
    └── src/
        ├── models/             # Mongoose schemas
        ├── controllers/        # Business logic
        ├── routes/             # Express routers
        ├── middleware/         # protect, requireRole, requirePermission, upload
        └── utils/              # mailer, audit, deleteFile, email templates
```

---

## API Overview

Base path: `/api`

| Area | Routes |
|---|---|
| Auth | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/wholesale-apply` |
| Products | `GET /products`, `GET /products/:slug`, `GET /products/admin/:id`, `POST/PUT/DELETE /products`, `PUT /products/reorder` |
| Categories | `GET /categories`, `POST/PUT/DELETE /categories`, `PUT /categories/reorder` |
| Banners | `GET /banners`, `GET /banners/all`, `POST/PUT/DELETE /banners`, `PUT /banners/reorder` |
| Reviews | `GET /reviews/product/:id`, `POST /reviews/product/:id`, admin `GET /reviews`, `PATCH /reviews/:id/status`, `DELETE /reviews/:id` |
| Orders | `POST /orders`, `GET /orders/mine`, `GET /orders/track`, admin `GET /orders`, `PATCH /orders/:id/status` |
| Wholesale | `GET /wholesale/applications`, `PATCH /wholesale/applications/:id`, `GET /wholesale/my-application` |
| Promos | `POST /promo/validate`, admin `GET/POST/PUT/DELETE /promo` |
| Newsletter | `POST /newsletter`, admin `GET /newsletter`, `DELETE /newsletter/:id` |
| Contact | `POST /contact`, admin `GET /contact` |
| Admin | `/admin/stats`, `/admin/revenue`, `/admin/users`, `/admin/staff`, `/admin/audit` (+ settings/purge) |

Most admin routes require `protect` + `requireRole('admin')` or `requirePermission(section)`.

---

## Design System

Theme tokens live in `client/src/index.css` (`@theme {}`):

| Token | Hex | Role |
|---|---|---|
| `brand-green` | `#217945` | Primary — buttons, links, accents |
| `forest` | `#1A5C34` | Button hover |
| `dark-green` | `#16361F` | Headings, text, sidebar |
| `mid-green` | `#5B973D` | Minor accents |
| `gold` | `#C2A038` | Prices & sale badges only |

Fonts: **Playfair Display** (headings), **Lato** (body).

---

## Notes
- Email and audit retention run via background sweeps on server startup and hourly.
- Audit history records actions going forward only — actions before the feature existed aren't backfilled.
- Restart the server after changing `.env` or backend routes/models.
