import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts,
} from '../controllers/productController.js';
import { protect, optionalAuth, requirePermission } from '../middleware/protect.js';
import { uploadProduct } from '../middleware/upload.js';

const router = Router();

// Public — optionalAuth lets wholesale/admin users receive wholesalePrice in the response
router.get('/',      optionalAuth, getProducts);
router.get('/:slug', optionalAuth, getProductBySlug);

// Admin / permitted staff
router.post('/',          protect, requirePermission('products'), uploadProduct, createProduct);
router.put('/reorder',    protect, requirePermission('products'), reorderProducts); // before /:id
router.put('/:id',        protect, requirePermission('products'), uploadProduct, updateProduct);
router.delete('/:id',     protect, requirePermission('products'), deleteProduct);

export default router;
