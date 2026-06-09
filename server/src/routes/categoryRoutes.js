import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, requirePermission } from '../middleware/protect.js';

const router = Router();

// Public
router.get('/',        getCategories);
router.get('/:slug',   getCategoryBySlug);

// Admin / permitted staff
router.post('/',       protect, requirePermission('categories'), createCategory);
router.put('/:id',     protect, requirePermission('categories'), updateCategory);
router.delete('/:id',  protect, requirePermission('categories'), deleteCategory);

export default router;