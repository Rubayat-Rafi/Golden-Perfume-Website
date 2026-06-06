import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema(
  {
    code:           { type: String, required: true, unique: true, uppercase: true, trim: true },
    type:           { type: String, enum: ['percent', 'fixed'], required: true },
    value:          { type: Number, required: true, min: 0 },   // % or $ amount off
    minOrderAmount: { type: Number, default: 0 },               // minimum subtotal to apply
    applicableTo:   { type: String, enum: ['all', 'b2c', 'b2b'], default: 'all' },
    usageLimit:     { type: Number, default: 0 },               // 0 = unlimited
    usedCount:      { type: Number, default: 0 },
    expiresAt:      { type: Date, default: null },
    isActive:       { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Note: the `code` index is created automatically by `unique: true` above.

// Convenience: check if code is currently usable
promoCodeSchema.methods.isValid = function (subtotal, customerType) {
  if (!this.isActive) return { ok: false, reason: 'Promo code is inactive' };
  if (this.expiresAt && new Date() > this.expiresAt) return { ok: false, reason: 'Promo code has expired' };
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) return { ok: false, reason: 'Promo code usage limit reached' };
  if (subtotal < this.minOrderAmount) return { ok: false, reason: `Minimum order of $${this.minOrderAmount.toFixed(2)} required` };
  if (this.applicableTo !== 'all' && this.applicableTo !== customerType) return { ok: false, reason: `Promo code not valid for ${customerType} orders` };
  return { ok: true };
};

// Calculate discount amount
promoCodeSchema.methods.calcDiscount = function (subtotal) {
  if (this.type === 'percent') return Math.round((subtotal * this.value) / 100 * 100) / 100;
  return Math.min(this.value, subtotal);  // fixed discount can't exceed subtotal
};

export default mongoose.model('PromoCode', promoCodeSchema);
