import mongoose from 'mongoose';

// Immutable record of an admin/staff action — powers the History page.
const auditLogSchema = new mongoose.Schema(
  {
    action:     { type: String, enum: ['create', 'update', 'delete'], required: true, index: true },
    entity:     { type: String, required: true, index: true }, // product | category | banner | promo
    entityId:   { type: String, default: '' },
    entityName: { type: String, default: '' },

    // Who performed it (denormalised so logs survive user deletion)
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: 'System' },
    userRole: { type: String, default: '' },

    // Optional extra context (changed fields, before/after snippets, etc.)
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
