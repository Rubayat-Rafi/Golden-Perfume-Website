import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Absolute path to server/uploads/banners
const BANNER_DIR = path.join(__dirname, '../../uploads/banners');
fs.mkdirSync(BANNER_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, BANNER_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `banner-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, WEBP or GIF images are allowed'));
};

export const uploadBanner = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('image');

// ── Category images ──────────────────────────────────────────────────────────

const CATEGORY_DIR = path.join(__dirname, '../../uploads/categories');
fs.mkdirSync(CATEGORY_DIR, { recursive: true });

const categoryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, CATEGORY_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `category-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

export const uploadCategory = multer({
  storage: categoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');

// ── Product images ───────────────────────────────────────────────────────────

const PRODUCT_DIR = path.join(__dirname, '../../uploads/products');
fs.mkdirSync(PRODUCT_DIR, { recursive: true });

const productStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PRODUCT_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

export const uploadProduct = multer({
  storage: productStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'image',        maxCount: 1  },
  { name: 'imageGallery', maxCount: 10 },
]);

// ── Review images ─────────────────────────────────────────────────────────────

const REVIEW_DIR = path.join(__dirname, '../../uploads/reviews');
fs.mkdirSync(REVIEW_DIR, { recursive: true });

const reviewStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, REVIEW_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `review-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const uploadReview = multer({
  storage: reviewStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 5);
