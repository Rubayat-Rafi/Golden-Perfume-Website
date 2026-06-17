import Order from '../models/Order.js';
import Product from '../models/Product.js';
import WholesaleApplication from '../models/WholesaleApplication.js';
import ContactMessage from '../models/ContactMessage.js';
import User from '../models/User.js';
import { logAction } from '../utils/audit.js';

// ─── GET /api/admin/stats ──────────────────────────────────────────────────
// Admin — aggregated KPIs for the dashboard
export const getStats = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      ordersToday,
      pendingOrders,
      pendingApplications,
      totalProducts,
      totalCustomers,
      unreadMessages,
      revenueAgg,
      channelAgg,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.countDocuments({ fulfillmentStatus: 'pending' }),
      WholesaleApplication.countDocuments({ status: 'pending' }),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $in: ['customer', 'wholesale'] } }),
      ContactMessage.countDocuments({ isRead: false }),

      // Paid revenue total
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),

      // Revenue + order count split by customer type (all orders)
      Order.aggregate([
        { $group: { _id: '$customerType', revenue: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
      ]),

      // 5 most recent orders
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNumber customerType grandTotal fulfillmentStatus paymentStatus createdAt'),
    ]);

    const paidRevenue = revenueAgg[0]?.total ?? 0;

    const channels = { b2c: { revenue: 0, count: 0 }, b2b: { revenue: 0, count: 0 } };
    channelAgg.forEach((c) => {
      if (c._id === 'b2c' || c._id === 'b2b') {
        channels[c._id] = { revenue: c.revenue, count: c.count };
      }
    });

    res.json({
      success: true,
      data: {
        kpis: {
          totalOrders,
          ordersToday,
          pendingOrders,
          paidRevenue: Math.round(paidRevenue * 100) / 100,
          pendingApplications,
          totalProducts,
          totalCustomers,
          unreadMessages,
        },
        channels,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/revenue ────────────────────────────────────────────────
// Admin — revenue & order time-series for the dashboard chart.
// Query: range = 7d | 30d | 90d | 12m  (or custom: from=YYYY-MM-DD&to=YYYY-MM-DD),
//        channel = all | b2c | b2b, paidOnly = 1
const DAY = 86400000;
const parseISODate = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const getRevenueSeries = async (req, res, next) => {
  try {
    const channel  = ['b2c', 'b2b'].includes(req.query.channel) ? req.query.channel : null;
    const paidOnly = req.query.paidOnly === '1' || req.query.paidOnly === 'true';

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Resolve the window: custom from/to wins, otherwise a preset range
    let start, endInclusive, range;
    const fromD = parseISODate(req.query.from);
    const toD   = parseISODate(req.query.to);

    if (fromD && toD && fromD <= toD) {
      // Cap custom ranges to ~3 years to keep the response bounded
      const cappedFrom = new Date(Math.max(fromD.getTime(), toD.getTime() - 1095 * DAY));
      start = cappedFrom;
      endInclusive = toD;
      range = 'custom';
    } else {
      range = ['7d', '30d', '90d', '12m'].includes(req.query.range) ? req.query.range : '30d';
      endInclusive = todayUTC;
      if (range === '12m') {
        start = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth() - 11, 1));
      } else {
        const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
        start = new Date(todayUTC.getTime() - (days - 1) * DAY);
      }
    }

    // Bucket by month when the span is long, otherwise by day
    const spanDays = Math.round((endInclusive - start) / DAY) + 1;
    const monthly  = spanDays > 92;
    const endExclusive = new Date(endInclusive.getTime() + DAY);

    const match = { createdAt: { $gte: start, $lt: endExclusive } };
    if (channel) match.customerType = channel;
    if (paidOnly) match.paymentStatus = 'paid';

    const fmt = monthly ? '%Y-%m' : '%Y-%m-%d';
    const agg = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id:     { $dateToString: { format: fmt, date: '$createdAt', timezone: 'UTC' } },
          revenue: { $sum: '$grandTotal' },
          orders:  { $sum: 1 },
        },
      },
    ]);
    const map = Object.fromEntries(agg.map((a) => [a._id, a]));
    const pad = (n) => String(n).padStart(2, '0');

    // Build a continuous axis so gaps render as zero
    const series = [];
    const push = (key, label) => {
      const e = map[key];
      series.push({ label, revenue: Math.round((e?.revenue || 0) * 100) / 100, orders: e?.orders || 0 });
    };
    if (monthly) {
      let y = start.getUTCFullYear(), m = start.getUTCMonth();
      const endY = endInclusive.getUTCFullYear(), endM = endInclusive.getUTCMonth();
      while (y < endY || (y === endY && m <= endM)) {
        const d = new Date(Date.UTC(y, m, 1));
        push(`${y}-${pad(m + 1)}`, `${d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })} ${String(y).slice(2)}`);
        if (++m > 11) { m = 0; y++; }
      }
    } else {
      const days = Math.round((endExclusive - start) / DAY);
      for (let i = 0; i < days; i++) {
        const d = new Date(start.getTime() + i * DAY);
        push(
          `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
          d.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
        );
      }
    }

    const totalRevenue  = Math.round(series.reduce((s, p) => s + p.revenue, 0) * 100) / 100;
    const totalOrders   = series.reduce((s, p) => s + p.orders, 0);
    const avgOrderValue = totalOrders ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

    res.json({
      success: true,
      data: {
        range,
        channel: channel || 'all',
        paidOnly,
        series,
        summary: { totalRevenue, totalOrders, avgOrderValue },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/users ──────────────────────────────────────────────────
// Admin — list users (customers), filterable by role + search, with order stats
export const getUsers = async (req, res, next) => {
  try {
    const { search, deletion, page = 1, limit = 20 } = req.query;

    // Customers page — retail customers only (wholesale/staff/admin have their own sections)
    const filter = { role: 'customer' };
    if (deletion === '1') filter.deletionStatus = 'pending';
    if (search) {
      const rx = { $regex: search, $options: 'i' };
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    // One aggregation for order count + total spent across this page of users
    const ids = users.map((u) => u._id);
    const stats = await Order.aggregate([
      { $match: { user: { $in: ids } } },
      { $group: { _id: '$user', orderCount: { $sum: 1 }, totalSpent: { $sum: '$grandTotal' } } },
    ]);
    const statMap = Object.fromEntries(stats.map((s) => [String(s._id), s]));

    const data = users.map((u) => ({
      ...u.toPublic(),
      orderCount: statMap[String(u._id)]?.orderCount ?? 0,
      totalSpent: Math.round((statMap[String(u._id)]?.totalSpent ?? 0) * 100) / 100,
    }));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count:      data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/users/:id ──────────────────────────────────────────────
// Admin/permitted staff — full customer detail + order history
export const getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const orders = await Order.find({ user: user._id })
      .populate('items.product', 'name image slug')
      .sort({ createdAt: -1 })
      .limit(50);

    const orderCount = orders.length;
    const totalSpent = Math.round(orders.reduce((s, o) => s + (o.grandTotal || 0), 0) * 100) / 100;
    const paidSpent  = Math.round(
      orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + (o.grandTotal || 0), 0) * 100
    ) / 100;

    res.json({
      success: true,
      data: {
        user: user.toPublic(),
        stats: { orderCount, totalSpent, paidSpent },
        orders,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/admin/users/:id/deletion-reject ────────────────────────────
// Admin — reject a pending account-deletion request
export const rejectDeletion = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.deletionStatus = 'rejected';
    user.deletionRequestedAt = null;
    await user.save();

    res.json({ success: true, message: 'Deletion request rejected', data: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// Background sweep — auto-approve (delete) accounts whose deletion request
// has been pending for more than 3 days. Run on startup + on an interval.
export const sweepExpiredDeletions = async () => {
  try {
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const expired = await User.find({
      deletionStatus: 'pending',
      deletionRequestedAt: { $lte: cutoff },
      role: { $in: ['customer', 'wholesale'] },
    });
    for (const u of expired) {
      await WholesaleApplication.deleteMany({ userId: u._id });
      await u.deleteOne();
    }
    if (expired.length) console.log(`[deletion sweep] auto-approved ${expired.length} account deletion(s)`);
  } catch (err) {
    console.error('[deletion sweep]', err.message);
  }
};

// ─── DELETE /api/admin/users/:id ───────────────────────────────────────────
// Admin — delete a customer or wholesale account (cascades its application).
// Staff/admin accounts must be managed in the Staff & Admins section.
export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id))
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (['admin', 'staff'].includes(user.role))
      return res.status(400).json({ success: false, message: 'Manage staff/admin accounts in Staff & Admins' });

    // Cascade: remove any wholesale application tied to this user
    await WholesaleApplication.deleteMany({ userId: user._id });
    await user.deleteOne();

    logAction(req, { action: 'delete', entity: 'customer', entityId: user._id, entityName: user.name, meta: { email: user.email } });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
};

// Sections a staff member can be granted access to (must match the admin nav)
export const STAFF_SECTIONS = ['dashboard', 'banners', 'orders', 'wholesale', 'products', 'categories', 'customers', 'promos', 'messages'];

const cleanPermissions = (perms) =>
  Array.isArray(perms) ? perms.filter((p) => STAFF_SECTIONS.includes(p)) : [];

// ─── GET /api/admin/staff ──────────────────────────────────────────────────
// Admin — paginated list of staff + admin team members
export const getStaff = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = { role: { $in: ['staff', 'admin'] } };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);

    const team = await User.find(filter)
      .sort({ role: 1, createdAt: -1 })   // admins first
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count:      team.length,
      data:       team.map((u) => u.toPublic()),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/staff ─────────────────────────────────────────────────
// Admin — create a staff account with chosen route permissions
export const createStaff = async (req, res, next) => {
  try {
    const { name, email, password, permissions } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: 'staff',
      permissions: cleanPermissions(permissions),
    });

    logAction(req, { action: 'create', entity: 'staff', entityId: user._id, entityName: user.name, meta: { email: user.email } });
    res.status(201).json({ success: true, data: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/admin/staff/:id ────────────────────────────────────────────
// Admin — update a staff member's permissions / name
export const updateStaff = async (req, res, next) => {
  try {
    const { name, permissions } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!['staff', 'admin'].includes(user.role))
      return res.status(400).json({ success: false, message: 'Not a staff or admin account' });

    if (name !== undefined) user.name = name;
    if (permissions !== undefined) user.permissions = cleanPermissions(permissions);
    await user.save();

    logAction(req, { action: 'update', entity: 'staff', entityId: user._id, entityName: user.name });
    res.json({ success: true, data: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/admin/staff/:id ───────────────────────────────────────────
// Admin — remove a staff member (cannot delete yourself or another admin)
export const deleteStaff = async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id))
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin')
      return res.status(400).json({ success: false, message: 'Admin accounts cannot be removed here' });

    await user.deleteOne();
    logAction(req, { action: 'delete', entity: 'staff', entityId: user._id, entityName: user.name, meta: { email: user.email } });
    res.json({ success: true, message: 'Staff member removed' });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/admin/users/:id/role ───────────────────────────────────────
// Admin — change a user's role (cannot change own role to avoid lockout)
export const updateUserRole = async (req, res, next) => {
  try {
    const VALID = ['customer', 'wholesale', 'staff', 'admin'];
    const { role } = req.body;

    if (!VALID.includes(role))
      return res.status(400).json({ success: false, message: `role must be one of: ${VALID.join(', ')}` });

    if (req.params.id === String(req.user._id))
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { returnDocument: 'after', runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    logAction(req, { action: 'update', entity: 'staff', entityId: user._id, entityName: user.name, meta: { role } });
    res.json({ success: true, data: user.toPublic() });
  } catch (err) {
    next(err);
  }
};
