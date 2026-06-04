import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);
