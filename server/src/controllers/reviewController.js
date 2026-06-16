import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { deleteFile } from '../utils/deleteFile.js';

// Recompute and persist a product's cached rating + reviewCount
const syncRating = async (productId) => {
  const [agg] = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    rating:      agg ? Math.round(agg.avg * 10) / 10 : 0,
    reviewCount: agg?.count ?? 0,
  });
};

// ─── GET /api/reviews/product/:productId ───────────────────────────────────
// Public — approved reviews. If authenticated (optionalAuth), the requester
// also sees their OWN pending review (others can't see it before approval).
export const getProductReviews = async (req, res, next) => {
  try {
    const visibility = [{ isApproved: true }];
    if (req.user) visibility.push({ userId: req.user._id });

    const reviews = await Review.find({
      productId: req.params.productId,
      $or: visibility,
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/reviews/product/:productId ──────────────────────────────────
// Auth — customer submits a review (one per product per user)
export const submitReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, content } = req.body;

    if (!rating || !content?.trim())
      return res.status(400).json({ success: false, message: 'Rating and review text are required' });
    if (content.trim().length < 10)
      return res.status(400).json({ success: false, message: 'Review must be at least 10 characters' });

    const product = await Product.findById(productId).select('slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const images = (req.files || []).map((f) => `/uploads/reviews/${f.filename}`);

    const review = await Review.create({
      productId,
      productSlug: product.slug,
      userId:      req.user._id,
      userName:    req.user.name,
      userImage:   req.user.image || '',
      rating:      Math.min(5, Math.max(1, Number(rating))),
      content:     content.trim(),
      images,
      isApproved:  false,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted and is pending approval.',
      data:    review,
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
    next(err);
  }
};

// ─── GET /api/reviews ──────────────────────────────────────────────────────
// Admin — all reviews with optional status filter
export const getAllReviews = async (req, res, next) => {
  try {
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.status === 'pending')  filter.isApproved = false;
    if (req.query.status === 'approved') filter.isApproved = true;

    const search = (req.query.search || '').trim();
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ userName: rx }, { content: rx }, { productSlug: rx }];
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('productId', 'name image slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    res.json({ success: true, total, page, totalPages: Math.ceil(total / limit), data: reviews });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/reviews/:id/status ────────────────────────────────────────
// Admin — approve or reject a review
export const updateReviewStatus = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: req.body.isApproved === true || req.body.isApproved === 'true' },
      { returnDocument: 'after' }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    await syncRating(review.productId);
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/reviews/:id ───────────────────────────────────────────────
// Admin — hard delete + remove images from disk
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.images.forEach(deleteFile);
    await syncRating(review.productId);

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
