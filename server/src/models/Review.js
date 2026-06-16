import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productSlug: { type: String, required: true },
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName:    { type: String, required: true },
    userImage:   { type: String, default: '' },
    rating:      { type: Number, required: true, min: 1, max: 5 },
    content:     { type: String, required: true, trim: true, minlength: 10 },
    images:      { type: [String], default: [] },
    isApproved:  { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
