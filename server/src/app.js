import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import wholesaleRoutes from './routes/wholesaleRoutes.js';
import promoRoutes from './routes/promoRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,   // required for httpOnly cookie exchange
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// ── Static — uploaded files (banner images, etc.) ───────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/wholesale',  wholesaleRoutes);
app.use('/api/promo',      promoRoutes);
app.use('/api/contact',    contactRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/banners',    bannerRoutes);

// ── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

export default app;