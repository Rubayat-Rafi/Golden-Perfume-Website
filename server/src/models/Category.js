import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    slug:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Parent category slug ('' = top-level). Enables Category → Sub → Sub-Sub trees.
    parent:   { type: String, default: '', index: true },
    image:    { type: String, default: '' },
    order:    { type: Number, default: 0 },     // controls display sort order
    isActive: { type: Boolean, default: true },
    gender:         { type: [String], enum: ['male', 'female', 'all'], default: [] },
    seoTitle:       { type: String, default: '' },
    seoDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

// order index for fast sorted listing (slug index is created by unique:true above)
categorySchema.index({ order: 1 });

export default mongoose.model('Category', categorySchema);