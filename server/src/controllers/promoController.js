import PromoCode from '../models/PromoCode.js';
import { logAction } from '../utils/audit.js';

// ─── POST /api/promo/validate ──────────────────────────────────────────────
// Auth — validate a promo code at checkout and return the discount amount
// Body: { code, subtotal }
export const validatePromo = async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code)
      return res.status(400).json({ success: false, message: 'Promo code is required' });

    const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() });
    if (!promo)
      return res.status(404).json({ success: false, message: 'Promo code not found' });

    const customerType = (req.user?.role === 'wholesale' || req.user?.role === 'admin') ? 'b2b' : 'b2c';
    const check = promo.isValid(Number(subtotal), customerType);

    if (!check.ok)
      return res.status(400).json({ success: false, message: check.reason });

    const discount = promo.calcDiscount(Number(subtotal));

    res.json({
      success:  true,
      code:     promo.code,
      type:     promo.type,
      value:    promo.value,
      discount,
      message:  promo.type === 'percent' ? `${promo.value}% off applied` : `$${promo.value.toFixed(2)} off applied`,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/promo ────────────────────────────────────────────────────────
// Admin — list all promo codes
export const getPromos = async (req, res, next) => {
  try {
    const { active, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (active === '1') filter.isActive = true;
    if (active === '0') filter.isActive = false;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await PromoCode.countDocuments(filter);

    const promos = await PromoCode.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count:      promos.length,
      data:       promos,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/promo ───────────────────────────────────────────────────────
// Admin — create a new promo code
export const createPromo = async (req, res, next) => {
  try {
    const { code, type, value, minOrderAmount, applicableTo, usageLimit, expiresAt } = req.body;

    if (!code || !type || value === undefined)
      return res.status(400).json({ success: false, message: 'code, type and value are required' });

    if (!['percent', 'fixed'].includes(type))
      return res.status(400).json({ success: false, message: 'type must be "percent" or "fixed"' });

    if (type === 'percent' && (value <= 0 || value > 100))
      return res.status(400).json({ success: false, message: 'Percent discount must be between 1 and 100' });

    const exists = await PromoCode.findOne({ code: code.toUpperCase().trim() });
    if (exists)
      return res.status(409).json({ success: false, message: 'Promo code already exists' });

    const promo = await PromoCode.create({
      code,
      type,
      value:          Number(value),
      minOrderAmount: Number(minOrderAmount ?? 0),
      applicableTo:   applicableTo || 'all',
      usageLimit:     Number(usageLimit ?? 0),
      expiresAt:      expiresAt || null,
    });

    logAction(req, { action: 'create', entity: 'promo', entityId: promo._id, entityName: promo.code });
    res.status(201).json({ success: true, data: promo });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/promo/:id ────────────────────────────────────────────────────
// Admin — update a promo code (toggle active, change limits, etc.)
export const updatePromo = async (req, res, next) => {
  try {
    const allowed = ['value', 'minOrderAmount', 'applicableTo', 'usageLimit', 'expiresAt', 'isActive'];
    const update  = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    const promo = await PromoCode.findByIdAndUpdate(
      req.params.id,
      update,
      { returnDocument: 'after', runValidators: true }
    );

    if (!promo)
      return res.status(404).json({ success: false, message: 'Promo code not found' });

    logAction(req, { action: 'update', entity: 'promo', entityId: promo._id, entityName: promo.code });
    res.json({ success: true, data: promo });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/promo/:id ─────────────────────────────────────────────────
// Admin — soft-delete by deactivating
export const deletePromo = async (req, res, next) => {
  try {
    const promo = await PromoCode.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { returnDocument: 'after' }
    );
    if (!promo)
      return res.status(404).json({ success: false, message: 'Promo code not found' });

    logAction(req, { action: 'delete', entity: 'promo', entityId: promo._id, entityName: promo.code });
    res.json({ success: true, message: 'Promo code deactivated', data: promo });
  } catch (err) {
    next(err);
  }
};
