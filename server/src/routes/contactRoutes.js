import { Router } from 'express';
import { submitContact, getMessages, markRead } from '../controllers/contactController.js';
import { protect, requirePermission } from '../middleware/protect.js';

const router = Router();

// Public
router.post('/', submitContact);

// Admin / permitted staff
router.get('/',           protect, requirePermission('messages'), getMessages);
router.patch('/:id/read', protect, requirePermission('messages'), markRead);

export default router;
