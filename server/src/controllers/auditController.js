import AuditLog from '../models/AuditLog.js';
import Setting from '../models/Setting.js';

const DAY = 86400000;
const RETENTION_KEY = 'auditRetentionDays';
const DEFAULT_RETENTION = 60;

const escapeRx  = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parseISO  = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(s || '') ? new Date(`${s}T00:00:00.000Z`) : null);

// Build a Mongo filter from query/body params shared by list + purge
const buildFilter = (src) => {
  const filter = {};
  if (src.entity) filter.entity = src.entity;
  if (src.action) filter.action = src.action;

  const search = (src.search || '').trim();
  if (search) {
    const rx = new RegExp(escapeRx(search), 'i');
    filter.$or = [{ entityName: rx }, { userName: rx }];
  }

  const from = parseISO(src.from);
  const to   = parseISO(src.to);
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = from;
    if (to)   filter.createdAt.$lt  = new Date(to.getTime() + DAY);
  }
  return filter;
};

// ─── GET /api/admin/audit ──────────────────────────────────────────────────
export const getAuditLogs = async (req, res, next) => {
  try {
    const page  = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = buildFilter(req.query);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ success: true, total, page, totalPages: Math.ceil(total / limit), data: logs });
  } catch (err) {
    next(err);
  }
};

// ─── Retention setting helpers ─────────────────────────────────────────────
export const getAuditRetention = async () => {
  const s = await Setting.findOne({ key: RETENTION_KEY });
  const v = Number(s?.value);
  return Number.isFinite(v) && v >= 0 ? v : DEFAULT_RETENTION;
};

// GET /api/admin/audit/settings
export const getAuditSettings = async (_req, res, next) => {
  try {
    res.json({ success: true, data: { retentionDays: await getAuditRetention() } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/audit/settings  body: { retentionDays }  (0 = keep forever)
export const updateAuditSettings = async (req, res, next) => {
  try {
    let days = Number(req.body.retentionDays);
    if (!Number.isFinite(days) || days < 0)
      return res.status(400).json({ success: false, message: 'retentionDays must be 0 or a positive number' });
    days = Math.min(3650, Math.floor(days));
    await Setting.findOneAndUpdate({ key: RETENTION_KEY }, { value: days }, { upsert: true });
    res.json({ success: true, data: { retentionDays: days } });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/admin/audit/:id ───────────────────────────────────────────
export const deleteAuditLog = async (req, res, next) => {
  try {
    const log = await AuditLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Log entry not found' });
    res.json({ success: true, message: 'Log entry deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/audit/purge ───────────────────────────────────────────
// Delete logs by current filters, older-than-N-days, or all (explicit).
export const purgeAuditLogs = async (req, res, next) => {
  try {
    const filter = buildFilter(req.body);

    if (req.body.olderThanDays !== undefined) {
      const n = Number(req.body.olderThanDays);
      if (Number.isFinite(n) && n >= 0) {
        filter.createdAt = { ...(filter.createdAt || {}), $lt: new Date(Date.now() - n * DAY) };
      }
    }

    // Refuse an unscoped wipe unless explicitly confirmed with all:true
    if (Object.keys(filter).length === 0 && req.body.all !== true) {
      return res.status(400).json({ success: false, message: 'Provide a filter, olderThanDays, or all:true' });
    }

    const result = await AuditLog.deleteMany(filter);
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    next(err);
  }
};

// ─── Background sweep — auto-delete logs past the retention window ──────────
export const sweepOldAuditLogs = async () => {
  try {
    const days = await getAuditRetention();
    if (!days || days <= 0) return; // 0 = keep forever
    const cutoff = new Date(Date.now() - days * DAY);
    const r = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });
    if (r.deletedCount) console.log(`[audit sweep] removed ${r.deletedCount} log(s) older than ${days} days`);
  } catch (err) {
    console.error('[audit sweep]', err.message);
  }
};
