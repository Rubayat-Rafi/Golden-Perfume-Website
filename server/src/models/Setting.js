import mongoose from 'mongoose';

// Simple key/value store for small app-wide settings (e.g. audit retention).
const settingSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model('Setting', settingSchema);
