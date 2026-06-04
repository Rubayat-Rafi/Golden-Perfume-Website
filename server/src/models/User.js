import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label:     { type: String, default: 'Home' },
  street:    { type: String, required: true },
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  zip:       { type: String, required: true },
  country:   { type: String, default: 'US' },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role:     { type: String, enum: ['customer', 'wholesale', 'staff', 'admin'], default: 'customer' },
    phone:    { type: String, default: '' },
    addresses: [addressSchema],
    wholesaleApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'WholesaleApplication' },
    // stored refresh tokens — supports multiple devices; cleared on logout
    refreshTokens: { type: [String], select: false, default: [] },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

// Compare plain password against stored hash
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Safe public projection (no hash, no tokens)
userSchema.methods.toPublic = function () {
  return {
    _id:       this._id,
    name:      this.name,
    email:     this.email,
    role:      this.role,
    phone:     this.phone,
    addresses: this.addresses,
    wholesaleApplicationId: this.wholesaleApplicationId,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);