import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    slug:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    image:    { type: String, default: '' },
    order:    { type: Number, default: 0 },     // controls display sort order
    isActive: { type: Boolean, default: true },  // soft-delete / hide
  },
  { timestamps: true }
);

// order index for fast sorted listing (slug index is created by unique:true above)
categorySchema.index({ order: 1 });

export default mongoose.model('Category', categorySchema);