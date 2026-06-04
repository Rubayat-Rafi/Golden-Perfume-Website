# Golden Perfume — Server

Express + MongoDB REST API backend for the Golden Perfume e-commerce platform.

> **Status:** Foundation complete. Routes, controllers, and models are ready to be implemented.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express | 5.2.1 | HTTP framework |
| Mongoose | 9.6.2 | MongoDB ODM |
| dotenv | 17.4.2 | Environment variables |
| cors | 2.8.6 | Cross-origin requests |
| morgan | 1.10.1 | HTTP request logging |
| nodemon | 3.1.14 | Dev auto-restart |

---

## Getting Started

```bash
cd server
npm install
cp .env.example .env      # fill in your values
npm run dev               # nodemon — auto-restarts on change
npm start                 # production
```

---

## Environment Variables

Copy `.env.example` to `.env` and set:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/golden-perfume
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret_here
```

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `CLIENT_URL` | Allowed CORS origin (the Vite dev server) |
| `JWT_SECRET` | Secret for signing JWT tokens (add when implementing auth) |

---

## Project Structure

```
server/
├── server.js              # Entry point — connects DB, starts Express
├── .env                   # Local environment (git-ignored)
├── .env.example           # Template for environment variables
├── package.json
└── src/
    ├── app.js             # Express app setup (CORS, Morgan, JSON, routes)
    ├── config/
    │   └── db.js          # Mongoose connection
    ├── middleware/
    │   └── errorHandler.js  # Global JSON error handler
    ├── routes/            # Route files (to be created)
    ├── controllers/       # Business logic (to be created)
    └── models/            # Mongoose schemas (to be created)
```

---

## Current Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns `{ status: 'ok' }` |

---

## Planned API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create customer account |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `POST` | `/api/auth/wholesale-apply` | Submit wholesale application |
| `GET` | `/api/auth/me` | Get current user (auth required) |
| `POST` | `/api/auth/logout` | Invalidate token |

### Products
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/products` | List all products (supports `?category=`, `?sale=`, `?new=`, `?search=`, `?sort=`) |
| `GET` | `/api/products/:id` | Single product detail |
| `POST` | `/api/products` | Create product (admin only) |
| `PUT` | `/api/products/:id` | Update product (admin only) |
| `DELETE` | `/api/products/:id` | Delete product (admin only) |

### Categories
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/categories` | All categories with product counts |

### Orders / Cart
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/orders` | Place an order |
| `GET` | `/api/orders` | User's order history (auth required) |
| `GET` | `/api/orders/:id` | Order detail (auth required) |

### Contact
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/contact` | Submit contact form (sends email) |

### Wholesale
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/wholesale/applications` | List applications (admin only) |
| `PATCH` | `/api/wholesale/applications/:id` | Approve / reject (admin only) |

---

## Planned Mongoose Models

### User
```js
{
  name: String,
  email: { type: String, unique: true },
  password: String,           // bcrypt hashed
  role: { type: String, enum: ['customer', 'wholesale', 'staff', 'admin'] },
  businessName: String,       // wholesale only
  createdAt: Date
}
```

### Product
```js
{
  name: String,
  category: String,
  description: String,
  image: String,
  imageGallery: [String],
  isSale: Boolean,
  isNew: Boolean,
  isStocked: Boolean,
  rating: Number,
  reviews: Number,
  variants: [{
    sku: String,
    size: String,
    price: Number,
    wholesalePrice: Number,
    weight: String,
    inStock: Boolean
  }]
}
```

### Order
```js
{
  user: { type: ObjectId, ref: 'User' },
  items: [{ product: ObjectId, variant: String, qty: Number, price: Number }],
  total: Number,
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered'] },
  shippingAddress: { street, city, state, zip, country },
  createdAt: Date
}
```

---

## Error Handling

All errors are returned as JSON:

```json
{
  "success": false,
  "message": "Error description"
}
```

The global error handler in `src/middleware/errorHandler.js` catches any error passed to `next(err)` and formats it.

---

## CORS

The server allows requests only from `CLIENT_URL` (set in `.env`). In production, update this to your deployed frontend domain.

---

## Connecting to the Client

The Vite client proxies `/api` to this server in development. See the client `README.md` for the Vite proxy config.

Once auth is implemented, the client's `AuthContext.jsx` is ready to swap mock data for real API calls — it already calls `login(email, password)` and expects `{ role, name, email }` back.