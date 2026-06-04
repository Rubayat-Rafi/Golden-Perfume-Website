import { Router } from 'express';
import { submitContact, getMessages, markRead } from '../controllers/contactController.js';
import { protect, requireRole } from '../middleware/protect.js';

const router = Router();

// Public
router.post('/', submitContact);

// Admin
router.get('/',           protect, requireRole('admin'), getMessages);
router.patch('/:id/read', protect, requireRole('admin'), markRead);

export default router;
