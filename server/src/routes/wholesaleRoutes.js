import { Router } from 'express';
import {
  getApplications,
  getApplication,
  reviewApplication,
  getMyApplication,
} from '../controllers/wholesaleController.js';
import { protect, requirePermission } from '../middleware/protect.js';

const router = Router();

// Authenticated user — check own application status
router.get('/my-application', protect, getMyApplication);

// Admin / permitted staff
router.get('/applications',      protect, requirePermission('wholesale'), getApplications);
router.get('/applications/:id',  protect, requirePermission('wholesale'), getApplication);
router.patch('/applications/:id', protect, requirePermission('wholesale'), reviewApplication);

export default router;
