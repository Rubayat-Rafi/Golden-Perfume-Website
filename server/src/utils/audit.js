import AuditLog from '../models/AuditLog.js';

// Record an admin action. Fire-and-forget — never blocks or breaks the request.
export const logAction = (req, { action, entity, entityId, entityName, meta }) => {
  Promise.resolve()
    .then(() =>
      AuditLog.create({
        action,
        entity,
        entityId:   entityId ? String(entityId) : '',
        entityName: entityName || '',
        user:       req?.user?._id,
        userName:   req?.user?.name || 'System',
        userRole:   req?.user?.role || '',
        meta:       meta || {},
      })
    )
    .catch((e) => console.error('[audit] log failed:', e.message));
};
