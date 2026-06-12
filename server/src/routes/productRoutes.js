import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, requirePermission } from '../middleware/protect.js';
import { uploadProduct } from '../middleware/upload.js';

const router = Router();

// Public — price projection is applied inside controller based on req.user
router.get('/',      getProducts);
router.get('/:slug', getProductBySlug);

// Admin / permitted staff
router.post('/',      protect, requirePermission('products'), uploadProduct, createProduct);
router.put('/:id',    protect, requirePermission('products'), uploadProduct, updateProduct);
router.delete('/:id', protect, requirePermission('products'), deleteProduct);

export default router;
