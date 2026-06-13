import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../controllers/categoryController.js';
import { protect, requirePermission } from '../middleware/protect.js';
import { uploadCategory } from '../middleware/upload.js';

const router = Router();

// Public
router.get('/',        getCategories);
router.get('/:slug',   getCategoryBySlug);

// Admin / permitted staff
router.post('/',          protect, requirePermission('categories'), uploadCategory, createCategory);
router.put('/reorder',    protect, requirePermission('categories'), reorderCategories); // before /:id
router.put('/:id',        protect, requirePermission('categories'), uploadCategory, updateCategory);
router.delete('/:id',     protect, requirePermission('categories'), deleteCategory);

export default router;