import { Router } from 'express';
import {
  getProductReviews,
  submitReview,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, requirePermission, optionalAuth } from '../middleware/protect.js';
import { uploadReview } from '../middleware/upload.js';

const router = Router();

// Public — approved reviews for one product (+ requester's own pending review)
router.get('/product/:productId', optionalAuth, getProductReviews);

// Customer — submit a review (auth + optional image upload)
router.post('/product/:productId', protect, uploadReview, submitReview);

// Admin / staff — manage all reviews
router.get('/',              protect, requirePermission('products'), getAllReviews);
router.patch('/:id/status',  protect, requirePermission('products'), updateReviewStatus);
router.delete('/:id',        protect, requirePermission('products'), deleteReview);

export default router;
