import { Router } from 'express';
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
} from '../controllers/bannerController.js';
import { protect, requirePermission } from '../middleware/protect.js';
import { uploadBanner } from '../middleware/upload.js';

const router = Router();

// Public
router.get('/', getActiveBanners);

// Admin / permitted staff
router.get('/all',     protect, requirePermission('banners'), getAllBanners);
router.post('/',       protect, requirePermission('banners'), uploadBanner, createBanner);
router.put('/reorder', protect, requirePermission('banners'), reorderBanners); // before /:id
router.put('/:id',     protect, requirePermission('banners'), uploadBanner, updateBanner);
router.delete('/:id',  protect, requirePermission('banners'), deleteBanner);

export default router;
