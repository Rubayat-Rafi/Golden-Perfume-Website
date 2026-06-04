import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, requireRole } from '../middleware/protect.js';

const router = Router();

// Public
router.get('/',        getCategories);
router.get('/:slug',   getCategoryBySlug);

// Admin only
router.post('/',       protect, requireRole('admin'), createCategory);
router.put('/:id',     protect, requireRole('admin'), updateCategory);
router.delete('/:id',  protect, requireRole('admin'), deleteCategory);

export default router;