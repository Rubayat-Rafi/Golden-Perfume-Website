import { Router } from 'express';
import { subscribe, getSubscribers, removeSubscriber } from '../controllers/newsletterController.js';
import { protect, requirePermission } from '../middleware/protect.js';

const router = Router();

// Public
router.post('/', subscribe);

// Admin / permitted staff
router.get('/',    protect, requirePermission('messages'), getSubscribers);
router.delete('/:id', protect, requirePermission('messages'), removeSubscriber);

export default router;
