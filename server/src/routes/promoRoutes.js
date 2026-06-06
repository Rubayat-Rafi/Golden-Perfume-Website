import { Router } from 'express';
import {
  validatePromo,
  getPromos,
  createPromo,
  updatePromo,
  deletePromo,
} from '../controllers/promoController.js';
import { protect, requirePermission } from '../middleware/protect.js';

const router = Router();

// Auth — validate at checkout
router.post('/validate', protect, validatePromo);

// Admin / permitted staff
router.get('/',       protect, requirePermission('promos'), getPromos);
router.post('/',      protect, requirePermission('promos'), createPromo);
router.put('/:id',    protect, requirePermission('promos'), updatePromo);
router.delete('/:id', protect, requirePermission('promos'), deletePromo);

export default router;
