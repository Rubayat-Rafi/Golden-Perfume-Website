import mongoose from 'mongoose';

const wholesaleApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Business info
    businessName:   { type: String, required: true, trim: true },
    businessType:   { type: String, required: true },
    ein:            { type: String, default: '' },
    licenseNumber:  { type: String, default: '' },

    // Contact
    contactName: { type: String, required: true },
    email:       { type: String, required: true, lowercase: true },
    phone:       { type: String, required: true },
    address: {
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      zip:     { type: String, required: true },
    },

    // Intent
    monthlyOrderRange: { type: String, default: '' },
    productInterests:  { type: [String], default: [] },

    // Review
    status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote:   { type: String, default: '' },
    reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt:  { type: Date },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('WholesaleApplication', wholesaleApplicationSchema);