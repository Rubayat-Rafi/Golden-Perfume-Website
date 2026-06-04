import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, requireRole } from '../middleware/protect.js';

const router = Router();

// Public — price projection is applied inside controller based on req.user
router.get('/',      getProducts);
router.get('/:slug', getProductBySlug);

// Admin only
router.post('/',     protect, requireRole('admin'), createProduct);

// Admin + Staff
router.put('/:id',   protect, requireRole('admin', 'staff'), updateProduct);

// Admin only
router.delete('/:id', protect, requireRole('admin'), deleteProduct);

export default router;
