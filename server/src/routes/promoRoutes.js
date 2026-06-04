import { Router } from 'express';
import {
  validatePromo,
  getPromos,
  createPromo,
  updatePromo,
  deletePromo,
} from '../controllers/promoController.js';
import { protect, requireRole } from '../middleware/protect.js';

const router = Router();

// Auth — validate at checkout
router.post('/validate', protect, validatePromo);

// Admin
router.get('/',       protect, requireRole('admin'), getPromos);
router.post('/',      protect, requireRole('admin'), createPromo);
router.put('/:id',    protect, requireRole('admin'), updatePromo);
router.delete('/:id', protect, requireRole('admin'), deletePromo);

export default router;
