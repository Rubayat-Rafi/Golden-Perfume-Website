import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import WholesaleApplication from '../models/WholesaleApplication.js';

// ─── Token helpers ─────────────────────────────────────────────────────────

const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const sendTokens = (res, user, statusCode = 200) => {
  const accessToken  = signAccess(user._id);
  const refreshToken = signRefresh(user._id);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: user.toPublic(),
  });
};

// ─── POST /api/auth/register ───────────────────────────────────────────────

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, passwordHash: password, phone: phone || '' });

    // Store refresh token
    const refreshToken = signRefresh(user._id);
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } }, { returnDocument: 'after' });

    sendTokens(res, user, 201);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ──────────────────────────────────────────────────

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const refreshToken = signRefresh(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.json({
      success: true,
      accessToken: signAccess(user._id),
      user: user.toPublic(),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/logout ─────────────────────────────────────────────────

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      // Remove this device's refresh token
      await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: token } });
    }

    res.clearCookie('refreshToken', COOKIE_OPTS);
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/refresh ────────────────────────────────────────────────

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token)
      return res.status(401).json({ success: false, message: 'No refresh token' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(token))
      return res.status(401).json({ success: false, message: 'Refresh token revoked' });

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const newRefresh = signRefresh(user._id);
    user.refreshTokens.push(newRefresh);
    await user.save();

    res.cookie('refreshToken', newRefresh, COOKIE_OPTS);
    res.json({ success: true, accessToken: signAccess(user._id) });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ──────────────────────────────────────────────────────

export const me = (req, res) => {
  res.json({ success: true, user: req.user.toPublic() });
};

// ─── POST /api/auth/wholesale-apply ───────────────────────────────────────

export const wholesaleApply = async (req, res, next) => {
  try {
    const {
      // Account credentials
      password,
      // Business
      businessName, businessType, ein, licenseNumber,
      // Contact
      contactName, email, phone, address,
      // Intent
      monthlyOrderRange, productInterests,
      // Terms
      agreeToTerms,
    } = req.body;

    if (!agreeToTerms)
      return res.status(400).json({ success: false, message: 'You must agree to the Wholesale Terms' });

    if (!businessName || !businessType || !contactName || !email || !phone || !address?.street)
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });

    if (!password || password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });

    // Create user with customer role — upgraded to wholesale on admin approval
    const user = await User.create({
      name:         contactName,
      email,
      passwordHash: password,
      phone,
    });

    // Create the application
    const application = await WholesaleApplication.create({
      userId:            user._id,
      businessName,      businessType,
      ein:               ein || '',
      licenseNumber:     licenseNumber || '',
      contactName,       email,    phone,
      address,
      monthlyOrderRange: monthlyOrderRange || '',
      productInterests:  productInterests  || [],
    });

    // Link application to user
    await User.findByIdAndUpdate(user._id, { wholesaleApplicationId: application._id }, { returnDocument: 'after' });

    res.status(201).json({
      success: true,
      message: 'Application submitted. We will review it within 2 business days.',
    });
  } catch (err) {
    next(err);
  }
};