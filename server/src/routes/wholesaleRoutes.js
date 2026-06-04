import { Router } from 'express';
import {
  getApplications,
  getApplication,
  reviewApplication,
  getMyApplication,
} from '../controllers/wholesaleController.js';
import { protect, requireRole } from '../middleware/protect.js';

const router = Router();

// Authenticated user — check own application status
router.get('/my-application', protect, getMyApplication);

// Admin only
router.get('/applications',      protect, requireRole('admin'), getApplications);
router.get('/applications/:id',  protect, requireRole('admin'), getApplication);
router.patch('/applications/:id', protect, requireRole('admin'), reviewApplication);

export default router;
