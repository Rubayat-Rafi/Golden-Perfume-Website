import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify access token — attaches req.user on success
export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Optional auth — attaches req.user if a valid token is present, otherwise continues as guest.
// Use on public routes that need to personalise the response (e.g. wholesale price visibility).
export const optionalAuth = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('role permissions');
    if (user) req.user = user;
  } catch {
    // invalid / expired token — treat as guest
  }
  next();
};

// Role guard — use after protect()
// Usage: requireRole('admin') or requireRole('wholesale', 'admin')
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

// Admin-panel permission guard — use after protect().
// Admins always pass; staff pass only if they hold the section permission.
// Usage: requirePermission('orders')
export const requirePermission = (section) => (req, res, next) => {
  const u = req.user;
  if (u?.role === 'admin') return next();
  if (u?.role === 'staff' && u.permissions?.includes(section)) return next();
  return res.status(403).json({ success: false, message: 'Access denied' });
};