import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    image:    { type: String, required: true },          // /uploads/banners/xxx.jpg
    link:     { type: String, default: '' },             // "/shop" or "https://…"
    title:    { type: String, default: '' },             // alt text / admin label
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

bannerSchema.index({ order: 1 });

export default mongoose.model('Banner', bannerSchema);
