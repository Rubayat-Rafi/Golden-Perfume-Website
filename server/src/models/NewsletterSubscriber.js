import mongoose from 'mongoose';

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
