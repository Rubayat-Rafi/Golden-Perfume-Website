import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  authorName:  { type: String, required: true },
  authorImage: { type: String, default: '' },
  rating:      { type: Number, required: true, min: 1, max: 5 },
  content:     { type: String, required: true },
  date:        { type: String, default: '' },
}, { _id: false });

const variantSchema = new mongoose.Schema({
  sku:            { type: String, required: true },
  size:           { type: String, required: true },
  retailPrice:    { type: Number, required: true, min: 0 },
  wholesalePrice: { type: Number, default: 0, min: 0 },
  weight:         { type: String, default: '' },
  inStock:        { type: Boolean, default: true },
  stockQty:       { type: Number, default: 0 },
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    productNumber: { type: String, required: true, unique: true, trim: true },
    name:          { type: String, required: true, trim: true },
    slug:          { type: String, required: true, unique: true, lowercase: true, trim: true },

    // Category stored as both slug (for filtering) and display name
    categorySlug: { type: String, required: true, index: true },
    categoryName: { type: String, required: true },

    gender:      { type: String, enum: ['Men', 'Women', 'Unisex', ''], default: '' },
    description: { type: String, default: '' },
    content:     { type: String, default: '' },

    image:        { type: String, default: '' },
    imageGallery: { type: [String], default: [] },

    isSale:     { type: Boolean, default: false, index: true },
    isNew:      { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive:   { type: Boolean, default: true,  index: true },
    isStocked:  { type: Boolean, default: true },

    tags:     { type: [String], default: [] },
    variants: { type: [variantSchema], default: [] },
    reviews:  { type: [reviewSchema], default: [] },

    // Cached aggregates — updated on review add/edit
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

// Text index for full-text search across name + description + content
productSchema.index({ name: 'text', description: 'text', content: 'text' });

// Computed min/max retail price helpers (used in API response)
productSchema.virtual('priceMin').get(function () {
  if (!this.variants?.length) return 0;
  return Math.min(...this.variants.map((v) => v.retailPrice));
});

productSchema.virtual('priceMax').get(function () {
  if (!this.variants?.length) return 0;
  return Math.max(...this.variants.map((v) => v.retailPrice));
});

productSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Product', productSchema);
